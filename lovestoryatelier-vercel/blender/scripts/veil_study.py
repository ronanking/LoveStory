"""
Love Story Atelier — silk-tulle veil study.

Generates the signature 3D motif: a cathedral veil gathered at the comb,
draped over an invisible shoulder form, simulated with cloth physics so the
folds are real rather than a noise-displaced plane.

Outputs:
  public/models/veil-study.glb    web-ready, Draco-compressed, alpha-blended
  public/posters/veil-study.webp  pre-rendered fallback for reduced-motion /
                                  low-power clients (rendered as PNG, then
                                  converted if Pillow is available)
  blender/source/veil-study.blend optional editable scene

Run headless:
    blender --background --factory-startup --python blender/scripts/veil_study.py

With options (note the bare `--` separating Blender's args from ours):
    blender --background --factory-startup \
        --python blender/scripts/veil_study.py -- \
        --frames 90 --target-tris 34000 --render --save-blend

Tested against the Blender 3.6 LTS and 4.x Python APIs. Socket names on the
Principled BSDF changed in 4.0, so material wiring goes through `_socket()`
which resolves either spelling.
"""

from __future__ import annotations

import argparse
import math
import os
import sys

import bpy  # type: ignore[import-not-found]
import bmesh  # type: ignore[import-not-found]
from mathutils import Vector  # type: ignore[import-not-found]


# --------------------------------------------------------------------------
# Brand tokens — kept in sync with the site's CSS custom properties so the
# render sits in the same palette as the photography around it.
# --------------------------------------------------------------------------
CREAM = (0.969, 0.957, 0.929, 1.0)        # #f7f4ed
SOFT_CHAMPAGNE = (0.910, 0.863, 0.769, 1.0)  # #e8dcc4
CHAMPAGNE = (0.788, 0.675, 0.510, 1.0)    # #c9ac82

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


def parse_args() -> argparse.Namespace:
    """Read args after the `--` sentinel Blender uses to hand off to scripts."""
    argv = sys.argv
    argv = argv[argv.index("--") + 1:] if "--" in argv else []

    parser = argparse.ArgumentParser(prog="veil_study")
    parser.add_argument("--frames", type=int, default=90,
                        help="cloth sim frames to settle the drape")
    parser.add_argument("--width", type=float, default=1.15,
                        help="veil width in metres at the hem")
    parser.add_argument("--length", type=float, default=2.35,
                        help="veil length in metres (cathedral)")
    parser.add_argument("--res-u", type=int, default=96,
                        help="grid subdivisions across the width")
    parser.add_argument("--res-v", type=int, default=150,
                        help="grid subdivisions along the length")
    parser.add_argument("--target-tris", type=int, default=34000,
                        help="decimate target for the exported mesh")
    parser.add_argument("--render", action="store_true",
                        help="also render the poster fallback image")
    parser.add_argument("--samples", type=int, default=256,
                        help="Cycles samples for the poster render")
    parser.add_argument("--save-blend", action="store_true",
                        help="save the editable .blend to blender/source/")
    parser.add_argument("--outdir", default=REPO_ROOT,
                        help="project root that contains public/")
    return parser.parse_args()


