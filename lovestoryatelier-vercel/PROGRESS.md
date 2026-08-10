# Love Story Atelier — Vercel rebuild progress

**Status:** ✅ Built, tested and deployment-ready. Not yet deployed — creating
the Vercel project needs account access this environment does not have.

`lint` · `typecheck` · `test` (24/24) · `build` — all passing.

## Phases

| # | Phase | Status |
|---|---|---|
| 1 | Source audit | ✅ [`docs/source-audit.md`](docs/source-audit.md) |
| 2 | Architecture & content migration | ✅ Typed content behind a data-adapter seam |
| 3 | Core responsive UI | ✅ 23 static routes |
| 4 | Motion system | ✅ Reduced-motion paths throughout |
| 5 | Blender asset generation | ✅ 52 KB GLB + 208 KB poster + LQIP |
| 6 | Forms & server route | ✅ 24 fields, Zod, Resend, verified end-to-end |
| 7 | SEO & metadata | ✅ Sitemap, robots, OG, LocalBusiness + Product |
| 8 | Testing & visual QA | ✅ 24 Playwright assertions + screenshot review |
| 9 | Production build & docs | ✅ README + [`docs/implementation-report.md`](docs/implementation-report.md) |

## Routes

`/` · `/collection` · `/collection/[slug]` ×12 · `/custom` · `/about` ·
`/contact` · `/api/enquiry` · `sitemap.xml` · `robots.txt`

## Defects found and fixed during the build

Recorded because each was caught by actually looking, not by assuming:

1. **Empty hero on WebGL failure** — the poster faded on capability detection
   rather than on the veil drawing a frame. Found by screenshot review.
2. **drei fetched the Draco decoder from Google's CDN** at runtime, on the
   critical path of the signature asset. Now self-hosted; zero external
   requests remain.
3. **Honeypot named itself** — validating it in Zod returned 400 with `website`
   in `fieldErrors`, telling bots which field was the trap.
4. **Draco silently no-opped** in Blender — every flag accepted, native encoder
   absent, 800 KB output, no error. The build now asserts the extension landed.
5. **`next@15.1.6` carried a published CVE** (CVE-2025-66478). Upgraded to 16.
6. **Cascading render** closing the mobile panel in an effect rather than
   during render.
7. **Playwright resolved two copies of itself**, reported as "No tests found".
8. **Five "photographs" were phone screenshots** — status bars, Instagram UI.

## Blocked on account access only

1. Create the Vercel project — import, **Root Directory → `lovestoryatelier-vercel`**,
   then set Production Branch. See README.
2. `NEXT_PUBLIC_SITE_URL` — until set, `robots.txt` disallows all, so previews
   cannot be indexed by accident.
3. `RESEND_API_KEY` / `ENQUIRY_TO_EMAIL` / `ENQUIRY_FROM_EMAIL` for delivery.

Lighthouse is unrun: it needs a deployed URL, and headless Chrome here has no
GPU, so local numbers would misrepresent the 3D layer.
