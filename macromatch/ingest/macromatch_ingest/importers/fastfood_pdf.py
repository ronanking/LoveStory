"""Importer skeleton (P2): Australian fast-food chains' published nutrition PDFs.

Design (per-chain profile, one PDF ~= one release):
  * Fetching goes through compliance.PoliteFetcher only — robots.txt honoured,
    honest User-Agent, >=5 s between requests, PDFs cached locally so each
    document is downloaded once per menu release.
  * Parsing uses pdfplumber table extraction with a per-chain column profile
    (chains publish per-serving values, so basis='per_serving' and the shared
    pipeline rescales to per-100 g using the published serving weight).
  * Any row that fails the profile goes to the review queue as 'parse_error' —
    a layout change must never silently produce wrong macros.

Each chain profile is data, not code: {url, header_aliases, serving_col, ...},
so onboarding a new chain is a config entry plus a fixture test.
"""
from typing import Iterator, Optional
from ..models import RawRecord
from .base import BaseImporter


class FastFoodPDFImporter(BaseImporter):
    source_id = "fastfood_au"   # one sub-source row per chain in production

    def iter_raw(self, input_ref: str, resume_after: Optional[str]) -> Iterator[tuple[str, RawRecord]]:
        raise NotImplementedError(
            "Per-chain PDF profiles land in phase P2 — see docs/SOURCES_REPORT.md §4. "
            "Requires: pip install pdfplumber, plus a reviewed ToS note per chain.")
