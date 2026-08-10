"""Importer skeleton (P1): Open Food Facts — Australian subset.

LICENCE-GATED ON PURPOSE. Open Food Facts is ODbL: attribution + share-alike
obligations apply to a database substantially derived from it. Do not set
licence_cleared=true for source 'off_au' until product/legal signs off on how
MacroMatch will comply (attributed ODbL slice vs. runtime barcode lookups).

When cleared, the intended path is the official bulk export (JSONL/CSV dump),
filtered to countries_tags containing 'australia' — no crawling, no API abuse.
Barcode (code) becomes external_id AND barcode, enabling tier-1 deduplication
against every other branded source.
"""
from typing import Iterator, Optional
from ..models import RawRecord
from .base import BaseImporter


class OpenFoodFactsAUImporter(BaseImporter):
    source_id = "off_au"
    source_version = None  # set to the dump's export date at run time

    def iter_raw(self, input_ref: str, resume_after: Optional[str]) -> Iterator[tuple[str, RawRecord]]:
        raise NotImplementedError(
            "OFF importer is intentionally disabled until the ODbL compliance "
            "decision is recorded and licence_cleared is set for 'off_au'. "
            "See docs/SOURCES_REPORT.md §3.")
