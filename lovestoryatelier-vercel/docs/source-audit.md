# Source audit

**Date:** 2026-08-07
**Status:** ⛔ Blocked — neither source archive is present in this environment.

This document is the audit the brief asked for. It cannot yet contain the page
map, content migration matrix, image inventory or interaction inventory,
because the inputs those are derived from do not exist on this machine. What it
records instead is exactly what was searched, what was found, and what is
needed to proceed.

## What was expected

| Archive | Contents per brief | Found |
|---|---|---|
| `lovestoryatelier-animated.zip` | Shopify Liquid theme + current web assets | ❌ No |
| `drive-download-20260807T022108Z-1-001.zip` | Bridal image library (JPG/PNG/JPEG/CR3) | ❌ No |

## What was searched

Working directory, git history, whole filesystem, upload mounts, connected
services:

```
find / -iname "*lovestoryatelier*" -o -iname "drive-download-*"   → 0 results
find / -iname "*.liquid"                                          → 0 results
find / -iname "*.cr3"                                             → 0 results
find / \( -iname "*veil*" -o -iname "*bridal*" -o -iname "*atelier*" \)
                              → 0 results (only Go stdlib "unveil_openbsd.go")
find /home /mnt /media /srv /data -iname "*.zip"                  → 0 results
git log --all --pretty=format: --name-only | grep -iE "liquid|veil|bridal"
                                                                  → 0 results
ls /mnt/attach  /opt/rclone-attach                                → both empty
```

## What the repository actually contains

`ronanking/LoveStory`, cloned fresh at session start, holds an **unrelated
project**: *MacroMatch AU*, an Australian calorie and macro tracker.

- `src/` — Vite + React app (`TodayView`, `EatSheet`, `SetupWizard`, `LearnView`, `ProfileView`)
- `ingest/` — Python food-data ingestion pipeline with 21 tests
- `supabase/` — `schema_app.sql`, `schema_ingest.sql`
- `docs/HANDOFF.md`, `docs/SOURCES_REPORT.md`
- Full history is 2 commits, neither containing bridal or Liquid assets

There is no Love Story Atelier code or photography in this repository at any
point in its history. The repository name is the only connection.

## Connected services

| Service | State |
|---|---|
| Shopify | Was connected to **NaviGuard** (`naviguard.store`), not Love Story Atelier. Switched away on request toward a store named "pratice"; the connector now requires re-authorisation, which cannot be completed from a non-interactive session. |
| GitHub | Scoped to `ronanking/lovestory`. `list_repos` shows only `ronanking/LoveStory` and `ronanking/Tradieconnect`. |

## Build toolchain available

| Tool | Version | Notes |
|---|---|---|
| Node | 22.22.2 | ✅ |
| pnpm | 10.33.0 | ✅ |
| npm | 10.9.7 | ✅ |
| Python | 3.11.15 | ✅ |
| Blender | — | ❌ Not installed. See `blender/README.md` for the locations searched. |
| ImageMagick / exiftool / dcraw | — | ❌ Not installed; needed for the RAW/derivative pipeline. |

## Why the build did not proceed on assumptions

The brief's own acceptance criteria make substituted content a failure rather
than a shortcut:

- "the source brand copy and photography are visibly represented"
- "Do not use AI-generated replacement brides or stock imagery. The supplied
  photography is the brand asset."
- "Do not invent prices when the source files do not provide trustworthy prices"
- "Do not invent awards, review counts, pricing, shipping claims, turnaround
  times or business facts beyond what the source files already state."
- "Do not create a generic wedding template."

Proceeding without the archives would mean inventing copy, prices and
turnaround times for a real trading business, and shipping a template with no
photography — the specific outcome the brief rules out. So content-dependent
work is deferred rather than guessed at.

## What was built anyway

Work that is fully specified by the brief and genuinely independent of the
archives:

- `blender/scripts/veil_study.py` — the complete silk-tulle veil pipeline
- `blender/README.md` — install, canonical command, parameters, integration

## To unblock

Any one of these is sufficient for the photography and copy:

1. **Re-attach both archives** to the session — the only route that supplies
   the Liquid theme, the existing animation layer, *and* the CR3 originals.
   Note that attachments have not been reaching this container's filesystem;
   if re-attaching fails again, committing the archives to a branch of
   `ronanking/LoveStory` and telling me the branch name works reliably.
2. **Re-authorise the Shopify connector** and select the "pratice" store.
   Supplies products, copy and web-resolution imagery — but not the Liquid
   source, not the animation code, and not the RAW originals.
3. **Supply the live site URL** — recovers copy, structure and palette only.
