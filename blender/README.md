# Blender — silk-tulle veil study

The site's signature 3D motif is a cathedral veil, gathered at the comb and
draped over an invisible shoulder form. It is generated entirely from a
reproducible Python script — there are no manual `.blend` edits to lose.

## Status in this environment

✅ **Blender 4.0.2 is installed and the pipeline has been run successfully.**
The assets in `public/models/` and `public/posters/` are genuine Blender
outputs, not placeholders.

Blender was *not* present initially — it was installed during the build with
`apt-get update && apt-get install -y --no-install-recommends blender`.

### Four gotchas worth recording

1. **`apt-get install blender` fails with exit 100 on a stale package index**
   — the mesa driver dependencies 404. Run `apt-get update` first.
2. **Ubuntu's Blender package does not pull in numpy**, and the glTF exporter
   imports it unconditionally. Without it, everything up to export succeeds and
   then `bpy.ops.export_scene.gltf` dies with `ModuleNotFoundError: No module
   named 'numpy'`. Fix with `apt-get install -y python3-numpy` (Ubuntu's
   Blender links the system Python, so the system package is the right one).
3. **Draco compression silently no-ops on this build.** The exporter *accepts*
   every `export_draco_mesh_compression_*` flag, but the native encoder
   (`libextern_draco.so`) is absent, so the GLB comes out uncompressed with no
   error — 936 KB rather than the expected ~70 KB. The script now verifies the
   written file for `KHR_draco_mesh_compression` and warns when it is missing,
   instead of trusting the flag. Compression is handled as a post-step
   (see below), which is reliable regardless of how Blender was built.
4. **Cycles here has no denoiser at all** — `scene.cycles.denoiser` enumerates
   empty, and setting `use_denoising = True` fails the render outright with
   `Error: Build without OpenImageDenoiser` rather than degrading gracefully.
   The script detects this and triples the sample count to compensate.

## Build (recommended)

One command does everything, including the compression post-step:

```bash
./blender/scripts/build-veil.sh          # full quality
./blender/scripts/build-veil.sh --fast   # quick drape iteration, no poster
```

It runs Blender, compresses the GLB with `@gltf-transform/cli`, and then
**asserts** that Draco actually applied and that the material kept its alpha
blending and double-sidedness — so a silently-uncompressed or visually broken
asset fails the build rather than shipping.

Measured on this machine: **936 KB → 66 KB** (93% smaller). Welding merged
duplicate vertices 23,797 → 13,264 while triangles only fell 28,800 → 26,073,
and `alphaMode: BLEND`, `doubleSided: true`, sheen, specular and IOR all
survived intact.

## Install

| Platform | Command |
|---|---|
| macOS | `brew install --cask blender` |
| Debian/Ubuntu | `sudo apt-get update && sudo apt-get install -y blender python3-numpy` |
| Fedora | `sudo dnf install blender python3-numpy` |
| Any | Download from <https://www.blender.org/download/> |

Verify with `blender --version` — 3.6 or newer is required (the glTF exporter's
Draco flags and the 4.x Principled BSDF socket names are both handled).

## Generate (manual, without the wrapper)

From the **project root** (`lovestoryatelier-vercel/`), not from `blender/`:

```bash
blender --background --factory-startup \
  --python blender/scripts/veil_study.py -- \
  --render --save-blend
```

That is the canonical command. It writes:

| File | Purpose | Tracked |
|---|---|---|
| `public/models/veil-study.glb` | Draco-compressed mesh loaded by the R3F scene — **52 KB** | ✅ |
| `public/posters/veil-study.webp` | Pre-rendered fallback — **208 KB** | ✅ |
| `public/posters/veil-study-lqip.webp` | 32 px blur placeholder — **536 B** | ✅ |
| `public/posters/veil-study.png` | Cycles intermediate, 1.4 MB | ❌ gitignored |
| `blender/source/veil-study.blend` | Editable scene, only with `--save-blend` | ❌ gitignored (regenerable, 2.7 MB, churns) |

The WebP and LQIP require Pillow. Blender's bundled Python may not have it —
`pip3 install pillow` (the Debian `python3-pil` package failed to load its
`_imaging` C extension here). Without Pillow the script keeps the PNG and tells
you the `cwebp` command to run.

Runtime is roughly 40–90 s for the sim and decimation, plus 3–8 minutes for the
Cycles poster on CPU. Drop `--render` to regenerate only the GLB, which is the
fast path while iterating on the drape.

## Options

