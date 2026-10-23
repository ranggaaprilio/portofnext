"""
Silancar's planet: a cold blue-grey world wrapped in a glowing geofence ring,
with tracking satellites on tilted orbits and a ground station at the pole.
Planet radius 2.6; the geofence reaches 4.2.

Runtime hooks:
  Orbit0..2  empties at the planet centre, each tilted; spin about local up
             (three.js Y) and the satellite riding it orbits.
  Geofence   emissive ring; pulse it.
  SatLight   emissive material on satellite beacons; blink it.
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
    dish_mesh,
    empty,
    export_glb,
    join,
    material,
    parent,
    parse_args,
    render_preview,
    reset_scene,
)

ACCENT = "#3d63dd"
RADIUS = 2.6
SEED = 31

BANDS = [
    (-0.12, "#232a44"),
    (-0.03, "#33405f"),
    (0.05, "#4a5a82"),
    (0.13, "#7383ab"),
    (math.inf, "#c9d3ea"),
]

# (orbit radius, tilt about X°, tilt about Y°, start angle°)
ORBITS = [(3.6, 25, 0, 20), (3.9, -15, 30, 150), (3.4, 60, -20, 260)]


def terrain(direction):
    h = 0.22 * noise.fractal(direction * 2.2 + Vector((SEED, SEED, 0)), 1.0, 2.0, 4)
    plateau = min(max((direction.z - 0.9) / 0.06, 0.0), 1.0)
    return h * (1.0 - plateau)


def box(name, size, location, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    obj.data.materials.append(mat)
    apply_transforms(obj)
    return obj


def satellite(name, hull, solar, dish_mat, light):
    """Built at the origin: solar wings along local Y, dish facing -X (planet)."""
    parts = [
        box("Bus", (0.3, 0.26, 0.26), (0, 0, 0), hull),
        box("Boom", (0.04, 1.1, 0.04), (0, 0, 0), hull),
        box("WingL", (0.26, 0.42, 0.02), (0, -0.62, 0), solar),
        box("WingR", (0.26, 0.42, 0.02), (0, 0.62, 0), solar),
    ]
    dish = dish_mesh("SatDish", dish_mat, radius=0.16, depth=0.06, segments=8, rings=2)
    dish.rotation_euler = (0, math.radians(-90), 0)
    dish.location = (-0.2, 0, 0)
    apply_transforms(dish)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.04, location=(0.17, 0, 0.12))
    tip = bpy.context.active_object
    tip.data.materials.append(light)
    return join(name, [*parts, dish, tip])


def build():
    hull = material("Hull", "#c9ccd6", roughness=0.5, metallic=0.3)
    solar = material("Solar", "#1b2550", roughness=0.25, metallic=0.6)
    dish_mat = material("Dish", "#e7e9ef", roughness=0.5, double_sided=True)
    concrete = material("Concrete", "#3a3f4b", roughness=0.85)
    accent = material("Accent", ACCENT, roughness=0.5, emission=ACCENT, emission_strength=0.6)
    light = material("SatLight", "#9fb4ff", emission="#8fa8ff", emission_strength=4.0)
    fence = material("Geofence", "#6f8cff", emission="#5b7cff", emission_strength=3.0)

    root = empty("PlanetSatellite")
    parent(banded_planet("Planet", RADIUS, terrain, BANDS), root)

    bpy.ops.mesh.primitive_torus_add(
        major_segments=64, minor_segments=4, major_radius=4.2, minor_radius=0.03
    )
    geofence = bpy.context.active_object
    geofence.name = "Geofence"
    geofence.data.materials.append(fence)
    geofence.rotation_euler = (math.radians(12), math.radians(-8), 0)
    parent(geofence, root)

    # Ground station on the pole: base, mast and an upward-looking dish.
    top = RADIUS
    station = [
        cylinder("StationBase", 0.55, 0.22, concrete, location=(0, 0, top)),
        cylinder("StationTrim", 0.58, 0.04, accent, location=(0, 0, top + 0.06)),
        cylinder("StationMast", 0.07, 0.5, hull, location=(0, 0, top + 0.35)),
    ]
    dish = dish_mesh("StationDish", dish_mat, radius=0.45, depth=0.14)
    dish.location = (0, 0, top + 0.62)
    dish.rotation_euler = (math.radians(-20), 0, 0)
    apply_transforms(dish)
    station.append(dish)
    parent(join("GroundStation", station), root)

    for i, (r, tilt_x, tilt_y, start) in enumerate(ORBITS):
        orbit = empty(f"Orbit{i}")
        orbit.rotation_euler = (math.radians(tilt_x), math.radians(tilt_y), math.radians(start))
        parent(orbit, root)
        sat = satellite(f"Satellite{i}", hull, solar, dish_mat, light)
        # Placed in the orbit's local plane; the dish already faces -X (inwards).
        sat.parent = orbit
        sat.location = (r, 0, 0)


if __name__ == "__main__":
    args = parse_args()
    reset_scene()
    build()
    export_glb(os.path.abspath(args.out))
    if args.preview:
        render_preview(
            os.path.abspath(args.preview),
            views=[((14.0, -14.0, 8.0), (0, 0, 0)), ((5.0, -6.5, 4.5), (2.5, 0, 1.0))],
            lens=40,
        )
