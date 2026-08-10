# Implementation report

An independent Next.js rebuild of Love Story Atelier, with no runtime
dependency on Shopify, Liquid, Shopify routes, APIs or hosting.

**Status:** built, tested and deployment-ready. `lint`, `typecheck`, `test` and
`build` all pass. 23 static routes, 24 Playwright assertions green on desktop
and mobile. Not yet deployed — see [Remaining external configuration](#remaining-external-configuration).

---

## What was migrated

Source: the Shopify theme on the `source-assets` branch — 80 files, 20 Liquid
sections, 2,324 lines, plus 44 photographs across the theme assets and the
drive library.

| From | To |
|---|---|
| Copy inside Liquid `default:` filters | `content/site.ts`, `content/pages.ts` |
| 12 hand-written collection cards | `content/collection.ts` as data |
| 5-length silhouette carousel | `silhouetteGuide` + a WAI-ARIA tablist |
| 24 `contact[...]` form fields | `lib/enquirySchema.ts` + 6 fieldsets |
| `ls-reviews.png` (an image of text) | Three real testimonials as markup |
| Theme assets + drive library | 38 WebP derivatives + typed metadata |

Business claims — 72-hour dispatch, complimentary shipping over $300 AUD,
"most brides receive their veil within two weeks" — are carried **verbatim**.
They are the client's own commitments, not copy to reword.

**No prices exist anywhere in the source**; every card reads "Made to order".
The `Veil` type therefore has no price field at all, and the Product
structured data omits `offers` entirely rather than inventing one.

## What was redesigned

Preserved: palette, Cormorant/Jakarta pairing, editorial voice, photography,
section rhythm, and the interaction concepts worth keeping.

Changed:

- **Copy left the templates.** It sat in Liquid `default:` filters, unreachable
  to anyone not editing theme files. It is now typed content behind a data
  adapter seam.
- **Inline styles left the markup.** Nearly every element carried
  `style="aspect-ratio:3/4;object-position:50% 20%"`. Now CSS Modules on tokens.
- **The 12 collection cards became a loop.** They were duplicated markup.
- **Focal points became data.** They were repeated per usage; now defined once
  in `content/collection.ts` and `content/images.ts`.
- **Testimonials became text.** See below — the single largest functional win.

## Accessibility decisions

Several of these fix real defects in the source rather than adding polish.

| Fix | Why it mattered |
|---|---|
| Testimonials rebuilt from a PNG into markup | Three brides' words were invisible to search engines, screen readers and translation |
| Filter chips now reflect state | The source set `aria-pressed` but never changed it, so filtering was imperceptible without sight |
| Silhouette guide is a tablist | The source carousel had no keyboard path and no link between dots and panels |
| Mobile panel uses `inert` when closed | An off-screen panel otherwise stays in the tab order |
| Touch targets raised to 44–48 px | The source used 6 px slideshow dots and 36 px buttons |
| Form inputs at 16 px | Below that, iOS Safari zooms the viewport on focus |
| Error summary takes focus; inline errors via `aria-describedby` | Errors were otherwise only visual |
| Skip link as first tab stop | Absent in the source |
| Exactly one `h1` per route | Enforced by test; sections previously each emitted their own |
| FAQ uses native `<details>` | Keyboard-operable and works without JavaScript |

Reduced motion is honoured throughout: the hero crossfade stops, Ken Burns
stops, the marquee stops, the 3D veil never mounts.

## Performance decisions

- **three.js is an 896 KB chunk that is never in the initial bundle** —
  dynamically imported, `ssr: false`, so no WebGL touches the critical path.
- **The 3D veil does not mount at all** under reduced motion, on coarse
  pointers, below 4 cores, under Data Saver, or without a usable WebGL context.
  Those clients get the pre-rendered Blender poster, which was made to stand
  alone rather than act as a loading state.
- **The poster fades only after the veil draws a frame.** Fading on capability
  detection alone left an empty hero whenever WebGL failed — caught by
  screenshot review, not by a test.
- **Render loop pauses** when the canvas is offscreen or the tab is hidden.
- **Photography: 72 MB → 5.5 MB.** EXIF-normalised WebP capped at a 2400 px
  long edge, each with a 20 px blur placeholder so no slot shifts layout.
- **Fonts self-hosted** by `next/font` — no external request, no FOUT.
- **The Draco decoder is self-hosted.** drei fetches it from Google's CDN by
  default, putting a third-party request on the critical path of the signature
  asset. There are now **zero external requests** on the page.
- All 23 routes are static; the only dynamic surface is `/api/enquiry`.

## Blender and WebGL

`blender/scripts/veil_study.py` generates the signature motif from a
reproducible script — a cathedral panel cut with deliberate asymmetry, pinned
at the comb, draped under cloth physics over a non-exported head/shoulder
collision proxy, then normal- and UV-cleaned, decimated, and exported.

Ships: **52 KB Draco GLB**, **208 KB WebP poster**, **536 B placeholder**.

Three review passes were needed. The substantive error was panel width, not
solver settings: a veil's fullness comes from gathering a wide panel onto a
narrow comb, and at 1.15 m there was never enough fabric to flare. At 2.6 m
the cathedral silhouette appears. Full history in `blender/README.md`.

Four environment traps are documented there too, the worst being that **Draco
compression silently no-ops** on distro Blender builds — the exporter accepts
every flag while the native encoder is absent, yielding an 800 KB file with no
error. The build script now asserts the extension landed.

## Enquiry pipeline

All 24 source fields, grouped into six fieldsets, validated by one Zod schema
shared between client and server. Draft autosaves to localStorage. The form
pre-fills from the veil being viewed.

Server route: per-IP rate limiting, honeypot, and an email provider
abstraction with Resend behind it. **Unconfigured in production it returns 502
and the UI says the message was not sent** — it never fakes success.

Verified by direct request: valid + unconfigured → 502, validation errors →
400 with field errors, honeypot → silent 200, sixth request in the window →
429.

**A defect found by that testing:** validating the honeypot in the Zod schema
returned 400 with `website` named in `fieldErrors`, telling a bot exactly which
field was the trap. The schema now accepts any value and the route decides.

### Known limitation

Rate limiting is in-memory, so it is per-instance and resets on cold start.
Adequate for a single studio's enquiry volume; move to Vercel KV or Upstash if
that changes. Stated in the code rather than hidden.

## Testing

24 Playwright assertions across desktop and mobile, covering what the rebuild
promises rather than that pages merely load:

- every route returns 200 with exactly one `h1` and no console errors
- **no Shopify route, Liquid delimiter or `myshopify` reference survives**
- filters narrow the grid and announce the count
- the silhouette guide answers Arrow/Home/End
- the form surfaces errors and never shows success on failure
- Product structured data carries no invented `offers`
- the skip link is the first tab stop

Screenshot review at 1440×1000, 1024×768 and 390×844 caught three defects that
tests did not: the empty-hero fallback bug, drei's external CDN request, and
the veil poster reading as an opaque column.

## Remaining external configuration

Nothing in the codebase is blocked. Three things need a human with account
access:

1. **Create the Vercel project.** Import `ronanking/LoveStory`, set **Root
   Directory → `lovestoryatelier-vercel`**, deploy, then set Production Branch
   to the rebuild branch. Full detail in `README.md`.
2. **Set `NEXT_PUBLIC_SITE_URL`** once a domain is attached. Until it is set,
   `robots.txt` disallows everything — preview deployments cannot be indexed by
   accident. Remove the `robots` block in `app/layout.tsx` when the site should
   be found.
3. **Set `RESEND_API_KEY`, `ENQUIRY_TO_EMAIL`, `ENQUIRY_FROM_EMAIL`** to
   deliver enquiries. The app builds and runs without them; the form reports
   failure honestly instead.

A Lighthouse pass has **not** been run — it needs a deployed URL, and Chrome
headless here has no GPU, so local numbers would misrepresent the 3D layer.
Run it against the preview URL once the project exists.

## Honest limitations

- **Not yet deployed.** No Vercel project exists, and it could not be created
  from this environment: the deploy tool requires every file inline in a single
  call, and the source alone is 161 KB (the photography a further 7.9 MB).
- **Lighthouse unmeasured**, per above.
- **`.CR3` RAW files were excluded** from the source push and never processed.
  If a specific RAW holds unique imagery, it needs converting separately.
- **Five drive images are phone screenshots**, not photography — status bars,
  Instagram comment UI, a file viewer — and are excluded in
  `scripts/build-images.mjs` with reasons.
- **The veil material reads closer to silk than sheer tulle.** Deliberately not
  tuned further: matching it to the real veils needs a product shot as
  reference, not guesswork. The values to change are noted in the script.
- **Newsletter, Shipping & Returns, Privacy and Terms** appeared in the source
  footer but have no pages here; those links were omitted rather than shipped
  dead.
