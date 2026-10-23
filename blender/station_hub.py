"""
aprilio.dev's home base: a spinning habitat ring around a central spindle
with solar wings on top. The ring spins about Blender Z (three.js Y).
About 6 units across.

Runtime hooks:
  Ring        ring, spokes and window band; spin it slowly about local up.
  DockLights  emissive material on the docking lights; pulse it.
"""

import math
import os
import sys

import bpy

sys.path.append(os.path.dirname(__file__))
from common import (  # noqa: E402
    apply_transforms,
    cylinder,
    empty,
    export_glb,
    join,
    loft,
    material,
    parent,
    parse_args,
    render_preview,
    reset_scene,
)

ACCENT = "#7c5cf0"
ACCENT_LIGHT = "#b9a6ff"
RING_RADIUS = 2.6


def hex_ring(z, radius, sides=6):
    return [
        (radius * math.cos(2 * math.pi * i / sides), radius * math.sin(2 * math.pi * i / sides), z)
        for i in range(sides)
    ]


def torus(name, major, minor, mat, major_segments=24, minor_segments=6, z=0.0):
    bpy.ops.mesh.primitive_torus_add(
        major_segments=major_segments,
        minor_segments=minor_segments,
        major_radius=major,
        minor_radius=minor,
        location=(0, 0, z),
    )
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(mat)
    return obj


def box(name, size, location, mat, rotation_z=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location, rotation=(0, 0, rotation_z))
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    obj.data.materials.append(mat)
    apply_transforms(obj)
    return obj


def build():
    hull = material("Hull", "#c9ccd6", roughness=0.55, metallic=0.2)
    panel = material("HullDark", "#2a2d38", roughness=0.6, metallic=0.4)
    accent = material("Accent", ACCENT, roughness=0.4, emission=ACCENT, emission_strength=0.8)
    windows = material("Windows", ACCENT_LIGHT, emission=ACCENT, emission_strength=1.6)
    solar = material("Solar", "#1b2550", roughness=0.25, metallic=0.6)
    dock = material("DockLights", "#ffffff", emission=ACCENT_LIGHT, emission_strength=4.0)

    root = empty("StationHub")

    # Spindle: hex core tapering to antenna tips above and below.
    core = loft(
        "Core",
        [hex_ring(-1.1, 0.35), hex_ring(-0.7, 0.7), hex_ring(0.7, 0.7), hex_ring(1.1, 0.35)],
        hull,
        start_apex=(0, 0, -1.7),
        end_apex=(0, 0, 1.7),
    )
    band = cylinder("CoreBand", 0.74, 0.18, accent)
    lights = []
    for i in range(6):
        a = 2 * math.pi * (i + 0.5) / 6
        bpy.ops.mesh.primitive_ico_sphere_add(
            subdivisions=1, radius=0.07,
            location=(0.66 * math.cos(a), 0.66 * math.sin(a), 0.45),
        )
        light = bpy.context.active_object
        light.data.materials.append(dock)
        lights.append(light)

    static = [
        core,
        band,
        cylinder("Mast", 0.06, 1.2, panel, location=(0, 0, 1.9)),
        box("SolarArm", (3.2, 0.08, 0.08), (0, 0, 2.2), panel),
        box("SolarL", (1.3, 0.55, 0.04), (-1.15, 0, 2.2), solar),
        box("SolarR", (1.3, 0.55, 0.04), (1.15, 0, 2.2), solar),
    ]
    parent(join("HubCore", static), root)
    parent(join("DockLights", lights), root)

    # Everything on the ring spins together.
    ring_parts = [
        torus("RingHull", RING_RADIUS, 0.3, hull),
        torus("RingWindows", RING_RADIUS + 0.27, 0.06, windows, major_segments=48, minor_segments=4),
        torus("RingTrim", RING_RADIUS - 0.27, 0.05, accent, major_segments=48, minor_segments=4),
    ]
    mid = (RING_RADIUS + 0.6) / 2
    for i in range(4):
        a = i * math.pi / 2
        ring_parts.append(
            box(f"Spoke{i}", (RING_RADIUS - 0.6, 0.14, 0.14),
                (mid * math.cos(a), mid * math.sin(a), 0), panel, rotation_z=a)
        )
        b = a + math.pi / 4
        ring_parts.append(
            box(f"Pod{i}", (0.5, 0.5, 0.5),
                (RING_RADIUS * math.cos(b), RING_RADIUS * math.sin(b), 0), accent, rotation_z=b)
        )
    parent(join("Ring", ring_parts), root)


if __name__ == "__main__":
    args = parse_args()
    reset_scene()
    build()
    export_glb(os.path.abspath(args.out))
    if args.preview:
        render_preview(
            os.path.abspath(args.preview),
            views=[((8.5, -9.0, 5.5), (0, 0, 0.3)), ((0.5, -3.2, 9.5), (0, 0, 0))],
            lens=40,
        )
