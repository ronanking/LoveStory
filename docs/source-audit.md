# Source audit

**Status:** ✅ Source material received and extracted.

Delivered on the `source-assets` branch of `ronanking/LoveStory` (commit
`a2c5df1`) after chat attachments and the live site both proved unreachable —
see [Delivery history](#delivery-history) for why that mattered.

```bash
git checkout origin/source-assets -- source   # repopulates reference/
```

`reference/` is gitignored (77 MB); the branch is the canonical copy.

## What arrived

| | Files | Size |
|---|---|---|
| `reference/theme/` — Shopify Liquid theme | 80 | 4.9 MB |
| `reference/images/` — photography library | 25 | 72 MB |

`.CR3` RAW files were excluded from the push deliberately: they are large, and
nothing in this pipeline can read them without extra tooling. The JPG/PNG/JPEG
set is what the build needs.

## Theme inventory

```
layout/theme.liquid          config/settings_data.json, settings_schema.json
templates/  17 files         .json section configs + .liquid fallbacks
sections/   20 files         2,324 lines of Liquid
snippets/   10 files         icon partials
assets/     base.css (1,082), ls-animations.css, ls-animations.js (352), main.js
            + 19 brand photographs (ls-*.jpg / .png)
```

The `.json` templates only carry section ordering. **All real copy lives as
`default:` values inside the section `.liquid` files**, which means the theme
carries its content even with an empty Shopify store — and means the migration
source is the Liquid, not the store.

## Page and section map

| Route (Shopify) | Sections | → New route |
|---|---|---|
| `/` (`index.json`) | hero, value-marquee, brand-intro, categories, gallery, testimonials, process, enquiry-form, social-feed, final-cta | `/` |
| `/collections/veils` | main-collection | `/collection` |
| `/products/:handle` | main-product | `/collection/[slug]` |
| `/pages/custom` | page-header, embroidery-showcase, process, enquiry-form | `/custom` |
| `/pages/about` | page-header, founder-note, atelier-values, final-cta | `/about` |
| `/pages/contact` | page-header, contact-info, enquiry-form, faq | `/contact` |
| `/cart`, `/404`, `password` | main-cart, main-404 | dropped / `not-found` |

`main-cart` is intentionally **not** migrated: this build is enquiry-led, not
transactional, so there is no cart to render.

## Content recovered

Confirmed brand facts, all sourced from the theme — none invented:

- **Founder: Jesse.** *"Hello — I'm Jesse, the heart and hands behind Love Story
  Atelier."* Signature quote: *"It's an honour to play a small part in your big
  moment."*
- **Made by hand in a Brisbane studio**, from **European tulle**.
- Hero: *"Your dream veil, **made to order**."*
- Contact: **info@lovestoryatelier.com**
- Trust strip: **72 hrs** studio dispatch · **European** tulle · **Worldwide**
  shipping, complimentary over **$300 AUD**.

These last three are business claims. They are carried across **verbatim** and
must not be paraphrased or "improved" — they are the client's commitments.

### Veil catalogue

12 veils in the collection fallback, each with name, silhouette, length, edge
and image. Silhouettes: Cathedral (280–320 cm), Mantilla (200–240 cm), Chapel
(160–180 cm), Fingertip (100–110 cm), Two-tier (180 cm).

**No prices anywhere — every card reads "Made to order."** The template only
shows a price when a real Shopify product carries one. Nothing here justifies
inventing a price, and none will be.

Filter taxonomy: All silhouettes · Cathedral · Chapel · Fingertip · Mantilla ·
Two-tier · Lace · Plain.

### Silhouette guide

Five lengths with full editorial descriptions and a proportional length bar:
Blusher ~80 cm · Fingertip ~110 cm · Chapel ~170 cm · Mantilla ~210 cm ·
Cathedral ~320 cm.

### Four categories

Custom Veils · Pearl Earrings · Bridal Accessories · Embroidered Keepsakes.

## Interactions to preserve

From `ls-animations.js` (352 lines) and the section markup:

| Interaction | Verdict |
|---|---|
| Hero crossfade + Ken Burns, dot navigation | Keep, add reduced-motion path |
| Staggered `data-reveal` system | Keep as a motion primitive |
| Final-CTA parallax | Keep, throttled |
| Custom desktop cursor | Keep, fine-pointer only |
| Collection quick view | Rebuild with focus trap + Escape |
| Silhouette carousel | Rebuild with keyboard + swipe |
| Gallery filtering | Rebuild, preserving layout stability |
| Mobile social marquee | Keep, pause on reduced motion |
| Announcement rotation | Keep |

## Weak points the rebuild fixes

1. **Copy is trapped in Liquid `default:` filters** — unreachable to anyone who
   is not editing theme files. Moves to typed content modules.
2. **Inline styles everywhere** (`style="aspect-ratio:3/4;..."` on nearly every
   element) — unmaintainable and unthemeable. Moves to CSS Modules on tokens.
3. **Filter chips have `aria-pressed` but the panels are not linked**, and the
   carousel has no keyboard path.
4. **Focal points are hardcoded** per usage (`object-position:50% 20%`) and
   repeated. Becomes typed image metadata, defined once.
5. **No art-directed mobile crops** — the same crop is served at every width.
6. **Duplicate markup**: the 12 collection cards are hand-written, not looped.
7. Shopify coupling to remove: `/collections/veils`, `/pages/custom`,
   `routes.*`, `money` filters, `asset_url`, metafields.

## Delivery history

Recorded because it cost several rounds and would otherwise repeat.

The build runs in an **ephemeral Linux container in Anthropic's cloud**, not on
the author's PC. `C:\Users\Ronan\Downloads\...` is not reachable; `ls /mnt/c`
returns nothing. Chat attachments do not land on the container's disk.

The live site was equally unreachable, by two independent blocks: organisation
egress policy denied `lovestoryatelier.com`, `cdn.shopify.com` and
`www.etsy.com` at `CONNECT` (403), while WebFetch — a separate route — was
refused 403 by Shopify's bot protection.

**GitHub is the only reachable route into this container**, which is why the
`source-assets` branch worked when nothing else did.
