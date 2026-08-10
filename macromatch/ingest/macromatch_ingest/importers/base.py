"""BaseImporter: the shared pipeline every source importer inherits.

A concrete importer implements:
    source_id      — must match a licence-cleared row in food_sources
    iter_raw()     — yield (cursor, RawRecord) in a stable, resumable order

BaseImporter then handles: licence gate, normalisation to per-100g canonical
units, validation flags, duplicate detection, review-queue entries, batched
upserts with checkpointing, structured logging, and a run summary.
"""
from __future__ import annotations

import logging
from typing import Iterator, Optional

from ..compliance import assert_licence_cleared
from ..dedupe import DuplicateIndex
from ..models import Food, RawRecord, utcnow
from ..store import BaseStore
from ..units import kj_to_kcal, per_serving_to_per_100
from ..validation import review_reason, validate

log = logging.getLogger("macromatch.importer")

NUTRIENT_FIELDS = ("energy_kj", "energy_kcal", "protein_g", "carbs_g",
                   "sugars_g", "fat_g", "sat_fat_g", "sodium_mg")


class BaseImporter:
    source_id: str = ""
    source_version: Optional[str] = None
    batch_size: int = 500

    def __init__(self, store: BaseStore) -> None:
        self.store = store

    # ---- to be implemented by each source ------------------------------
    def iter_raw(self, input_ref: str, resume_after: Optional[str]) -> Iterator[tuple[str, RawRecord]]:
        """Yield (cursor, RawRecord). Cursor must be monotonically comparable
        within a run (row number as zero-padded string is fine)."""
        raise NotImplementedError

    # ---- shared pipeline -------------------------------------------------
    def normalise(self, rec: RawRecord) -> Food:
        n = rec.nutrients
        food = Food(
            source_id=self.source_id, external_id=rec.external_id, name=rec.name,
            source_url=rec.source_url, raw=rec.raw, retrieved_at=utcnow().isoformat(),
            brand=rec.brand, category=rec.category, barcode=rec.barcode,
            is_liquid=rec.is_liquid, serving_size_desc=rec.serving_size_desc,
            serving_weight_g=rec.serving_weight_g, source_version=rec.source_version or self.source_version,
        )
        if rec.basis in ("per_100g", "per_100ml"):
            scale = lambda v: v  # noqa: E731
        elif rec.basis == "per_serving":
            scale = lambda v: per_serving_to_per_100(v, rec.serving_weight_g)  # noqa: E731
            if not rec.serving_weight_g:
                food.quality_flags.append("per_serving_without_weight")
        else:
            raise ValueError(f"unknown basis {rec.basis!r}")

        food.energy_kj_100 = scale(n.get("energy_kj"))
        food.energy_kcal_100 = scale(n.get("energy_kcal"))
        if food.energy_kcal_100 is None and food.energy_kj_100 is not None:
            food.energy_kcal_100 = kj_to_kcal(food.energy_kj_100)  # unit conversion, not invention
        food.protein_g_100 = scale(n.get("protein_g"))
        food.carbs_g_100 = scale(n.get("carbs_g"))
        food.sugars_g_100 = scale(n.get("sugars_g"))
        food.fat_g_100 = scale(n.get("fat_g"))
        food.sat_fat_g_100 = scale(n.get("sat_fat_g"))
        food.sodium_mg_100 = scale(n.get("sodium_mg"))
        return food.finalise()

    def run(self, input_ref: str, resume: bool = True, limit: Optional[int] = None) -> dict:
        src = assert_licence_cleared(self.store, self.source_id)
        log.info("source '%s' licence-cleared (%s)", self.source_id, src.get("licence"))

        resume_after = self.store.get_resume_checkpoint(self.source_id, input_ref) if resume else None
        if resume_after:
            log.info("resuming after checkpoint %s", resume_after)
        run_id = self.store.start_run(self.source_id, input_ref)

        index = DuplicateIndex()
        index.bulk_load(self.store.iter_food_index())

        stats = {"seen": 0, "upserted": 0, "suspect": 0, "dup_candidates": 0,
                 "errors": 0, "skipped_resume": bool(resume_after)}
        batch: list[Food] = []
        batch_meta: list[tuple[Food, Optional[str]]] = []
        cursor = resume_after or ""

        def flush() -> None:
            nonlocal batch, batch_meta
            if not batch:
                return
            ids = self.store.commit_batch(run_id, batch, cursor)
            for fid, (food, reason) in zip(ids, batch_meta):
                if reason:
                    self.store.add_review(run_id, fid, reason,
                                          {"flags": food.quality_flags,
                                           "external_id": food.external_id})
                dup = index.find(food)
                if dup and dup.existing_id != fid:
                    stats["dup_candidates"] += 1
                    self.store.add_duplicate(dup.existing_id, fid, dup.match_type, dup.score)
                index.add(fid, food.barcode, food.natural_key, food.brand, food.name)
            stats["upserted"] += len(batch)
            batch, batch_meta = [], []

        try:
            for cur, rec in self.iter_raw(input_ref, resume_after):
                stats["seen"] += 1
                cursor = cur
                try:
                    food = validate(self.normalise(rec),
                                    fibre_g_100=rec.raw.get("_fibre_g_100"))
                except Exception as e:  # single bad row must not kill the run
                    stats["errors"] += 1
                    log.exception("row %s failed to normalise", rec.external_id)
                    self.store.add_review(run_id, None, "parse_error",
                                          {"external_id": rec.external_id, "error": str(e)})
                    continue
                reason = review_reason(food)
                if reason:
                    stats["suspect"] += 1
                batch.append(food)
                batch_meta.append((food, reason))
                if len(batch) >= self.batch_size:
                    flush()
                if limit and stats["seen"] >= limit:
                    break
            flush()
            self.store.finish_run(run_id, "completed", stats)
            log.info("run complete: %s", stats)
        except KeyboardInterrupt:
            flush()
            self.store.finish_run(run_id, "interrupted", stats)
            log.warning("interrupted — committed through checkpoint %s; rerun to resume", cursor)
            raise
        except Exception:
            self.store.finish_run(run_id, "failed", stats)
            raise
        return stats
