"""
Four realistic rock shapes for the landing Skills stop. Each RockN is centred
on its own origin, roughly 0.7 units in radius, with smooth normals and
vertex colours (craters darker, rims lighter).
"""

import os
import sys

import bpy
import numpy as np

sys.path.append(os.path.dirname(__file__))
from common_hd import (  # noqa: E402
    craters,
    export_glb_hd,
    fbm,
    mix,
    parse_args,
    pbr_material,
    render_preview,
    reset_scene,
    srgb,
)

RADIUS = 0.7
SHAPES = [(1.0, 0.8, 0.65), (1.0, 0.9, 0.85), (1.3, 0.7, 0.7), (0.9, 0.85, 0.6)]


def rock(index, mat):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=5, radius=1.0)
    obj = bpy.context.active_object
    obj.name = f"Rock{index}"
    obj.data.name = f"Rock{index}"
    mesh = obj.data

    co = np.zeros(len(mesh.vertices) * 3)
    mesh.vertices.foreach_get("co", co)
    d = co.reshape(-1, 3)
    d /= np.linalg.norm(d, axis=1, keepdims=True)

    seed = 70 + index * 13
    lumps = fbm(d * 1.4 + index, 4, seed)
    grit = fbm(d * 7.0, 4, seed + 1)
    pits = craters(d, 14, seed + 2, min_size=0.12, max_size=0.45)
    h = 1.0 + 0.28 * lumps + 0.05 * grit + 0.6 * pits
    pos = d * h[:, None] * np.array(SHAPES[index]) * RADIUS
    mesh.vertices.foreach_set("co", pos.ravel())

    shade = fbm(d * 3.0, 4, seed + 3) * 0.5 + 0.5
    color = mix(srgb("#3a342f"), srgb("#6e6458"), shade)
    color = mix(color, srgb("#2e2925"), np.clip(-pits * 3, 0, 0.6))
    color = mix(color, srgb("#a19484"), np.clip(pits * 6, 0, 0.4))
    color *= (0.85 + 0.3 * (grit * 0.5 + 0.5))[:, None]
    linear = np.clip(color, 0, 1) ** 2.2
    rgba = np.concatenate([linear, np.ones((len(linear), 1))], axis=1)

    attr = mesh.color_attributes.new(name="Col", type="FLOAT_COLOR", domain="POINT")
    attr.data.foreach_set("color", rgba.astype(np.float32).ravel())
    mesh.update()
    mesh.shade_smooth()
    mesh.materials.append(mat)
    obj.location = (index * 2.2 - 3.3, 0, 0)
    return obj


def build():
    mat = pbr_material("Rock", roughness=0.93, vertex_colors=True)
    for i in range(len(SHAPES)):
        rock(i, mat)


if __name__ == "__main__":
    args = parse_args()
    reset_scene()
    build()
    export_glb_hd(os.path.abspath(args.out))
    if args.preview:
        render_preview(args.preview, [((0, -7, 2), (0, 0, 0))])
