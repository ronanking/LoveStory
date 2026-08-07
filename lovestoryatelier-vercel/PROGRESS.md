# Love Story Atelier — Vercel rebuild progress

**Last updated:** 2026-08-07
**Overall status:** ⛔ Still blocked on source material — but the Blender
signature asset is now real and generated. See
[`docs/source-audit.md`](docs/source-audit.md).

## Phase status

| # | Phase | Status | Notes |
|---|---|---|---|
| 1 | Source audit | ⛔ Blocked | Archives and extracted folders absent; live site unreachable from this container. Audit records every route tried. |
| 2 | Architecture & content migration | ⏸ Not started | Needs the theme source for copy, sections and the veil catalogue. |
| 3 | Core responsive UI | ⏸ Not started | Depends on phase 2. |
| 4 | Motion system | ⏸ Not started | Depends on phase 3. |
| 5 | Blender asset generation | ✅ Done | Blender 4.0.2 installed; pipeline runs end to end and exports a real GLB + poster. |
| 6 | Forms & server route | ⏸ Not started | Needs the source form for exact fields and copy. |
| 7 | SEO & metadata | ⏸ Not started | Needs real content; inventing business facts is out of scope. |
| 8 | Testing & visual QA | ⏸ Not started | Nothing to screenshot yet. |
| 9 | Production build & deployment docs | ⏸ Not started | |

## Done

### Environment audit
- Swept the whole filesystem for the source archives and the extracted folders
  across four separate attempts, including `/mnt/attach`, `/opt/rclone-attach`
  and `/mnt/user-data/working`. All empty; zero `.liquid`, zero `.cr3`, zero
  bridal assets.
- Confirmed `ronanking/LoveStory` contains an unrelated project (MacroMatch AU)
  across its entire two-commit history, on every branch.
- Established the network position: **organisation egress policy denies
  `lovestoryatelier.com`, `cdn.shopify.com` and `www.etsy.com`; only GitHub and
  package registries are reachable.** WebFetch reaches the site by a different
  route but is refused `403` by Shopify's bot protection. Details and evidence
  in the audit.

### Blender — signature silk-tulle veil ✅ COMPLETE

**Shipped assets:** `veil-study.glb` (52 KB, Draco, 15,676 tris, alpha-blended,
double-sided) · `veil-study.webp` (208 KB poster) · `veil-study-lqip.webp`
(536 B blur placeholder).

Three review-and-correct passes, documented in `blender/README.md`. The
substantive error was panel width, not cloth-solver settings: a veil's fullness
comes from gathering a wide panel onto a narrow comb, and at 1.15 m there was
never enough fabric to flare. At 2.6 m the cathedral silhouette appears.

- Installed Blender 4.0.2 (it was not present). Two environment fixes were
  needed and are documented in `blender/README.md`: `apt-get update` before
  install, and `python3-numpy`, without which the glTF exporter fails at the
  final step.
- `blender/scripts/veil_study.py` runs end to end: flat cut pattern with
  deliberate asymmetry → pinned comb → cloth sim over a non-exported
  head/shoulder collision proxy → normal and UV cleanup → decimation to a web
  budget → alpha-blended sheer material → three-point studio → Draco GLB +
  Cycles poster.
- Verified with a fast smoke run (2,400 polys → 126 KB GLB) before committing
  to the full-resolution generation.

## Blocked on

**The source material has still not reached this container.** The extracted
folders referenced in the last instruction are not on disk, and the live site
cannot be read from here.

**The one delivery route proven to work is GitHub.** `raw.githubusercontent.com`
is reachable and the repository is readable. Commit the extracted theme folder
and the image library to a branch of `ronanking/LoveStory` — any branch — and
name it, and the content-dependent phases can start immediately.

## Deliberately not done

No page, component or content file has been written. With no source copy or
photography, those would be invented brand voice, invented business facts and
substituted imagery — all explicitly ruled out by the brief, and the middle one
concerns a real trading business.

Search results confirm the business publicly (Brisbane studio, European tulle,
custom embroidery and monograms, cathedral and fingertip veils,
`info@lovestoryatelier.com`). That is enough to confirm identity, and nowhere
near enough to rebuild a site from — so it has not been used as content.

## Next actions once unblocked

1. Extract to `reference/`, complete the real audit: page/section map,
   Liquid→React migration matrix, content-hash image dedup, focal points,
   interaction inventory.
2. Scaffold Next.js App Router + TypeScript strict, brand tokens, `next/font`
   for the Cormorant/Jakarta pairing.
3. Migrate copy into typed content files behind a data-adapter seam.
4. Routes → motion system → enquiry form + API route.
5. Wire the finished GLB into the R3F scene with the poster fallback.
6. Playwright at 1440×1000, 1024×768, 390×844; review and iterate.
7. `pnpm lint && pnpm typecheck && pnpm test && pnpm build`; README and
   `docs/implementation-report.md`.
