#!/usr/bin/env bash
#
# Love Story Atelier — one-command veil asset build.
#
# Generates the veil in Blender, then compresses the GLB with gltf-transform.
# The second step is not optional polish: many Blender builds (Ubuntu's
# included) ship the glTF exporter's Draco Python glue without the native
# encoder library, so `--export_draco_mesh_compression_enable` silently
# no-ops and you get an uncompressed file. Compressing here is reliable
# regardless of how Blender was built.
#
# Usage:
#   ./blender/scripts/build-veil.sh            # full quality
#   ./blender/scripts/build-veil.sh --fast     # quick iteration, no poster
#
# Run from the project root.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

GLB="public/models/veil-study.glb"

FRAMES=90
RES_U=96
RES_V=150
TARGET_TRIS=26000
SAMPLES=48
POSTER_W=1100
POSTER_H=1375
RENDER="--render"

if [[ "${1:-}" == "--fast" ]]; then
  FRAMES=25; RES_U=48; RES_V=72; TARGET_TRIS=10000; RENDER=""
  echo "==> fast mode: low-res drape, no poster render"
fi

command -v blender >/dev/null 2>&1 || {
  echo "error: blender not found. See blender/README.md for install steps." >&2
  exit 1
}

echo "==> Blender $(blender --version | head -1 | awk '{print $2}')"

blender --background --factory-startup \
  --python blender/scripts/veil_study.py -- \
  --frames "$FRAMES" \
  --res-u "$RES_U" --res-v "$RES_V" \
  --target-tris "$TARGET_TRIS" \
  --samples "$SAMPLES" \
  --poster-width "$POSTER_W" --poster-height "$POSTER_H" \
  $RENDER --save-blend

[[ -f "$GLB" ]] || { echo "error: $GLB was not produced" >&2; exit 1; }

before=$(wc -c < "$GLB")

echo "==> compressing GLB (weld + simplify + Draco)"
npx --yes @gltf-transform/cli@4 optimize "$GLB" "$GLB" \
  --compress draco \
  --simplify-error 0.0005 \
  --texture-compress webp

after=$(wc -c < "$GLB")
echo "==> $GLB: $((before / 1024)) KB -> $((after / 1024)) KB"

# Fail loudly if compression did not actually land, rather than shipping a
# 900 KB asset that the docs claim is compressed.
python3 - "$GLB" <<'PY'
import json, struct, sys
data = open(sys.argv[1], "rb").read()
offset = 12
while offset + 8 <= len(data):
    length, _ = struct.unpack("<II", data[offset:offset + 8])
    if data[offset + 4:offset + 8] == b"JSON":
        doc = json.loads(data[offset + 8:offset + 8 + length])
        used = doc.get("extensionsUsed", [])
        assert "KHR_draco_mesh_compression" in used, f"Draco missing: {used}"
        mat = doc["materials"][0]
        assert mat.get("alphaMode") == "BLEND", "lost alpha blending"
        assert mat.get("doubleSided") is True, "lost double-sided"
        prim = doc["meshes"][0]["primitives"][0]
        tris = doc["accessors"][prim["indices"]]["count"] // 3
        print(f"==> verified: {tris} tris, Draco on, alpha BLEND, double-sided")
        break
    offset += 8 + length
PY

echo "==> done."
