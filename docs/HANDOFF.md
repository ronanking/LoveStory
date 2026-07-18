# MacroMatch AU — Project Handoff

Written for: Claude Code, continuing this project on Ronan's local machine.
Written by: Claude (claude.ai), end of the design/prototyping phase.
Context: this is a clean brief, not a raw chat transcript — it captures the
decisions and current state so you don't have to re-derive them.

## What MacroMatch is

An Australian calorie/macro tracker with one differentiator: instead of only
logging what you ate, it answers "what can I still eat tonight?" — filtering
real fast-food and supermarket products against whatever's left of the user's
daily macro budget. Reverse-tracking is the core product idea; everything
else supports it.

## Where things stand

Four prototype artifacts exist, all client-side, all using hardcoded/in-memory
data (no backend yet):

| File | What it is | Status |
|---|---|---|
| `macro-match.jsx` | React component prototype of the full app (diary, setup wizard with Katch-McArdle body-fat calc, protein pressure gauge, Learn tab) | Superseded by `macromatch-app.html` for the core flows, but has the setup wizard + Learn tab content that hasn't been ported yet |
| `macromatch-app.html` | **Current app**, vanilla HTML/CSS/JS, single file, mobile-first, in-memory state | Latest and most polished — this is the one to build forward from |
| `macromatch-landing.html` | Marketing/demo landing page | Deprioritised — Ronan wants the real app now, not a pitch page |
| `macromatch-ingest.zip` | Python data-ingestion pipeline (Supabase-targeted) | Built, tested (21 passing tests), not yet connected to any frontend |
| `schema.sql` | Supabase/Postgres schema matching the ingest pipeline | Ready to run in Supabase SQL editor |
| `SOURCES_REPORT.md` | Australian food data source landscape + licensing | Reference document, no action needed |

**`macromatch-app.html` is the one to treat as source of truth for UI/UX
direction.** It supersedes the landing page and most of the jsx prototype.

## Design system ("the ledger")

Deliberately moved away from generic SaaS/wellness-app look:

- Palette: bone white (`#F7F7F3`) / paper white / near-black ink (`#111C16`),
  ONE accent — deep forest green (`#1E4D36`) — used for anything actionable
  or "on pace". Macro colours (protein/carbs/fat) are reduced to tiny 7px
  dots, not big coloured chips.
- Typography: Bricolage Grotesque (display/headings), Space Grotesk (body),
  Space Mono (ALL numerals — tabular figures, so nothing jitters).
- Signature visual motif: **dotted leader lines** (like a till receipt) for
  every stat row — "Protein ⋯⋯⋯⋯⋯⋯⋯ 98 g left".
- No emoji as icons anywhere — inline SVG symbol sprite instead (bolt/check/
  x/search/book/user/fork/pen), referenced via `<use href="#i-x">`.
- Motion: transform/opacity only, ~200ms `cubic-bezier(.2,.7,.3,1)`,
  everything respects `prefers-reduced-motion`.

## Product decisions made (don't relitigate these without cause)

1. **No calorie/macro slider on the home screen.** Ronan explicitly rejected
   this — you don't renegotiate your diet mid-day. Targets are set once
   (Profile), and "remaining" is a pure derived value: `target − diary`.
2. **The flagship feature is "Let's see what you can eat"** — a full-screen
   sheet, opened via the centre button of the bottom nav (not a secondary
   tab). It filters the food database against remaining calories/protein/
   carbs/fat, ranks by an "on protein pace" heuristic, and tapping a result
   logs it directly to the diary. This IS the product; every other screen
   supports it.
3. **Protein Pressure** (signature metric): `remaining_protein_g /
   remaining_kcal × 100` — "grams of protein needed per 100 remaining
   calories." Banded into cruise / on track / lean picks only / tight
   squeeze. Drives the ⚡ "on pace" badge on food items.
