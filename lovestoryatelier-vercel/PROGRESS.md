# Love Story Atelier — Vercel rebuild progress

**Last updated:** 2026-08-07
**Overall status:** ⛔ Blocked on source material. See
[`docs/source-audit.md`](docs/source-audit.md).

## Phase status

| # | Phase | Status | Notes |
|---|---|---|---|
| 1 | Source audit | ⛔ Blocked | Neither archive present anywhere on disk. Audit records the search and the unblock routes. |
| 2 | Architecture & content migration | ⏸ Not started | Needs the Liquid theme for copy, sections and the fallback veil catalogue. |
| 3 | Core responsive UI | ⏸ Not started | Depends on phase 2. |
| 4 | Motion system | ⏸ Not started | Depends on phase 3. |
| 5 | Blender asset generation | 🟡 Partial | Scripts and docs complete. Blender is not installed, so no GLB or poster has been generated. |
| 6 | Forms & server route | ⏸ Not started | Field groups are known from the brief, but the source form is needed for exact fields and copy. |
| 7 | SEO & metadata | ⏸ Not started | Depends on real content; inventing business facts is explicitly out of scope. |
| 8 | Testing & visual QA | ⏸ Not started | Nothing to screenshot yet. |
| 9 | Production build & deployment docs | ⏸ Not started | |

## Done

- Full-environment audit for the two source archives — filesystem, git history
  across all branches, upload mounts, connected services. All negative.
- Confirmed `ronanking/LoveStory` contains an unrelated project (MacroMatch AU).
- Confirmed Blender is absent, having searched the standard install locations
  the brief requires before concluding so.
- `blender/scripts/veil_study.py` — complete, syntax-verified silk-tulle veil
  pipeline: flat pattern with deliberate asymmetry, pinned comb, collision
  proxy, tulle-tuned cloth sim, normal/UV cleanup, decimation to a web budget,
  alpha-blended sheer material, three-point studio, Draco GLB export, Cycles
  poster render. Handles both Blender 3.6 and 4.x APIs.
- `blender/README.md` — install matrix, canonical command, every parameter, how
  the drape is produced, and the web-integration constraints.
- `docs/source-audit.md` — the audit, honestly scoped to what exists.

## Blocked on

**The source material.** Any one of:

1. Re-attach `lovestoryatelier-animated.zip` and the drive-download image
   archive. Attachments have not been landing on this container's filesystem —
   if that repeats, push the archives to a branch and name it.
2. Re-authorise the Shopify connector against the "pratice" store (partial:
   products, copy, web-res images — no Liquid, no animation layer, no RAWs).
3. Provide the live site URL (partial: copy, structure, palette only).

## Deliberately not done

No page, component or content file has been written. With no source copy or
photography, those would be invented brand voice, invented business facts and
stock imagery — all three explicitly ruled out by the brief, and the last two
are claims about a real trading business.

## Next actions once unblocked

1. Extract archives to `reference/`, complete the real audit: page/section map,
   Liquid→React migration matrix, image inventory with content-hash dedup,
   focal points, interaction inventory.
2. Scaffold Next.js App Router + TypeScript strict, brand tokens from the
   supplied palette, `next/font` for the Cormorant/Jakarta pairing.
3. Migrate copy into typed content files behind a data-adapter seam.
4. Build routes, then the motion system, then the enquiry form and API route.
5. Run the Blender pipeline on a machine that has Blender; commit the GLB and
   poster.
6. Playwright screenshots at 1440×1000, 1024×768, 390×844; review and iterate.
7. `pnpm lint && pnpm typecheck && pnpm test && pnpm build`; write README and
   `docs/implementation-report.md`.
