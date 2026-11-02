"""
CMC's client-health station: a floating hex platform ringed by a radial bar
chart, with a donut chart hovering above it — unhealthy, average and healthy
arcs in the dashboard's red, amber and green — around a heart that beats.
Centred on the origin; the donut sits at HEALTH_Z.

Runtime hooks:
  HealthRing   empty above the platform, tilted; spin about local up
               (three.js Y) and the donut arcs turn with it.
  Bar0..N      chart bars with their origin at the base; scale their local up
               (three.js Y) to make the chart breathe.
  BarLight     emissive material on the bars; pulse it.
  HeartPulse   emissive material on the heart; pulse it like a heartbeat.
"""

import math
import os
import sys

import bpy

sys.path.append(os.path.dirname(__file__))
from common import (  # noqa: E402
    cylinder,
    empty,
    export_glb,
    loft,
    material,
    mesh_object,
    parent,
    parse_args,
    render_preview,
    reset_scene,
)

ACCENT = "#d94f3d"
PLATFORM_RADIUS = 2.0
PLATFORM_DEPTH = 0.28
BAR_RADIUS = 1.55
BAR_HEIGHTS = (0.9, 0.55, 1.15, 0.4, 0.8, 1.3, 0.6, 1.0, 0.45, 0.75)
HEALTH_Z = 2.3
DONUT_RADIUS = 1.15
# Shares of the donut, close to the dashboard's split; healthy is padded so
# it still reads as an arc from the flight camera.
SEGMENTS = (("Unhealthy", 0.76, "#e8483f"), ("Average", 0.17, "#f2b632"), ("Healthy", 0.07, "#3aa757"))
GAP = math.radians(4)


def arc(name, start, end, mat, radius=DONUT_RADIUS, width=0.36, thickness=0.2, steps=24):
    """Flat donut segment from angle `start` to `end` with a box cross-section."""
    inner, outer, half = radius - width / 2, radius + width / 2, thickness / 2
    rings = []
    for s in range(steps + 1):
        a = start + (end - start) * s / steps
        c, d = math.cos(a), math.sin(a)
        rings.append(
            [
                (inner * c, inner * d, -half),
                (outer * c, outer * d, -half),
                (outer * c, outer * d, half),
                (inner * c, inner * d, half),
            ]
        )
    return loft(name, rings, mat)


def bar(name, angle, height, mat):
    """Box bar standing on the platform, origin at its base so it scales upwards."""
    w = 0.12
    verts = [
        (x, y, z)
        for z in (0, height)
        for x, y in ((-w, -w), (w, -w), (w, w), (-w, w))
    ]
    faces = [(0, 1, 2, 3), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
    obj = mesh_object(name, verts, faces, mat)
    obj.location = (BAR_RADIUS * math.cos(angle), BAR_RADIUS * math.sin(angle), PLATFORM_DEPTH / 2)
    obj.rotation_euler = (0, 0, angle)
    return obj


def build():
    deck = material("Deck", "#2b2f3a", roughness=0.45, metallic=0.6)
    rock = material("Underside", "#3a3436", roughness=0.95)
    rim = material("Rim", "#ff8a73", emission=ACCENT, emission_strength=2.2)
    bar_light = material("BarLight", "#8d9bff", emission="#5b6cff", emission_strength=1.8)
    mast = material("Mast", "#c9ccd6", roughness=0.4, metallic=0.5)
    heart = material("HeartPulse", "#ff6b6b", emission="#ff3b4a", emission_strength=5.0)
    arcs = {
        label: material(label, color, roughness=0.4, emission=color, emission_strength=1.6)
        for label, _, color in SEGMENTS
    }

    root = empty("CmcHealth")

    platform = cylinder("Platform", PLATFORM_RADIUS, PLATFORM_DEPTH, deck, vertices=6)
    parent(platform, root)

    # Glowing band around the deck's side, same hex so the edges line up.
    edge = cylinder("RimLight", PLATFORM_RADIUS * 1.03, 0.09, rim, vertices=6)
    parent(edge, root)

    bpy.ops.mesh.primitive_cone_add(
        vertices=6, radius1=PLATFORM_RADIUS * 0.95, radius2=0.35, depth=1.1,
        location=(0, 0, -PLATFORM_DEPTH / 2 - 0.55),
    )
    under = bpy.context.active_object
    under.name = "Underside"
    under.rotation_euler = (math.pi, 0, 0)
    under.data.materials.append(rock)
    parent(under, root)

    for i, height in enumerate(BAR_HEIGHTS):
        angle = 2 * math.pi * i / len(BAR_HEIGHTS)
        parent(bar(f"Bar{i}", angle, height, bar_light), root)

    pole = cylinder(
        "Mast", 0.07, HEALTH_Z - PLATFORM_DEPTH / 2, mast, vertices=8,
        location=(0, 0, (HEALTH_Z + PLATFORM_DEPTH / 2) / 2),
    )
    parent(pole, root)

    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.42, location=(0, 0, HEALTH_Z))
    core = bpy.context.active_object
    core.name = "Heart"
    core.data.materials.append(heart)
    parent(core, root)

    ring = empty("HealthRing", location=(0, 0, HEALTH_Z))
    ring.rotation_euler = (math.radians(12), math.radians(-8), 0)
    parent(ring, root)

    start = math.pi / 2
    for label, share, _ in SEGMENTS:
        end = start + 2 * math.pi * share
        segment = arc(f"{label}Arc", start + GAP / 2, end - GAP / 2, arcs[label])
        segment.parent = ring
        start = end


if __name__ == "__main__":
    args = parse_args()
    reset_scene()
    build()
    export_glb(os.path.abspath(args.out))
    if args.preview:
        render_preview(
            os.path.abspath(args.preview),
            views=[((9.0, -9.0, 7.0), (0, 0, 1.0)), ((0, -6.0, 9.5), (0, 0, 1.0))],
            lens=40,
        )