def reset_scene() -> None:
    """Factory-startup still ships a cube, camera and lamp. Clear everything."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.frame_start = 1


# --------------------------------------------------------------------------
# Mesh
# --------------------------------------------------------------------------
def build_veil_mesh(width: float, length: float, res_u: int, res_v: int):
    """
    A flat panel that tapers slightly toward the comb and rounds at the hem —
    the flat pattern a veil is actually cut from, before it is gathered.
    """
    mesh = bpy.data.meshes.new("VeilPanel")
    obj = bpy.data.objects.new("Veil", mesh)
    bpy.context.collection.objects.link(obj)

    bm = bmesh.new()
    bmesh.ops.create_grid(
        bm, x_segments=res_u, y_segments=res_v, size=1.0, calc_uvs=True
    )

    half_w = width / 2.0
    for vert in bm.verts:
        # grid comes in on -1..1; remap to 0..1 along the length (v=0 at comb)
        u = vert.co.x
        v = (vert.co.y + 1.0) * 0.5

        # Taper: narrow at the comb, full width at the hem, eased so the
        # flare reads as fabric rather than a cone.
        taper = 0.34 + 0.66 * (v ** 0.72)

        # Subtle asymmetry — a real veil is never pinned dead centre. This
        # biases the left drape slightly longer, which the sim then amplifies.
        asym = 1.0 + 0.045 * math.sin(v * math.pi) * (1.0 if u < 0 else -1.0)

        # Round the hem corners so the trailing edge is elliptical.
        hem_round = 1.0 - 0.18 * max(0.0, v - 0.82) / 0.18 * (u ** 2)

        vert.co.x = u * half_w * taper * asym * hem_round
        vert.co.y = (v - 1.0) * length
        vert.co.z = 0.0

    bm.to_mesh(mesh)
    bm.free()

    # Lay the panel out along +Z so the comb sits at the top of the scene.
    obj.rotation_euler = (math.radians(88.0), 0.0, 0.0)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

    # Lift so the hem clears the floor.
    obj.location = Vector((0.0, 0.0, length * 0.98))

    return obj


def add_pin_group(obj, gather_span: float = 0.16) -> None:
    """
    Pin the vertices nearest the comb. Everything else is free to fall, which
    is what produces the gathered fan of folds under the comb.
    """
    group = obj.vertex_groups.new(name="pin")
    mesh = obj.data
    top_z = max(v.co.z for v in mesh.vertices)

    pinned = [
        v.index for v in mesh.vertices
        if v.co.z > top_z - gather_span and abs(v.co.x) < 0.085
    ]
    group.add(pinned, 1.0, "REPLACE")


def add_shoulder_form():
    """
    A collision proxy — head and shoulders. Never exported; it exists purely so
    the cloth has something to break over, which is where the good folds come
    from. Without it the veil hangs as a flat sheet.
    """
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.105, location=(0, 0, 2.24))
    head = bpy.context.active_object
    head.name = "CollisionHead"

    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.20, location=(0, 0.02, 1.98))
    torso = bpy.context.active_object
    torso.name = "CollisionShoulders"
    torso.scale = (1.42, 0.72, 0.62)

    for proxy in (head, torso):
        proxy.modifiers.new(name="Collision", type="COLLISION")
        proxy.collision.thickness_outer = 0.012
        proxy.collision.damping = 0.6
        proxy.hide_render = True
        proxy.hide_viewport = False  # must stay visible for the sim to see it

    return head, torso


def simulate_drape(obj, frames: int) -> None:
    """Cloth settings dialled for tulle: near-weightless, low bend, high air drag."""
    bpy.context.view_layer.objects.active = obj

    cloth = obj.modifiers.new(name="Cloth", type="CLOTH")
    settings = cloth.settings

    settings.quality = 8
    settings.mass = 0.055               # tulle is very light
    settings.tension_stiffness = 6.0
    settings.compression_stiffness = 6.0
    settings.shear_stiffness = 4.0
    settings.bending_stiffness = 0.06   # the key tulle parameter — barely resists
    settings.tension_damping = 3.0
    settings.compression_damping = 3.0
    settings.shear_damping = 3.0
    settings.air_damping = 1.6          # net catches air; slows the fall
    settings.use_pressure = False
    settings.vertex_group_mass = "pin"

    collision = cloth.collision_settings
    collision.use_self_collision = True
    collision.self_distance_min = 0.003
    collision.distance_min = 0.004
    collision.collision_quality = 5

    # A whisper of wind so the drape settles asymmetrically rather than
    # symmetrically — this is what stops it reading as a CG plane.
    bpy.ops.object.effector_add(type="WIND", location=(1.4, -0.9, 1.7))
    wind = bpy.context.active_object
    wind.name = "BreathWind"
    wind.rotation_euler = (math.radians(74), 0.0, math.radians(122))
    wind.field.strength = 0.85
    wind.field.noise = 1.4
    wind.field.flow = 0.4

    scene = bpy.context.scene
    scene.frame_end = frames

    # Step the sim frame by frame so the point cache fills deterministically
    # in background mode.
    bpy.context.view_layer.objects.active = obj
    for frame in range(1, frames + 1):
        scene.frame_set(frame)

    bpy.ops.object.modifier_apply(modifier=cloth.name)


def finalise_topology(obj, target_tris: int) -> None:
    """Clean normals and UVs, then bring the triangle count into web budget."""
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)

    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.normals_make_consistent(inside=False)
    # Project fresh UVs — the sim has stretched the originals.
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.004)
    bpy.ops.object.mode_set(mode="OBJECT")

    bpy.ops.object.shade_smooth()

    current_tris = len(obj.data.polygons) * 2
    if current_tris > target_tris:
        decimate = obj.modifiers.new(name="Decimate", type="DECIMATE")
        decimate.ratio = max(0.05, target_tris / float(current_tris))
        bpy.ops.object.modifier_apply(modifier=decimate.name)

    print(f"[veil] final polygons: {len(obj.data.polygons)}")


# --------------------------------------------------------------------------
# Material
# --------------------------------------------------------------------------
def _socket(node, *names):
    """Resolve a Principled BSDF input across Blender 3.x / 4.x namings."""
    for name in names:
        if name in node.inputs:
            return node.inputs[name]
    return None


def _set(node, value, *names) -> None:
    socket = _socket(node, *names)
    if socket is not None:
        socket.default_value = value


def build_tulle_material(obj):
    """
    Alpha-blended sheer rather than glass transmission: glTF carries blend mode
    and double-sidedness reliably everywhere, whereas KHR_materials_transmission
    is patchy across mobile browsers. A subtle noise-driven alpha gives the
    fabric its net structure so it isn't a uniformly foggy sheet.
    """
    mat = bpy.data.materials.new(name="SilkTulle")
    mat.use_nodes = True
    mat.blend_method = "BLEND"
    mat.show_transparent_back = True
    mat.use_backface_culling = False
    if hasattr(mat, "shadow_method"):  # removed in 4.2+
        mat.shadow_method = "HASHED"

    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (620, 0)

    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (300, 0)
    _set(bsdf, SOFT_CHAMPAGNE, "Base Color")
    _set(bsdf, 0.44, "Roughness")
    _set(bsdf, 0.0, "Metallic")
    _set(bsdf, 0.62, "Sheen Weight", "Sheen")
    _set(bsdf, CREAM, "Sheen Tint")
    _set(bsdf, 0.28, "Specular IOR Level", "Specular")
    _set(bsdf, 1.46, "IOR")

    # Fine mesh structure: high-frequency noise modulating opacity.
    tex_coord = nodes.new("ShaderNodeTexCoord")
    tex_coord.location = (-620, -180)

    noise = nodes.new("ShaderNodeTexNoise")
    noise.location = (-420, -180)
    noise.inputs["Scale"].default_value = 780.0
    noise.inputs["Detail"].default_value = 2.0
    noise.inputs["Roughness"].default_value = 0.42
    links.new(tex_coord.outputs["UV"], noise.inputs["Vector"])

    # Fresnel so edge-on folds densify — the way stacked tulle actually reads.
    fresnel = nodes.new("ShaderNodeFresnel")
    fresnel.location = (-420, 60)
    fresnel.inputs["IOR"].default_value = 1.32

    alpha_ramp = nodes.new("ShaderNodeValToRGB")
    alpha_ramp.location = (-220, -180)
    alpha_ramp.color_ramp.elements[0].position = 0.36
    alpha_ramp.color_ramp.elements[0].color = (0.10, 0.10, 0.10, 1.0)
    alpha_ramp.color_ramp.elements[1].position = 0.70
    alpha_ramp.color_ramp.elements[1].color = (0.30, 0.30, 0.30, 1.0)
    links.new(noise.outputs["Fac"], alpha_ramp.inputs["Fac"])

    mix_alpha = nodes.new("ShaderNodeMixRGB")
    mix_alpha.location = (40, -120)
    mix_alpha.blend_type = "ADD"
    mix_alpha.inputs["Fac"].default_value = 0.55
    links.new(alpha_ramp.outputs["Color"], mix_alpha.inputs["Color1"])
    links.new(fresnel.outputs["Fac"], mix_alpha.inputs["Color2"])

    links.new(mix_alpha.outputs["Color"], _socket(bsdf, "Alpha"))
    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])

    obj.data.materials.clear()
    obj.data.materials.append(mat)
    return mat


# --------------------------------------------------------------------------
# Lighting, camera, world
# --------------------------------------------------------------------------
def build_studio(length: float):
    """Soft three-point studio: broad key, cool rim, low champagne bounce."""
    world = bpy.data.worlds.new("AtelierWorld")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = CREAM
    bg.inputs["Strength"].default_value = 0.42

    def area(name, loc, rot, size, energy, color):
        light_data = bpy.data.lights.new(name=name, type="AREA")
        light_data.shape = "RECTANGLE"
        light_data.size = size
        light_data.size_y = size * 1.9
        light_data.energy = energy
        light_data.color = color[:3]
        light = bpy.data.objects.new(name, light_data)
        bpy.context.collection.objects.link(light)
        light.location = loc
        light.rotation_euler = rot
        return light

    area("KeySoftbox", (2.1, -2.6, 2.9), (math.radians(62), 0, math.radians(40)),
         2.4, 420.0, CREAM)
    area("RimLight", (-2.5, 1.9, 2.6), (math.radians(72), 0, math.radians(-126)),
         1.6, 260.0, SOFT_CHAMPAGNE)
    area("Bounce", (0.0, -1.4, 0.25), (math.radians(-16), 0, 0),
         3.0, 90.0, CHAMPAGNE)

    cam_data = bpy.data.cameras.new("PosterCam")
    cam_data.lens = 85.0
    cam_data.sensor_width = 36.0
    cam_data.dof.use_dof = True
    cam_data.dof.focus_distance = 4.4
    cam_data.dof.aperture_fstop = 2.8

    cam = bpy.data.objects.new("PosterCam", cam_data)
    bpy.context.collection.objects.link(cam)
    cam.location = (1.35, -4.2, length * 0.62)
    cam.rotation_euler = (math.radians(80.5), 0.0, math.radians(18.5))
    bpy.context.scene.camera = cam
    return cam


# --------------------------------------------------------------------------
# Output
# --------------------------------------------------------------------------
def export_glb(obj, outdir: str) -> str:
    path = os.path.join(outdir, "public", "models", "veil-study.glb")
    os.makedirs(os.path.dirname(path), exist_ok=True)

    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

    kwargs = dict(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_normals=True,
        export_texcoords=True,
        export_materials="EXPORT",
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
    )
    try:
        bpy.ops.export_scene.gltf(**kwargs)
    except TypeError:
        # Older/newer builds drop or rename Draco flags; retry without them.
        for key in list(kwargs):
            if "draco" in key:
                kwargs.pop(key)
        bpy.ops.export_scene.gltf(**kwargs)

    print(f"[veil] exported {path} ({os.path.getsize(path) / 1024:.0f} KB)")
    return path


def render_poster(outdir: str, samples: int) -> str:
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    try:
        scene.cycles.device = "CPU"
        scene.cycles.samples = samples
        scene.cycles.use_denoising = True
        # Transparent bounces matter enormously for stacked sheer fabric.
        scene.cycles.transparent_max_bounces = 32
        scene.cycles.transmission_bounces = 24
    except AttributeError:
        pass

    scene.render.resolution_x = 1600
    scene.render.resolution_y = 2000
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.view_settings.view_transform = "Filmic" if "Filmic" in [
        v.name for v in
        scene.view_settings.bl_rna.properties["view_transform"].enum_items
    ] else "Standard"

    path = os.path.join(outdir, "public", "posters", "veil-study.png")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)

    print(f"[veil] rendered {path}")
    _try_webp(path)
    return path


def _try_webp(png_path: str) -> None:
    """Convert to WebP when Pillow is present in Blender's bundled Python."""
    try:
        from PIL import Image  # type: ignore[import-not-found]
    except ImportError:
        print("[veil] Pillow unavailable — keeping PNG poster only. "
              "Convert with: cwebp -q 82 veil-study.png -o veil-study.webp")
        return

    webp_path = os.path.splitext(png_path)[0] + ".webp"
    Image.open(png_path).save(webp_path, "WEBP", quality=82, method=6)
    print(f"[veil] converted {webp_path}")


def main() -> None:
    args = parse_args()

    reset_scene()
    veil = build_veil_mesh(args.width, args.length, args.res_u, args.res_v)
    add_pin_group(veil)
    add_shoulder_form()
    simulate_drape(veil, args.frames)
    finalise_topology(veil, args.target_tris)
    build_tulle_material(veil)
    build_studio(args.length)

    export_glb(veil, args.outdir)

    if args.render:
        render_poster(args.outdir, args.samples)

    if args.save_blend:
        blend_path = os.path.join(
            args.outdir, "blender", "source", "veil-study.blend"
        )
        os.makedirs(os.path.dirname(blend_path), exist_ok=True)
        bpy.ops.wm.save_as_mainfile(filepath=blend_path)
        print(f"[veil] saved {blend_path}")

    print("[veil] done.")


if __name__ == "__main__":
    main()
