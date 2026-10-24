"""
Semi-realistic escort craft for the landing page: plated hull with panel
seams, glossy canopy, swept wings, twin engine nacelles. Same footprint as
../ship.py (nose along Blender +Y = three.js -Z, ~2.6 units long), so the
runtime scale carries over.

Runtime hooks:
  EngineGlow  emissive material on the nozzle discs; pulse it.
"""

import math
import os
import sys

import bpy

sys.path.append(os.path.dirname(__file__))
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from common import loft, prism  # noqa: E402
from common_hd import (  # noqa: E402
    apply_modifiers,
    box_uv,
    export_glb_hd,
    join,
    panel_textures,
    parse_args,
    pbr_material,
    render_preview,
    reset_scene,
    smooth,
)


def hard_surface(obj, angle=35):
    """Smooth curved faces but keep creases sharp."""
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.shade_smooth_by_angle(angle=math.radians(angle))
    return obj


def section(y, w, h, z=0.0, n=24, e=2.6):
    """Superellipse ring: boxier than an ellipse, softer than a rectangle."""
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n
        c, s = math.cos(a), math.sin(a)
        x = w * math.copysign(abs(c) ** (2 / e), c)
        zz = z + h * math.copysign(abs(s) ** (2 / e), s)
        pts.append((x, y, zz))
    return pts


def cylinder_y(name, radius, depth, x, y, z, mat, verts=32):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=verts, radius=radius, depth=depth, location=(x, y, z), rotation=(math.pi / 2, 0, 0)
    )
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(mat)
    return obj


def build():
    hull_mat = pbr_material("Hull", *panel_textures("Hull", 1024, "#c8cbd1", 1, panels=8, metal=0.5, rough=(0.28, 0.5)))
    dark_mat = pbr_material("DarkMetal", *panel_textures("Dark", 512, "#3b3e45", 2, panels=4, metal=0.85, rough=(0.3, 0.45)))
    glass_mat = pbr_material("Canopy", color="#0a1222", roughness=0.05, metallic=0.9)
    accent_mat = pbr_material("Accent", color="#6d4fe0", roughness=0.32, metallic=0.35)
    glow_mat = pbr_material("EngineGlow", color="#b9a6ff", emission="#b9a6ff", emission_strength=8.0)

    hull = loft(
        "Hull",
        [
            section(-1.1, 0.32, 0.2),
            section(-0.8, 0.38, 0.24),
            section(-0.2, 0.36, 0.26),
            section(0.4, 0.26, 0.2, 0.02),
            section(0.9, 0.14, 0.11, -0.01),
        ],
        hull_mat,
        end_apex=(0, 1.35, -0.02),
    )
    smooth(hull, subdivisions=2)
    box_uv(hull, 1.2)

    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=1.0, location=(0, 0.3, 0.19))
    canopy = bpy.context.active_object
    canopy.name = "Canopy"
    canopy.scale = (0.17, 0.45, 0.13)
    canopy.data.materials.append(glass_mat)
    canopy.data.shade_smooth()

    glows = []
    for side in (1, -1):
        outline = [(0.3, 0.2, -0.04), (1.35, -0.55, -0.04), (1.38, -0.8, -0.04), (0.3, -0.75, -0.04)]
        stripe = [(1.1, -0.43, 0.012), (1.35, -0.55, 0.012), (1.38, -0.8, 0.012), (1.12, -0.8, 0.012)]
        fin = [(0.2, -1.08, 0.12), (0.2, -0.6, 0.12), (0.2, -0.88, 0.55), (0.2, -1.14, 0.55)]
        if side < 0:
            outline = [(-x, y, z) for x, y, z in reversed(outline)]
            stripe = [(-x, y, z) for x, y, z in reversed(stripe)]
            fin = [(-x, y, z) for x, y, z in reversed(fin)]

        wing = prism(f"Wing{side}", outline, (0, 0, 0.05), hull_mat)
        mod = wing.modifiers.new("Bevel", "BEVEL")
        mod.width, mod.segments = 0.012, 2
        apply_modifiers(wing)
        box_uv(wing, 1.2)
        hard_surface(wing)

        tip = prism(f"Stripe{side}", stripe, (0, 0, 0.004), accent_mat)
        hard_surface(tip)

        tail = prism(f"Fin{side}", fin, (0.035 * side, 0, 0), dark_mat)
        tail.rotation_euler = (0, math.radians(-18 * side), 0)
        mod = tail.modifiers.new("Bevel", "BEVEL")
        mod.width, mod.segments = 0.008, 2
        apply_modifiers(tail)
        box_uv(tail, 0.8)
        hard_surface(tail)

        x = 0.38 * side
        nacelle = cylinder_y(f"Nacelle{side}", 0.15, 0.75, x, -0.95, -0.02, dark_mat)
        mod = nacelle.modifiers.new("Bevel", "BEVEL")
        mod.width, mod.segments = 0.03, 3
        apply_modifiers(nacelle)
        box_uv(nacelle, 0.8)
        hard_surface(nacelle)

        bpy.ops.mesh.primitive_cone_add(
            vertices=32,
            radius1=0.13,
            radius2=0.165,
            depth=0.18,
            location=(x, -1.4, -0.02),
            rotation=(math.pi / 2, 0, 0),
        )
        nozzle = bpy.context.active_object
        nozzle.name = f"Nozzle{side}"
        nozzle.data.materials.append(dark_mat)
        hard_surface(nozzle)

        glows.append(cylinder_y(f"Glow{side}", 0.125, 0.02, x, -1.44, -0.02, glow_mat))

    join("EngineGlow", glows)


if __name__ == "__main__":
    args = parse_args()
    reset_scene()
    build()
    export_glb_hd(os.path.abspath(args.out))
    if args.preview:
        render_preview(args.preview, [((3.2, 2.6, 1.8), (0, 0, 0)), ((-2.5, -3.2, 1.2), (0, -0.3, 0))])
