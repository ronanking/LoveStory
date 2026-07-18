# MacroMatch — Australian Food Data Source Report

Prepared by: Data Engineering
Status: v1 — verify licence text on each source's site before enabling an importer;
licensing terms change and this report is a snapshot, not legal advice.

## Summary recommendation

Import in this order. Each phase is a separate, controlled run — never ingest
everything in one uncontrolled operation.

| # | Source | Type | Format | Est. records | Licence posture | Priority |
|---|--------|------|--------|--------------|-----------------|----------|
| 1 | FSANZ Australian Food Composition Database (AFCD, Release 2) | Government reference | Excel/CSV download | ~1,600 generic foods | Creative Commons Attribution (per FSANZ copyright page) — cleared for reuse with attribution | **P0 — implemented** |
| 2 | FSANZ AUSNUT 2011–13 food nutrient database | Government survey | Excel download | ~5,700 foods | Same FSANZ CC posture | P1 |
| 3 | Open Food Facts — Australian subset | Crowdsourced branded/supermarket products incl. barcodes | CSV / JSONL bulk export, API | tens of thousands AU; >3M global | ODbL — open, but **share-alike + attribution obligations apply to our derived database**; legal sign-off needed on how we re-licence | P1 (largest path to 100k+) |
| 4 | Australian fast-food chains' published nutrition documents (McDonald's, KFC, Hungry Jack's, GYG, Subway, Red Rooster, Oporto, Nando's, Domino's, Grill'd, Zambrero) | First-party published menus | PDF (occasionally HTML tables) | ~50–300 items per chain | Publicly published factual nutrition data; each site's ToS must be reviewed; fetch politely, honour robots.txt, keep source URL + retrieval date | P2 |
| 5 | FSANZ Branded Food Database (in development alongside Health Star Rating program) | Government branded | TBC | TBC | Monitor — would supersede much of #3/#6 if released openly | Watch |
| 6 | Coles / Woolworths product data | Supermarket retail | Internal APIs / web | 100k+ | **Not permitted without agreement.** Retailer ToS prohibit scraping; internal APIs sit behind anti-bot protections we will not bypass. Path: commercial data agreement or an aggregator licence | Blocked pending agreement |
| 7 | FoodSwitch (The George Institute) | Research branded DB | On request | ~100k | Requires a data-sharing agreement; not downloadable | Blocked pending agreement |

## Notes per source

### 1. AFCD (P0 — the implemented importer)
- Publisher: Food Standards Australia New Zealand (foodstandards.gov.au).
- Distribution: "detailed" and "summary" Excel workbooks; nutrient values per 100 g
  edible portion. Stable public food keys (e.g. `F002258`) make idempotent upserts easy.
- Why first: authoritative, versioned, explicitly licensed, clean tabular structure,
  and gives MacroMatch a generic-foods backbone (raw ingredients, home-cooked items)
  that branded sources never cover.
- Operational model: an operator downloads the workbook from FSANZ and points the
  importer at the local file. No automated crawling of the FSANZ site is required.

### 3. Open Food Facts (the road to 100k+)
- ODbL means: attribution required, and a database "substantially derived" from OFF
  must be shared back under ODbL. Decide product posture before enabling:
  either (a) keep OFF-derived rows in a clearly attributed, ODbL-compliant slice, or
  (b) use OFF only for barcode lookups at runtime via API. The importer ships as a
  licence-gated skeleton until that decision is made.
- Quality: crowdsourced — expect missing fields and unit errors. Our validation layer
  (flag, never invent) and review queue exist largely for this source.

### 4. Fast-food PDFs
- Chains publish nutrition information voluntarily (industry code / NSW menu
  labelling laws mandate kJ display). Facts themselves are not protected, but each
  site's ToS and robots.txt are checked at fetch time by the compliance module, we
  identify ourselves with an honest User-Agent, rate-limit to ~1 request / 5 s, and
  cache documents so each PDF is fetched once per release.
- PDFs change layout without notice → each chain gets a column-mapping profile and
  parse failures land in the review queue rather than producing bad rows.

### Explicitly out of scope
- Bypassing authentication, CAPTCHAs, paywalls, or anti-bot measures — never.
- MyFitnessPal / CalorieKing / other proprietary databases — their data is licensed,
  not open.
- OCR-guessing nutrition from product photos — violates our "never invent" rule.

## Getting to 100,000+ products
AFCD + AUSNUT ≈ 7,300 authoritative generic foods (the quality backbone).
Open Food Facts AU + NZ supplies the bulk branded volume once licensing posture is
signed off. Fast-food chains add the ~2,000 highest-value items for MacroMatch's
core use case. A retailer or FoodSwitch agreement is the long-term route to full
supermarket coverage. The pipeline itself is source-agnostic and already handles
resume, dedupe and review at that scale (batch upserts, checkpoint per batch).
