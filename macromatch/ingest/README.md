# MacroMatch — Food Data Ingestion Pipeline

Production-oriented ingestion system that populates MacroMatch's food database
from **permitted** Australian sources, replacing the hardcoded `FOODS` array in
the React prototype. Designed for 100k+ products: batched upserts, resumable
checkpoints, tiered duplicate detection, and a human review queue for anything
the pipeline refuses to guess.

## Layout
```
schema.sql                      Supabase/Postgres schema (run first)
docs/SOURCES_REPORT.md          Source landscape, licensing, import priority
macromatch_ingest/
  models.py                     Canonical Food model (per-100g, kJ, g, mg)
  units.py                      Unit conversions (kJ<->kcal, mass, per-serving rescale)
  validation.py                 Flags missing/inconsistent data — never invents values
  dedupe.py                     barcode -> natural-key -> fuzzy (candidates only)
  compliance.py                 Licence gate, robots.txt, rate limiting, polite retries
  store.py                      SupabaseStore (prod) + SQLiteStore (dev/tests)
  importers/
    base.py                     Shared pipeline: normalise -> validate -> dedupe -> commit
    afcd.py                     P0: FSANZ AFCD importer (Excel/CSV)   [implemented]
    openfoodfacts.py            P1: ODbL-gated skeleton               [awaiting legal]
    fastfood_pdf.py             P2: per-chain PDF profiles            [next phase]
  cli.py                        Entry point
tests/                          21 tests incl. resume, idempotency, licence gate
```

## Quick start (dev, SQLite)
```bash
pip install -r requirements.txt
# 1. Download the AFCD Release 2 workbook from foodstandards.gov.au (manual, permitted)
# 2. Import it:
python -m macromatch_ingest.cli afcd afcd_release2.xlsx --db macromatch.db
```
Interrupted? Just re-run the same command — it resumes from the last committed
batch checkpoint.

## Production (Supabase)
```bash
# once: run schema.sql in the Supabase SQL editor (seeds the afcd_r2 source row)
export SUPABASE_URL=https://<project>.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=<service key>   # server-side only, never shipped to the app
python -m macromatch_ingest.cli afcd afcd_release2.xlsx --supabase
```
The React app then reads `foods` through Supabase's client with the anon key
and RLS read policies (add policies before exposing the table).

## Non-negotiable rules encoded in the pipeline
1. **Licence gate** — an importer will not run unless its `food_sources` row
   has `licence_cleared = true`.
2. **Never invent data** — missing/inconsistent values are flagged
   (`quality_flags`, `confidence='suspect'`) and queued for human review.
   The only computed value is kcal derived from kJ (a unit conversion).
3. **Polite by construction** — all HTTP goes through `PoliteFetcher`:
   robots.txt honoured, honest User-Agent, >=5s/host, bounded retries, and a
   hard stop on 401/403 (access controls are respected, never bypassed).
4. **Audit trail** — every row keeps the original source values (`raw` JSONB),
   `source_url`, `source_version`, `retrieved_at`, `last_verified_at`.

## Admin review queue
`review_queue` (status='open') is the worklist: energy/macro mismatches,
missing required nutrients, parse errors. `duplicate_pairs` holds barcode /
natural-key / fuzzy candidates — fuzzy matches are never auto-merged.
A simple admin UI can be built on these two tables next.

## Roadmap
- P1: AUSNUT importer (same Excel machinery); OFF importer once ODbL posture signed off
- P2: fast-food PDF profiles (pdfplumber) for the top 10 AU chains
- API: `/foods/search` with confidence filtering for the MacroMatch app
