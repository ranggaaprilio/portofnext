"""
Semi-realistic orbital station for the landing Experience stop: plated hub,
a habitat ring with lit windows on spokes, a mast carrying solar arrays and
a dish underneath. The ring lies in Blender XY (three.js XZ), ~5.6 units across.

Runtime hooks:
  Ring        habitat ring + spokes; spin it about its axis.
  DockLights  emissive material on the hub's marker lights; pulse it.
"""

import math
import os
import sys

import bpy
import numpy as np

sys.path.append(os.path.dirname(__file__))
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from common import dish_mesh, loft  # noqa: E402
from common_hd import (  # noqa: E402
    apply_transforms_all,
    box_uv,
    export_glb_hd,
    join,
    make_image,
    normal_map_from_height,
    panel_textures,
    parse_args,
    pbr_material,
    render_preview,
    reset_scene,
    smooth,
    srgb,
)


def circle(z, r, n=32):
    return [(r * math.cos(2 * math.pi * i / n), r * math.sin(2 * math.pi * i / n), z) for i in range(n)]


def solar_textures(size=512, cells=6):
    """Tiling photovoltaic cells: deep blue squares on a silver grid."""
    yy, xx = np.mgrid[0:size, 0:size] / size
    gx = np.abs(((xx * cells) % 1.0) - 0.5)
    gy = np.abs(((yy * cells) % 1.0) - 0.5)
    gap = (np.maximum(gx, gy) > 0.46).astype(float)
    sheen = 0.85 + 0.3 * xx
    albedo = srgb("#0f1e46")[None, None, :] * sheen[..., None]
    albedo = albedo * (1 - gap[..., None]) + srgb("#a7afba")[None, None, :] * gap[..., None]
    orm = np.zeros((size, size, 3))
    orm[..., 0] = 1.0
    orm[..., 1] = 0.22 + 0.3 * gap
    orm[..., 2] = 0.55
    normal = normal_map_from_height(gap * 0.003, 1.0, equirect=False)
    return (
        make_image("SolarBase", albedo),
        make_image("SolarNormal", normal, color=False),
        make_image("SolarORM", orm, color=False),
    )


def cylinder(name, radius, depth, location, rotation, mat, verts=16):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=verts, radius=radius, depth=depth, location=location, rotation=rotation
    )
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(mat)
    return obj


def build():
    white = pbr_material("StationHull", *panel_textures("Station", 1024, "#d4d6da", 5, panels=6, metal=0.45))
    dark = pbr_material("StationDark", *panel_textures("StationDarkPanel", 512, "#3a3d44", 6, panels=4, metal=0.85))
    solar = pbr_material("Solar", *solar_textures())
    windows = pbr_material("Windows", color="#ffd59a", emission="#ffd59a", emission_strength=3.0)
    lights = pbr_material("DockLights", color="#ff6b5a", emission="#ff6b5a", emission_strength=6.0)

    profile = [(-1.5, 0.2), (-1.25, 0.5), (-1.0, 0.58), (-0.3, 0.6), (0.3, 0.6), (0.9, 0.55), (1.15, 0.35), (1.3, 0.18)]
    hub = loft("Hub", [circle(z, r) for z, r in profile], white)
    smooth(hub, subdivisions=1)
    box_uv(hub, 2.2)

    bpy.ops.mesh.primitive_torus_add(major_radius=2.6, minor_radius=0.22, major_segments=128, minor_segments=20)
    ring = bpy.context.active_object
    ring.data.materials.append(white)
    ring.data.shade_smooth()
    box_uv(ring, 2.2)
    bpy.ops.mesh.primitive_torus_add(major_radius=2.6 + 0.215, minor_radius=0.022, major_segments=128, minor_segments=8)
    strip = bpy.context.active_object
    strip.data.materials.append(windows)
    strip.data.shade_smooth()
    spokes = []
    for i in range(4):
        a = math.pi / 2 * i + math.pi / 4
        spokes.append(
            cylinder(f"Spoke{i}", 0.05, 1.9, (1.55 * math.cos(a), 1.55 * math.sin(a), 0), (0, math.pi / 2, a), dark)
        )
    apply_transforms_all(spokes)
    join("Ring", [ring, strip, *spokes])

    mast = cylinder("Mast", 0.06, 1.4, (0, 0, 1.95), (0, 0, 0), dark)
    boom = cylinder("Boom", 0.035, 7.4, (0, 0, 2.3), (0, math.pi / 2, 0), dark)
    apply_transforms_all([mast, boom])
    join("Mast", [mast, boom])

    panels = []
    for side in (1, -1):
        for k in range(2):
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * (1.0 + k * 1.35 + 0.6), 0, 2.3))
            panel = bpy.context.active_object
            panel.scale = (1.25, 0.6, 0.02)
            panels.append(panel)
    apply_transforms_all(panels)
    array = join("SolarArray", panels)
    array.data.materials.append(solar)
    box_uv(array, 0.6)

    dish = dish_mesh("Dish", dark, radius=0.5, depth=0.15, segments=32, rings=4)
    dish.rotation_euler = (math.pi, 0, 0)
    dish.location = (0, 0, -1.55)
    dish.data.shade_smooth()

    bulbs = []
    for i in range(8):
        a = 2 * math.pi * i / 8
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=8, ring_count=6, radius=0.04, location=(0.6 * math.cos(a), 0.6 * math.sin(a), 0.6)
        )
        bulbs.append(bpy.context.active_object)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=0.05, location=(0, 0, 2.66))
    bulbs.append(bpy.context.active_object)
    marker = join("DockLights", bulbs)
    marker.data.materials.clear()
    marker.data.materials.append(lights)


if __name__ == "__main__":
    args = parse_args()
    reset_scene()
    build()
    export_glb_hd(os.path.abspath(args.out))
    if args.preview:
        render_preview(args.preview, [((7, -7, 4), (0, 0, 0.4)), ((0, -9, 1.5), (0, 0, 0.4))])
