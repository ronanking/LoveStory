"""Duplicate detection.

Three tiers, in order of certainty:
  1. barcode          — exact GTIN/EAN match → certain duplicate
  2. natural_key      — sha1(normalised brand|name|serving) → near-certain
  3. fuzzy            — token-sort similarity on name within the same brand
                        bucket, >= threshold → CANDIDATE only

Fuzzy candidates are recorded in duplicate_pairs for human review.
The pipeline never auto-merges a fuzzy match.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Optional

from rapidfuzz import fuzz

from .models import Food, normalise_text

FUZZY_THRESHOLD = 92.0


@dataclass
class DupMatch:
    existing_id: str          # id/key of the food already stored
    match_type: str           # 'barcode' | 'natural_key' | 'fuzzy'
    score: float


class DuplicateIndex:
    """In-memory index over already-stored foods, fed by the store layer.

    For 100k+ rows this stays comfortably in memory (a few hundred MB max);
    brand bucketing keeps fuzzy comparisons from being O(n^2).
    """

    def __init__(self) -> None:
        self._by_barcode: dict[str, str] = {}
        self._by_natural_key: dict[str, str] = {}
        self._by_brand: dict[str, list[tuple[str, str]]] = {}   # brand -> [(id, norm_name)]

    def add(self, food_id: str, barcode: Optional[str], natural_key: str,
            brand: Optional[str], name: str) -> None:
        if barcode:
            self._by_barcode.setdefault(barcode, food_id)
        self._by_natural_key.setdefault(natural_key, food_id)
        self._by_brand.setdefault(normalise_text(brand), []).append(
            (food_id, normalise_text(name)))

    def bulk_load(self, rows: Iterable[dict]) -> None:
        for r in rows:
            self.add(r["id"], r.get("barcode"), r["natural_key"], r.get("brand"), r["name"])

    def find(self, food: Food) -> Optional[DupMatch]:
        if food.barcode and food.barcode in self._by_barcode:
            return DupMatch(self._by_barcode[food.barcode], "barcode", 100.0)
        nk = food.natural_key or food.compute_natural_key()
        if nk in self._by_natural_key:
            return DupMatch(self._by_natural_key[nk], "natural_key", 100.0)
        # fuzzy: same brand bucket only (empty brand bucket for generic foods)
        bucket = self._by_brand.get(normalise_text(food.brand), [])
        target = normalise_text(food.name)
        best: Optional[DupMatch] = None
        for fid, nname in bucket:
            score = fuzz.token_sort_ratio(target, nname)
            if score >= FUZZY_THRESHOLD and (best is None or score > best.score):
                best = DupMatch(fid, "fuzzy", float(score))
        return best
