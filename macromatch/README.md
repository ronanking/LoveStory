# MacroMatch AU

An Australian calorie/macro tracker with one differentiator: instead of only
logging what you ate, it answers **"what can I still eat tonight?"** — filtering
real fast-food and supermarket products against whatever's left of your daily
macro budget.

This repo continues the design/prototyping phase handed off in
[`docs/HANDOFF.md`](docs/HANDOFF.md). The prototype artifacts it grew from are
kept in [`prototypes/`](prototypes/) for reference.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

No backend needed — out of the box the app runs on a bundled local food
database and persists everything (name, targets, wizard answers, diary) to
`localStorage`, keyed by date so each day starts fresh.

## What's in the app

- **Diary (Today)** — greeting, calories left, macro ledger with dotted
  leaders, the **Protein Pressure** dial (`remaining protein / remaining
  calories × 100`, banded cruise → tight squeeze), and the food diary.
- **EAT (flagship)** — the centre-button sheet: search, category + venue
  filters, optional 10% wiggle room, foods ranked by "on protein pace" then
  fit, over-budget items shown greyed with the exact overshoot. Tap to log.
  Includes custom quick-add that cross-checks stated calories against 4/4/9
  and flags mismatches (never silently fixes them).
- **Setup wizard** (Profile → Calculate my targets) — Mifflin-St Jeor, or
  Katch-McArdle when a body fat estimate is supplied (protein then prescribed
  per kg lean mass), activity factors, 7 goals with a two-question
  recommender, 4 macro styles — and the full working printed at the end.
- **Learn** — the macro handbook: six sections on energy balance, protein,
  carbs, fat, body fat %, and muscle.
- **Profile** — name, editable targets with the 4/4/9 balance check and the
  arithmetic receipt.

### Product rules (from the handoff — don't break these)

1. No calorie/macro slider on the home screen; targets are set once and
   "remaining" is purely `target − diary`.
2. Protein/carbs 4 cal/g, fat 9 cal/g — the app always shows its arithmetic
   and flags (never silently fixes) mismatches.
3. No forbidden foods, no streaks/shame, no black-box numbers.
4. Never invent nutrition data — missing data displays as missing.
5. Australian: AU chains and supermarkets, AU spelling, kJ-first data
   convention in the pipeline.

## Wiring up Supabase (optional, for the real food database)

1. In the Supabase SQL editor run, in order:
   - [`supabase/schema_ingest.sql`](supabase/schema_ingest.sql) — foods +
     ingestion tables (seeds the `afcd_r2` source row).
   - [`supabase/schema_app.sql`](supabase/schema_app.sql) — RLS read policies
     on `foods`, plus `profiles` and `diary_entries` tables for auth-backed
     persistence (frontend wiring for auth is a next step).
2. Import real food data with the pipeline in [`ingest/`](ingest/):
   ```bash
   cd ingest
   pip install -r requirements.txt
   # download the AFCD Release 2 workbook from foodstandards.gov.au, then:
   export SUPABASE_URL=https://<project>.supabase.co
   export SUPABASE_SERVICE_ROLE_KEY=<service key>   # server-side only
   python -m macromatch_ingest.cli afcd afcd_release2.xlsx --supabase
   ```
   See [`ingest/README.md`](ingest/README.md) and
   [`docs/SOURCES_REPORT.md`](docs/SOURCES_REPORT.md) for the source
   landscape, licensing posture and roadmap to 100k+ products.
3. Copy `.env.example` to `.env` and fill in `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY`. The app auto-detects the config and reads
   non-suspect foods from the table (falling back to the local DB on any
   error). Rows missing a core macro are excluded, not guessed at.

## Layout

```
src/                  Vite + React app (the ledger design system)
  components/         TodayView, EatSheet, SetupWizard, LearnView, ProfileView…
  lib/                calc (plan maths, protein pressure), storage, foodSource
  data/               local seed food DB, Learn content
supabase/             schema_ingest.sql + schema_app.sql
ingest/               Python ingestion pipeline (AFCD importer, 21 tests)
docs/                 HANDOFF.md, SOURCES_REPORT.md
prototypes/           the original single-file prototypes this app grew from
```

## Next steps

- Supabase auth + syncing diary/targets to `profiles` / `diary_entries`
  (schema is ready; frontend wiring pending).
- Server-side food search once volume outgrows a single client-side fetch.
- AUSNUT + fast-food PDF importers (see `docs/SOURCES_REPORT.md` priorities).
- A history view over the date-keyed diary.

MacroMatch provides general nutrition information and calculation tools — not
medical or dietary advice. Nutrient reference data includes the Australian Food
Composition Database (FSANZ); branded values approximate published nutrition
information — check current labels.
