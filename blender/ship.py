"""
Player craft: low-poly scout with swept wings, a glass canopy and twin
engines. Nose points along Blender +Y (three.js -Z), length ~2.4 units.

Runtime hooks:
  EngineGlow  separate mesh + material; scale/brighten it with speed and boost.
"""

import math
import os
import sys

import bpy

sys.path.append(os.path.dirname(__file__))
from common import (  # noqa: E402
    apply_transforms,
    empty,
    export_glb,
    join,
    loft,
    material,
    parent,
    parse_args,
    prism,
    render_preview,
    reset_scene,
)

BRAND = "#7c5cf0"
BRAND_LIGHT = "#b9a6ff"


def ring(y, width, height, z=0.0, sides=8):
    # Offset by half a step so the ring has a flat top and bottom.
    step = 2 * math.pi / sides
    return [
        (
            width * math.cos(step * i + step / 2),
            y,
            z + height * math.sin(step * i + step / 2),
        )
        for i in range(sides)
    ]


def build():
    hull = material("Hull", "#c9ccd6", roughness=0.55, metallic=0.2)
    panel = material("HullDark", "#2a2d38", roughness=0.6, metallic=0.4)
    accent = material("Accent", BRAND, roughness=0.4, emission=BRAND, emission_strength=0.6)
    glass = material(
        "Canopy", "#141a33", roughness=0.15, metallic=0.1,
        emission=BRAND_LIGHT, emission_strength=0.6,
    )
    glow = material("EngineGlow", BRAND_LIGHT, emission="#9b7dff", emission_strength=2.5)

    root = empty("Ship")

    fuselage = loft(
        "Fuselage",
        [
            ring(0.70, 0.17, 0.12, z=0.01),
            ring(0.20, 0.30, 0.20, z=0.02),
            ring(-0.45, 0.34, 0.22, z=0.03),
            ring(-0.95, 0.25, 0.16, z=0.02),
        ],
        hull,
        start_apex=(0, 1.10, -0.01),
    )

    def wing(side):
        s = 1 if side == "R" else -1
        outline = [
            (s * 0.22, 0.25, -0.05),
            (s * 1.10, -0.48, -0.05),
            (s * 1.14, -0.76, -0.05),
            (s * 0.26, -0.80, -0.05),
        ]
        return prism(f"Wing_{side}", outline, (0, 0, 0.06), hull)

    def wing_stripe(side):
        # Accent band along the leading edge so the planform reads on a dark sky.
        s = 1 if side == "R" else -1
        outline = [
            (s * 0.55, -0.02, 0.012),
            (s * 1.10, -0.48, 0.012),
            (s * 1.11, -0.56, 0.012),
            (s * 0.57, -0.11, 0.012),
        ]
        return prism(f"WingStripe_{side}", outline, (0, 0, 0.004), accent)

    def winglet(side):
        s = 1 if side == "R" else -1
        outline = [
            (s * 1.12, -0.46, -0.04),
            (s * 1.14, -0.78, -0.04),
            (s * 1.20, -0.84, 0.20),
            (s * 1.18, -0.66, 0.20),
        ]
        return prism(f"Winglet_{side}", outline, (s * 0.04, 0, 0), accent)

    fin = prism(
        "Fin",
        [(-0.025, -0.35, 0.18), (-0.025, -0.92, 0.18), (-0.025, -0.98, 0.56)],
        (0.05, 0, 0),
        panel,
    )
    fin_tip = prism(
        "FinTip",
        [(-0.03, -0.88, 0.46), (-0.03, -0.98, 0.56), (-0.03, -0.84, 0.56)],
        (0.06, 0, 0),
        accent,
    )

    bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=6, radius=1, location=(0, 0.22, 0.17))
    canopy = bpy.context.active_object
    canopy.name = "Canopy"
    canopy.scale = (0.14, 0.34, 0.14)
    canopy.data.materials.append(glass)
    apply_transforms(canopy)

    engines, glows = [], []
    for side, x in (("R", 0.22), ("L", -0.22)):
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=8, radius=0.12, depth=0.5,
            location=(x, -0.78, -0.03), rotation=(math.radians(90), 0, 0),
        )
        nacelle = bpy.context.active_object
        nacelle.name = f"Engine_{side}"
        nacelle.data.materials.append(panel)
        apply_transforms(nacelle)
        engines.append(nacelle)

        bpy.ops.mesh.primitive_circle_add(
            vertices=8, radius=0.09, fill_type="NGON",
            location=(x, -1.035, -0.03), rotation=(math.radians(90), 0, 0),
        )
        disc = bpy.context.active_object
        disc.data.materials.append(glow)
        apply_transforms(disc)
        glows.append(disc)

    body = join(
        "ShipBody",
        [
            fuselage, fin, fin_tip, canopy, *engines,
            *(part(side) for part in (wing, wing_stripe, winglet) for side in ("R", "L")),
        ],
    )
    engine_glow = join("EngineGlow", glows)
    parent(body, root)
    parent(engine_glow, root)


if __name__ == "__main__":
    args = parse_args()
    reset_scene()
    build()
    export_glb(os.path.abspath(args.out))
    if args.preview:
        render_preview(
            os.path.abspath(args.preview),
            views=[((3.2, 2.6, 2.4), (0, 0, 0)), ((-2.6, -3.4, 1.6), (0, 0, 0))],
            lens=45,
        )
