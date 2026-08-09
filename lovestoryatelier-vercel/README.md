# Love Story Atelier — Vercel rebuild

An independent Next.js rebuild of the Love Story Atelier site, with no runtime
dependency on Shopify, Liquid, Shopify routes, APIs or hosting.

> **Current state.** The application, design system and 3D veil are built and
> deploy cleanly. **The site's content is not in yet** — copy, photography and
> the veil catalogue are still pending source material. See
> [`PROGRESS.md`](PROGRESS.md) and [`docs/source-audit.md`](docs/source-audit.md).
> The homepage presents the foundation honestly rather than mocking up a
> homepage with invented copy, and is set `noindex` until real content lands.

## Local setup

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script | Does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (flat config) |
| `npm run typecheck` | `tsc --noEmit`, strict |
| `npm test` | Playwright end-to-end |
| `npm run veil` | Regenerate the 3D veil in Blender |

Requires Node 20+. All of lint, typecheck and build currently pass.

## Architecture

```
app/                 App Router. Server Components by default.
  layout.tsx         Fonts (next/font), metadata
  page.tsx           Homepage
  globals.css        Brand tokens — the single source of palette and type
  icon.svg           Favicon
components/three/    The signature 3D veil
  VeilStage.tsx      Capability gate + poster fallback (client)
  VeilScene.tsx      React Three Fiber scene (client, dynamically imported)
lib/                 Hooks and utilities
public/models/       veil-study.glb — Draco, 52 KB
public/posters/      Blender poster + LQIP placeholder
public/draco/gltf/   Self-hosted Draco decoder (see below)
blender/             Veil generation pipeline
docs/                Audit and implementation notes
```

Client components exist only where interaction requires them: the veil stage,
the WebGL scene, and the capability hook. Everything else is a Server
Component.

### Where content will live

Content is **not** in the components. When the source material arrives it lands
in typed modules under `content/`, read through a thin data adapter, so a CMS or
commerce backend can be swapped in later without touching the UI.

## Design tokens

All brand values are CSS custom properties in `app/globals.css` — palette, type
scale, rhythm and motion easing. Change them there and the whole site follows.
Nothing hardcodes a hex value.

Type is Cormorant Garamond (display) and Plus Jakarta Sans (body), self-hosted
by `next/font` at build time — no external request, no layout shift.

## The 3D veil

The signature motif is a real Blender cloth simulation, not a shader trick.
Generation and regeneration are documented in
[`blender/README.md`](blender/README.md); the short version is:

```bash
npm run veil          # or ./blender/scripts/build-veil.sh --fast
```

Web integration constraints, all enforced in `components/three/`:

- **Dynamically imported**, `ssr: false` — three.js compiles to its own ~896 KB
  chunk that is never part of the initial bundle or the critical path.
- **Poster-first.** The Blender render paints immediately; the WebGL canvas
  fades in over it only after the veil has genuinely drawn a frame. Any failure
  — dead driver, blocked context, missing GLB — leaves the poster in place
  rather than an empty hero.
- **Not mounted at all** under `prefers-reduced-motion`, on coarse pointers, on
  fewer than 4 cores, under Data Saver, or without a usable WebGL context.
- **Render loop paused** whenever the canvas is offscreen or the tab is hidden.
- **`aria-hidden`, `pointer-events: none`** — decorative, never in the way of
  content or keyboard focus.

### Draco decoder

`public/draco/gltf/` is vendored from `three/examples/jsm/libs/draco/gltf/`.
drei otherwise fetches the decoder from Google's CDN at runtime, which puts a
third-party request on the critical path of the signature asset. Serving it
locally removes the only external request on the page.

Refresh it after a major `three` upgrade:

```bash
cp node_modules/three/examples/jsm/libs/draco/gltf/draco_{decoder.js,decoder.wasm,wasm_wrapper.js} public/draco/gltf/
```

## Environment variables

Copy `.env.example` to `.env.local`. **The application builds and runs with all
of these unset** — the enquiry form degrades to a clear failure state rather
than a fake success.

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | For correct canonicals | Canonical/OG base URL |
| `RESEND_API_KEY` | For email delivery | Resend API key |
| `ENQUIRY_TO_EMAIL` | For email delivery | Where enquiries are sent |
| `ENQUIRY_FROM_EMAIL` | For email delivery | Verified sender on your domain |

Set them in Vercel under **Settings → Environment Variables**. Never commit
real values — `.env.example` carries names only.

## Deploying to Vercel

Two settings in this repository will break a default Vercel import. Both are
one-time, and both are in the dashboard rather than in code.

> **1 — The app is in a subdirectory.** Vercel looks for `package.json` at the
> repository root, where an unrelated project currently lives.
>
> **2 — The repository's default branch does not contain this app.** The
> default branch is `claude/app-dev-continuation-3jma5n`, which holds that other
> project. Vercel treats the default branch as production, so without changing
> it the production build fails on a missing directory.

### Connect the repository (recommended)

1. <https://vercel.com/new> → **Import** `ronanking/LoveStory`.
2. **Root Directory → `lovestoryatelier-vercel`.** Click *Edit* beside Root
   Directory and select the folder. ← fixes (1)
3. Framework preset: **Next.js** (auto-detected). Leave build and output
   settings at their defaults.
4. Add any environment variables from the table above.
5. **Deploy.** The first deployment builds whichever branch you imported and
   gives you a live URL immediately.
6. Then **Settings → Git → Production Branch** →
   `claude/lovestoryatelier-vercel-rebuild-halnja` → **Save**, and redeploy.
   ← fixes (2)

Every later push builds automatically: the production branch publishes to the
production URL, and every other branch gets its own preview URL.

**The tidier long-term fix** is to make a branch containing this app the
repository default (GitHub → Settings → Branches → *Default branch*), or merge
it into a `main`. Then step 6 is unnecessary and Vercel behaves conventionally.

### Or deploy from your machine

```bash
npm i -g vercel
cd lovestoryatelier-vercel
vercel            # preview
vercel --prod     # production
```

### Custom domain

**Settings → Domains** → add `lovestoryatelier.com`, then point the registrar's
records at Vercel as instructed there.

Do not attach the live domain until real content is in place — the site is
currently `noindex` on purpose. Remove the `robots` block in `app/layout.tsx`
when it is ready to be found.

## Replacing local content with a CMS or commerce backend

The UI reads content through an adapter rather than importing data directly, so
a backend swap is a change in one place:

1. Keep the existing types as the contract.
2. Reimplement the adapter functions against the new source (Sanity, Contentful,
   Shopify Storefront API, anything) — they may be async; the call sites are
   Server Components already.
3. Leave the components untouched.

Enquiry submission is likewise isolated behind an email provider abstraction, so
moving from Resend to another provider or a CRM is a single module.