| Flag | Default | Notes |
|---|---|---|
| `--frames` | `90` | Cloth frames. Below ~60 the hem hasn't settled; above ~120 gains nothing. |
| `--width` | `1.15` | Hem width in metres. |
| `--length` | `2.35` | Cathedral length in metres. |
| `--res-u` / `--res-v` | `96` / `150` | Sim grid density. Raise for finer folds, then rely on decimation. |
| `--target-tris` | `34000` | Decimate budget for the exported mesh. |
| `--samples` | `256` | Cycles samples for the poster. Tripled automatically when no denoiser is available. |
| `--poster-width` / `--poster-height` | `1600` / `2000` | Poster resolution. Lower these on few-core machines — Cycles renders sheer fabric slowly because of the transparent bounce count. |
| `--render` | off | Also render the fallback poster. |
| `--save-blend` | off | Also write the editable scene. |

## How it works

1. **Flat pattern** — a subdivided grid remapped into the shape a veil is
   actually cut from: tapered toward the comb, elliptical at the hem, with a
   ~4.5% left/right asymmetry so the drape never resolves symmetrically.
2. **Pin group** — vertices within 16 cm of the comb and 8.5 cm of centre are
   pinned. Everything below is free, which is what produces the gathered fan.
3. **Collision proxy** — a head sphere and a scaled shoulder sphere the cloth
   breaks over. These are `hide_render = True` and are never exported; without
   them the veil hangs as a flat sheet and the folds look CG.
4. **Cloth sim** — tuned for tulle rather than default cotton. The parameter
   that matters most is `bending_stiffness = 0.06`: tulle barely resists
   folding. `air_damping = 1.6` makes the net catch air on the way down. A weak
   noisy wind field biases the settle so the result is organic.
5. **Topology** — normals recalculated outward, fresh smart-projected UVs (the
   sim stretches the originals badly), smooth shading, then decimation into the
   web budget.
6. **Material** — alpha-blended sheer, not glass transmission.
   `KHR_materials_transmission` is unevenly supported on mobile browsers,
   whereas glTF blend mode and double-sidedness are universal. A 780-scale
   noise modulates opacity to give the fabric its net structure, and a Fresnel
   term densifies edge-on folds the way stacked tulle really behaves.
7. **Studio** — broad key softbox, champagne rim, low bounce, 85 mm lens at
   f/2.8 with DOF. World is brand cream at low strength; the render is filmed
   on a transparent background so it composites over any section.

## Art direction — what three review passes changed

Each render was reviewed and corrected rather than accepted. Recorded because
the failures are not obvious in advance and are easy to reintroduce:

| Pass | What it looked like | Cause | Fix |
|---|---|---|---|
| 1 | A narrow opaque column, comb cropped out of frame | Pinned a near-point (8.5 cm) so the sheet funnelled inward; camera on hand-guessed Euler angles | Pin across a real comb width; aim with a `TRACK_TO` constraint |
| 2 | Heavy satin, correct folds, mostly empty frame | Panel only 1.15 m wide — not enough fabric to flare; per-layer alpha far too high | Camera 5.6 m → 3.5 m; alpha 0.10–0.30 → 0.035–0.115 |
| 3 | Cathedral silhouette, elegant drape ✅ | — | Width 1.15 m → **2.6 m**; alpha → 0.014–0.048 |

**The width was the substantive error.** A veil's fullness comes from gathering
a wide panel onto a narrow comb — at 1.15 m no amount of cloth-sim tuning would
have produced a cathedral silhouette.

### Still tunable

The current material reads slightly closer to silk than to sheer tulle. Stacked
layers compound: at ~0.05 alpha per layer, twenty overlapping layers reach
~0.64 opacity, and the folds concentrate that further. To take it sheerer,
lower the two `alpha_ramp` element colours in `build_tulle_material()`.

This has deliberately **not** been dialled in further, because matching the
fabric to Love Story Atelier's actual veils needs their photography as
reference. Tune it against a real product shot rather than in the abstract.

## Regenerating after a change

The script is deterministic apart from the cloth solver, which is itself seeded
by the fixed scene. Re-running with identical flags reproduces the same drape.
Changing `--frames`, `--res-u` or `--res-v` changes the folds — treat those as
art direction, and if you find a drape you like, record the exact command in
your commit message.

## Web integration

The GLB is consumed by the React Three Fiber scene under `components/three/`.
Constraints enforced there, not here:

- dynamically imported, never in the critical rendering path
- not mounted at all under `prefers-reduced-motion`, on coarse pointers, or on
  low `hardwareConcurrency` — those clients get the poster image
- render loop paused when the canvas is offscreen or the tab is hidden

If the GLB is missing at build time the scene falls back to the procedural
tulle surface, so the site builds and deploys correctly before this pipeline
has ever been run.
