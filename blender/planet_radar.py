"""
LeadManager's planet: a cratered red desert world with a radar outpost on a
levelled plateau at the north pole (Blender +Z, three.js +Y). Radius 3 units.

Runtime hooks:
  RadarHead   empty at the top of the tower; spin it about its local up axis
              (three.js Y) to sweep the dish.
  RadarLight  emissive material on the feed tip and beacon; pulse it.
"""

import math
import os
import random
import sys

import bpy
from mathutils import Vector, noise

sys.path.append(os.path.dirname(__file__))
from common import (  # noqa: E402
    apply_transforms,
    banded_planet,
    cylinder,
    dish_mesh,
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

ACCENT = "#e8402c"
RADIUS = 3.0
SEED = 7

# Terrain bands, lowest first: (upper height bound, colour).
BANDS = [
    (-0.16, "#5e1b14"),
    (-0.04, "#8a2b1e"),
    (0.08, "#b4412b"),
    (0.20, "#d06740"),
    (math.inf, "#e6a377"),
]


def terrain_height(direction, craters):
    h = 0.26 * noise.fractal(direction * 1.9 + Vector((SEED, 0, 0)), 1.0, 2.0, 4)
    for centre, size, depth in craters:
        d = direction.angle(centre) / size
        if d < 1.0:
            h -= depth * (1.0 - d * d)
        elif d < 1.35:
            h += depth * 0.4 * (1.0 - (d - 1.0) / 0.35)
    # Level the pole into a plateau for the outpost, blending in over ~10°.
    plateau = min(max((direction.z - 0.86) / 0.08, 0.0), 1.0)
    return h * (1.0 - plateau)


def build_planet():
    rng = random.Random(SEED)
    craters = []
    while len(craters) < 7:
        centre = Vector([rng.gauss(0, 1) for _ in range(3)]).normalized()
        if centre.z < 0.6:  # keep craters off the plateau
            craters.append((centre, rng.uniform(0.22, 0.42), rng.uniform(0.22, 0.34)))
    return banded_planet(
        "Planet", RADIUS, lambda d: terrain_height(d, craters), BANDS
    )


def build_outpost(root):
    concrete = material("Concrete", "#3a3f4b", roughness=0.85)
    metal = material("Metal", "#c9ccd6", roughness=0.45, metallic=0.5)
    dish_white = material("Dish", "#e7e9ef", roughness=0.5, double_sided=True)
    accent = material("Accent", ACCENT, roughness=0.5, emission=ACCENT, emission_strength=0.4)
    light = material("RadarLight", "#ff6b4f", emission="#ff5a3c", emission_strength=4.0)
    windows = material("Windows", "#ffb36b", emission="#ffb36b", emission_strength=2.5)
    habitat = material("Habitat", "#d8d3cc", roughness=0.7)

    top = RADIUS
    static = [
        cylinder("Base", 0.9, 0.30, concrete, location=(0, 0, top)),
        cylinder("BaseTrim", 0.93, 0.05, accent, location=(0, 0, top + 0.08)),
        cylinder("Tower", 0.14, 1.0, metal, location=(0, 0, top + 0.62)),
        cylinder("Collar", 0.25, 0.1, concrete, location=(0, 0, top + 1.1)),
    ]

    mast = cylinder("Mast", 0.025, 0.45, metal, vertices=6)
    mast.location = (0.62, 0.34, top + 0.36)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.06, location=(0.62, 0.34, top + 0.6))
    beacon = bpy.context.active_object
    beacon.data.materials.append(light)
    static += [mast, beacon]

    for polar, azimuth, size in ((17, 150, 0.42), (21, 215, 0.32)):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=size)
        dome = bpy.context.active_object
        dome.scale = (1, 1, 0.75)
        dome.data.materials.append(habitat)
        place_on_surface(dome, RADIUS, polar, azimuth, lift=-0.06)
        band = cylinder("DomeWindows", size * 1.01, 0.05, windows, vertices=16)
        place_on_surface(band, RADIUS, polar, azimuth)
        static += [dome, band]

    pad = cylinder("Pad", 0.5, 0.06, concrete)
    place_on_surface(pad, RADIUS, 20, 35)
    pad_edge = cylinder("PadEdge", 0.53, 0.03, accent)
    place_on_surface(pad_edge, RADIUS, 20, 35)
    static += [pad, pad_edge]

    for obj in static:
        apply_transforms(obj)
    base = join("RadarBase", static)
    parent(base, root)

    # Everything that sweeps hangs off RadarHead, pivoting on the tower axis.
    head = empty("RadarHead", (0, 0, top + 1.15))
    parent(head, root)

    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, top + 1.28))
    yoke = bpy.context.active_object
    yoke.scale = (0.44, 0.1, 0.28)
    yoke.data.materials.append(metal)

    tilt = math.radians(-50)  # aim the dish up and out along +Y
    axis = Vector((0, math.sin(-tilt), math.cos(tilt)))
    centre = Vector((0, 0, top + 1.4))

    dish = dish_mesh("Dish", dish_white, radius=0.85, depth=0.26)
    dish.location = centre
    dish.rotation_euler = (tilt, 0, 0)

    feed = cylinder("Feed", 0.025, 0.55, metal, vertices=6)
    feed.location = centre + axis * 0.28
    feed.rotation_euler = (tilt, 0, 0)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.07, location=centre + axis * 0.58)
    tip = bpy.context.active_object
    tip.data.materials.append(light)

    for obj in (yoke, dish, feed, tip):
        apply_transforms(obj)
    sweep = join("RadarDish", [yoke, dish, feed, tip])
    parent(sweep, head)


if __name__ == "__main__":
    args = parse_args()
    reset_scene()
    root = empty("PlanetRadar")
    parent(build_planet(), root)
    build_outpost(root)
    export_glb(os.path.abspath(args.out))
    if args.preview:
        render_preview(
            os.path.abspath(args.preview),
            views=[
                ((13.0, -13.0, 9.0), (0, 0, 0.6)),
                ((3.6, -5.2, 5.8), (0, 0, 3.7)),
            ],
            lens=40,
        )
