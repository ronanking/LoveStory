# Love Story Atelier — Shopify Theme Setup Guide

## What's in this folder

A complete Shopify Online Store 2.0 theme built from the Love Story Atelier design. Every section
can be edited in the Shopify theme editor — no code required for content changes.

---

## Installing the theme

### Option A — Shopify CLI (recommended)
1. Install Shopify CLI: https://shopify.dev/docs/api/shopify-cli
2. Open a terminal in this `shopify-theme/` folder
3. Run:
   ```
   shopify theme push --store your-store.myshopify.com
   ```
4. Open the Shopify admin → Online Store → Themes → click "Customize" on the uploaded theme.

### Option B — Zip upload
1. Zip the entire `shopify-theme/` folder contents (not the folder itself, just its contents)
2. In Shopify admin → Online Store → Themes → "Add theme" → "Upload zip file"

---

## Setting up pages

Create these pages in Shopify admin → Online Store → Pages, then assign templates:

| Page title  | Handle      | Template        |
|-------------|-------------|-----------------|
| About       | `about`     | `page.about`    |
| Custom      | `custom`    | `page.custom`   |
| Contact     | `contact`   | `page.contact`  |

**To assign a template:** Edit the page → right sidebar → "Theme template" dropdown.

---

## Setting up the Veils collection

1. Shopify admin → Products → Add product for each veil.
2. Set product type (e.g. "Cathedral Veil").
3. Add tags that match the filter chips: `Cathedral`, `Mantilla`, `Chapel`, `Fingertip`, `Two-tier`, `Lace`, `Plain`
4. Add product metafields (Shopify admin → Settings → Custom data → Products):
   - `atelier.silhouette` (single line text) — e.g. "Cathedral · 280 cm"
   - `atelier.edge` (single line text) — e.g. "Chantilly lace"
   - `atelier.focal` (single line text) — e.g. "60% 30%"  ← image focal point
5. Create a collection with handle `veils` and add your products.

---

## Uploading images

Upload images via Shopify admin → Content → Files, or assign them directly
in the theme editor (each section with an `image_picker` field).

Images from the original design (in `/uploads/`):
- Hero: `IMG_6078.jpeg`
- Brand intro stack: `IMG_7029.JPG`, `IMG_4656.PNG`, `IMG_5005.PNG`
- Final CTA background: `IMG_1127.JPG`
- Enquiry aside: `IMG_0896.JPG`

---

## Theme editor sections (homepage)

Open Customize → Home page. The sections in order are:

1. **Hero** — Headline, body, and the hero photograph
2. **Value marquee** — Animated editorial strip (no settings needed)
3. **Brand intro** — Jesse's intro copy + 3 studio images
4. **Categories** — 4 product category cards (add 4 "Category" blocks)
5. **Gallery** — Photo lookbook with filter chips (add "Gallery photo" blocks)
6. **Process** — 4-step bespoke process (static, no blocks needed)
7. **Enquiry form** — Shopify contact form (posts to /contact)
8. **Social feed** — Studio Instagram/TikTok grid (add "Social post" blocks)
9. **Final CTA** — Full-bleed CTA with background photo

---

## Enquiry form notes

The form uses Shopify's native `/contact` endpoint — no third-party app needed.
All fields are submitted as `contact[field_name]` and arrive in your Shopify
admin → Customers → Contact requests, and also forwarded to your store email.

---

## Navigation

Set up menus in Shopify admin → Online Store → Navigation:
- **Main menu** — Veils (/collections/veils), Custom (/pages/custom), About (/pages/about), Contact (/pages/contact)
- **Footer** — handled inline in the footer section