4. **Macro math integrity is a hard product rule.** Protein/carbs = 4 cal/g,
   fat = 9 cal/g. The app must always show its arithmetic (the "receipt")
   and flag — never silently fix — any mismatch between stated macros and
   stated calories, both for user-set targets and for food database entries.
5. **Body fat % is optional but changes the calculation.** When supplied,
   switch BMR calc from Mifflin-St Jeor to Katch-McArdle (`370 + 21.6 ×
   lean_mass_kg`) and prescribe protein per kg lean mass instead of per kg
   bodyweight. This logic exists in `macro-match.jsx` (`calcPlan()`) but is
   NOT yet ported into `macromatch-app.html` — the app currently has fixed
   default targets, no wizard.
6. **Tone/content rules:** no forbidden foods, no streaks/shame mechanics,
   no black-box numbers — every calculation must be inspectable by the user.
   This shows up as the "Our promise" content in the landing page and should
   inform any copy you write.
7. **Australian-specific:** kJ-first nutrition convention, AU chains (Macca's,
   KFC, Hungry Jack's, GYG, Grill'd, Subway, Red Rooster, Oporto, Nando's,
   Zambrero, Domino's) + Coles/Woolies/7-Eleven, AU spelling and vernacular
   in copy.

## Immediate next steps (in priority order)

1. **Stand up Supabase.** Run `schema.sql` in the SQL editor (seeds the
   `afcd_r2` source row with `licence_cleared = true`). Get `SUPABASE_URL`
   and `SUPABASE_SERVICE_ROLE_KEY`.
2. **Run the AFCD import.** Unzip `macromatch-ingest.zip`, `pip install -r
   requirements.txt`, download the AFCD Release 2 workbook from
   foodstandards.gov.au, then:
   `python -m macromatch_ingest.cli afcd afcd_release2.xlsx --supabase`
   This gets ~1,600 real foods into the `foods` table. See that project's
   own `README.md` (bundled in the zip) for full detail — it's self-contained.
3. **Convert `macromatch-app.html` into a proper Vite + React (or keep
   vanilla, Ronan's call) project.** The HTML/CSS/JS is already
   component-shaped (render functions per view: `renderToday()`,
   `renderProfile()`, `renderEat()`) — porting logic is mechanical. Priority:
   replace the hardcoded `DB` array with a Supabase query
   (`select * from foods where confidence != 'suspect'`, paginated/searched
   server-side rather than loaded client-side once volume grows past a few
   thousand rows).
4. **Add RLS read policies** on `foods` in Supabase before the app ships —
   currently only service-role write access is defined in `schema.sql`.
5. **Port the setup wizard** from `macro-match.jsx` (`SetupWizard`,
   `calcPlan`, `GOALS`, `SPLITS`, `BF_BANDS` constants) into the ledger
   design system — this is what populates the Profile targets instead of
   the current hardcoded defaults.
6. **Port the Learn tab content** from `macro-match.jsx` (`LEARN` array) —
   six educational sections on energy balance, protein, carbs, fat, body
   fat %, and muscle gain — currently not present in `macromatch-app.html`.
7. Persistence: `macromatch-app.html`'s state is in-memory only (resets on
   refresh) by necessity of the format. A real app needs auth + a `users`
   and `diary_entries` table (not yet in `schema.sql` — only `foods` and
   ingestion-support tables exist there; you'll need to design the
   user-facing tables).

## Things NOT to change without asking

- The rejection of the calorie slider (decision #1 above) — if it resurfaces
  as a "nice to have," check with Ronan first, he was explicit about this.
- The "no forbidden foods / no shame" tone — this is brand-level, not just
  copy.
- Never invent nutrition data — this rule is enforced in the ingestion
  pipeline's `validation.py` and should hold in the frontend too: missing
  data displays as missing, not as a guessed value.

## Environment note

Ronan is on a work computer without Claude Code / local terminal access for
this phase — that's why this handoff exists rather than continuing directly.
He'll be running you on his personal machine.
