"""
Bid Ocean's planet: an ocean world dotted with small islands, with a
lighthouse platform standing in open water at the north pole (Blender +Z,
three.js +Y) and buoys around it. Radius 3 units.

Runtime hooks:
  LighthouseLamp  empty at the lamp room; spin it so the lamp housing turns.
  Beacon          emissive material on the buoy lights; pulse it.
"""

import math
import os
import sys

import bpy
from mathutils import Vector, noise

sys.path.append(os.path.dirname(__file__))
from common import (  # noqa: E402
    apply_transforms,
    banded_planet,
    cylinder,
    empty,
    export_glb,
    join,
    material,
    parent,
    parse_args,
    place_on_surface,
    render_preview,
    reset_scene,
)

ACCENT = "#2f81c4"
RADIUS = 3.0
SEED = 23

# Water bands sit below 0 (sea level), land above.
BANDS = [
    (-0.16, "#0f2f5c"),
    (-0.06, "#174b86"),
    (0.0, ACCENT),
    (0.04, "#e3d3a1"),
    (0.14, "#5f9e5a"),
    (math.inf, "#8c8f86"),
]


def ocean_height(direction):
    h = 0.32 * noise.fractal(direction * 2.0 + Vector((0, 0, SEED)), 1.0, 2.0, 4) - 0.07
    # Keep open, deep-ish water around the pole for the platform.
    calm = min(max((direction.z - 0.85) / 0.08, 0.0), 1.0)
    return h * (1.0 - calm) - 0.1 * calm


def cone(name, r1, r2, depth, z, mat, vertices=8):
    bpy.ops.mesh.primitive_cone_add(
        vertices=vertices, radius1=r1, radius2=r2, depth=depth, location=(0, 0, z)
    )
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(mat)
    return obj


def build():
    white = material("Paint", "#eef1f5", roughness=0.6)
    stripe = material("Stripe", ACCENT, roughness=0.5)
    dark = material("HullDark", "#2a2d38", roughness=0.6, metallic=0.4)
    metal = material("Metal", "#c9ccd6", roughness=0.45, metallic=0.5)
    glass = material("LampGlass", "#fff3c4", emission="#ffe08a", emission_strength=3.0)
    beacon = material("Beacon", "#ffd66b", emission="#ffcf5a", emission_strength=4.0)
    buoy_red = material("BuoyRed", "#e8402c", roughness=0.6)

    root = empty("PlanetOcean")
    parent(banded_planet("Planet", RADIUS, ocean_height, BANDS, sea_level=0.0), root)

    top = RADIUS
    deck_z = top + 0.35
    static = []
    for i in range(6):
        a = 2 * math.pi * i / 6
        static.append(
            cylinder(f"Pylon{i}", 0.06, 0.6, dark,
                     location=(0.7 * math.cos(a), 0.7 * math.sin(a), top + 0.08))
        )
    static += [
        cylinder("Deck", 0.95, 0.12, metal, location=(0, 0, deck_z)),
        cylinder("DeckTrim", 0.97, 0.04, stripe, location=(0, 0, deck_z - 0.03)),
    ]

    # Tapered tower in alternating bands.
    z = deck_z + 0.06
    for i, (height, r1, r2) in enumerate([(0.45, 0.32, 0.28), (0.4, 0.28, 0.24), (0.4, 0.24, 0.2)]):
        static.append(cone(f"Tower{i}", r1, r2, height, z + height / 2, white if i % 2 == 0 else stripe))
        z += height
    static.append(cylinder("Gallery", 0.32, 0.06, dark, vertices=8, location=(0, 0, z + 0.03)))
    lamp_z = z + 0.06
    parent(join("Lighthouse", static), root)

    # Lamp room turns as one piece.
    pivot = empty("LighthouseLamp", (0, 0, lamp_z))
    parent(pivot, root)
    lamp_parts = [
        cylinder("LampRoom", 0.17, 0.3, glass, vertices=8, location=(0, 0, lamp_z + 0.15)),
        cone("Roof", 0.24, 0.0, 0.25, lamp_z + 0.42, stripe),
        # A shutter on one side so the rotation reads as a sweeping beam.
        cylinder("Shutter", 0.18, 0.28, dark, vertices=3, location=(0, -0.05, lamp_z + 0.15)),
    ]
    parent(join("LampHousing", lamp_parts), pivot)

    buoys = []
    for i, (polar, azimuth) in enumerate([(16, 30), (19, 140), (15, 250), (21, 320)]):
        body = cone(f"Buoy{i}", 0.13, 0.07, 0.22, 0, buoy_red if i % 2 else white, vertices=6)
        place_on_surface(body, RADIUS, polar, azimuth, lift=0.06)
        light = cylinder(f"BuoyLight{i}", 0.04, 0.08, beacon)
        place_on_surface(light, RADIUS, polar, azimuth, lift=0.2)
        buoys += [body, light]
    for obj in buoys:
        apply_transforms(obj)
    parent(join("Buoys", buoys), root)


if __name__ == "__main__":
    args = parse_args()
    reset_scene()
    build()
    export_glb(os.path.abspath(args.out))
    if args.preview:
        render_preview(
            os.path.abspath(args.preview),
            views=[((13.0, -13.0, 9.0), (0, 0, 0.6)), ((3.2, -4.6, 5.4), (0, 0, 3.6))],
            lens=40,
        )
