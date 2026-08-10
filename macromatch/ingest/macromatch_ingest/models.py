"""Canonical data model for the MacroMatch ingestion pipeline.

Convention: nutrients are stored per 100 g (per 100 ml for liquids),
energy in kJ (kcal derived), macros in grams, sodium in milligrams.
The untouched source row lives in `raw` for auditing.
"""
from __future__ import annotations

import hashlib
import re
import unicodedata
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import Any, Optional


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def normalise_text(s: Optional[str]) -> str:
    """Lowercase, strip accents/punctuation/extra whitespace — for matching keys."""
    if not s:
        return ""
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-z0-9 ]+", " ", s.lower())
    return re.sub(r"\s+", " ", s).strip()


@dataclass
class RawRecord:
    """What an importer emits: source values as-published, before normalisation."""
    external_id: str
    name: str
    source_url: str
    raw: dict[str, Any]                       # the original row, untouched
    brand: Optional[str] = None
    category: Optional[str] = None
    barcode: Optional[str] = None
    is_liquid: bool = False
    serving_size_desc: Optional[str] = None
    serving_weight_g: Optional[float] = None
    # nutrient values in whatever unit/basis the source used:
    nutrients: dict[str, Optional[float]] = field(default_factory=dict)
    # basis of the nutrient values: 'per_100g' | 'per_100ml' | 'per_serving'
    basis: str = "per_100g"
    source_version: Optional[str] = None


@dataclass
class Food:
    """Canonical normalised food row (mirrors the `foods` table)."""
    source_id: str
    external_id: str
    name: str
    source_url: str
    raw: dict[str, Any]
    retrieved_at: str
    brand: Optional[str] = None
    category: Optional[str] = None
    barcode: Optional[str] = None
    is_liquid: bool = False
    serving_size_desc: Optional[str] = None
    serving_weight_g: Optional[float] = None
    energy_kj_100: Optional[float] = None
    energy_kcal_100: Optional[float] = None
    protein_g_100: Optional[float] = None
    carbs_g_100: Optional[float] = None
    sugars_g_100: Optional[float] = None
    fat_g_100: Optional[float] = None
    sat_fat_g_100: Optional[float] = None
    sodium_mg_100: Optional[float] = None
    source_version: Optional[str] = None
    confidence: str = "unverified"            # verified | unverified | suspect
    quality_flags: list[str] = field(default_factory=list)
    natural_key: str = ""

    def compute_natural_key(self) -> str:
        base = "|".join([
            normalise_text(self.brand),
            normalise_text(self.name),
            normalise_text(self.serving_size_desc) or f"{self.serving_weight_g or ''}",
        ])
        return hashlib.sha1(base.encode()).hexdigest()

    def finalise(self) -> "Food":
        self.natural_key = self.compute_natural_key()
        return self

    def to_row(self) -> dict[str, Any]:
        d = asdict(self)
        return d
