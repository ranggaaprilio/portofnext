"""
Keyles' vault gate: an upright octagonal gold frame with radial fins on a
plinth, two counter-rotating lock rings inside it and a floating key crystal
at the centre. The gate faces Blender ±Y (three.js ∓Z). About 6 units across.

Runtime hooks:
  LockRingOuter / LockRingInner  spin in opposite directions about the gate
                                 axis (Blender Y = three.js -Z); origins sit
                                 on the gate centre.
  Crystal                        bob and spin; its material is emissive.
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
    material,
    mesh_object,
    parent,
    parse_args,
    prism,
    render_preview,
    reset_scene,
)

ACCENT = "#d9a441"
GATE_RADIUS = 2.3
CENTRE_Z = 2.8  # gate centre height above the plinth


def upright_torus(name, major, minor, mat, major_segments):
    """Torus standing in the XZ plane, a flat edge at the bottom."""
    bpy.ops.mesh.primitive_torus_add(
        major_segments=major_segments,
        minor_segments=4,
        major_radius=major,
        minor_radius=minor,
        location=(0, 0, CENTRE_Z),
        rotation=(math.radians(90), math.radians(180 / major_segments), 0),
    )
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(mat)
    apply_transforms(obj)
    return obj


def cube(size, location, mat):
    bpy.ops.mesh.primitive_cube_add(size=size, location=location)
    obj = bpy.context.active_object
    obj.data.materials.append(mat)
    return obj


def build():
    gold = material("Gold", ACCENT, roughness=0.45, metallic=0.35)
    dark = material("HullDark", "#2a2d38", roughness=0.6, metallic=0.4)
    glow = material("GoldGlow", "#ffd68a", emission="#ffc861", emission_strength=2.5)
    crystal_mat = material("Crystal", "#fff0c2", roughness=0.1, emission="#ffd06a", emission_strength=3.5)

    root = empty("VaultGate")

    frame = [upright_torus("Frame", GATE_RADIUS, 0.32, gold, 8)]
    # Radial fins between the corners, plus a glowing bolt at each.
    for i in range(8):
        a = 2 * math.pi * (i + 0.5) / 8
        dx, dz = math.cos(a), math.sin(a)
        tx, tz = -dz, dx
        inner, outer, half = GATE_RADIUS + 0.2, GATE_RADIUS + 0.75, 0.16
        outline = [
            (dx * inner + tx * half, -0.1, CENTRE_Z + dz * inner + tz * half),
            (dx * outer, -0.1, CENTRE_Z + dz * outer),
            (dx * inner - tx * half, -0.1, CENTRE_Z + dz * inner - tz * half),
        ]
        frame.append(prism(f"Fin{i}", outline, (0, 0.2, 0), dark))
        frame.append(cube(0.16, (dx * GATE_RADIUS, -0.34, CENTRE_Z + dz * GATE_RADIUS), glow))

    # Plinth and strut so it reads as a structure, not a floating hoop.
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=1.2, depth=0.3)
    plinth = bpy.context.active_object
    plinth.data.materials.append(dark)
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=1.25, depth=0.06, location=(0, 0, 0.04))
    plinth_trim = bpy.context.active_object
    plinth_trim.data.materials.append(glow)
    bottom = CENTRE_Z - GATE_RADIUS
    strut = prism(
        "Strut",
        [(-0.25, -0.15, 0.15), (0.25, -0.15, 0.15), (0.12, -0.15, bottom), (-0.12, -0.15, bottom)],
        (0, 0.3, 0),
        gold,
    )
    frame += [plinth, plinth_trim, strut]
    parent(join("GateFrame", frame), root)

    for name, major, minor, segments, phase in (
        ("LockRingOuter", 1.65, 0.07, 32, 0.0),
        ("LockRingInner", 1.15, 0.06, 24, 0.4),
    ):
        parts = [upright_torus(name, major, minor, gold, segments)]
        # Notches so the rotation is visible.
        for i in range(4):
            a = 2 * math.pi * i / 4 + phase
            parts.append(cube(0.18, (major * math.cos(a), 0, CENTRE_Z + major * math.sin(a)), glow))
        ring = join(name, parts)
        # Origin on the gate centre so it spins in place.
        bpy.context.scene.cursor.location = (0, 0, CENTRE_Z)
        bpy.ops.object.origin_set(type="ORIGIN_CURSOR")
        parent(ring, root)

    # Elongated octahedron key crystal.
    h, w = 0.75, 0.38
    verts = [(0, 0, h), (0, 0, -h), (w, 0, 0), (-w, 0, 0), (0, w, 0), (0, -w, 0)]
    faces = [
        (0, 2, 4), (0, 4, 3), (0, 3, 5), (0, 5, 2),
        (1, 4, 2), (1, 3, 4), (1, 5, 3), (1, 2, 5),
    ]
    crystal = mesh_object("Crystal", verts, faces, crystal_mat)
    crystal.location = (0, 0, CENTRE_Z)
    parent(crystal, root)


if __name__ == "__main__":
    args = parse_args()
    reset_scene()
    build()
    export_glb(os.path.abspath(args.out))
    if args.preview:
        render_preview(
            os.path.abspath(args.preview),
            views=[((6.0, -12.0, 6.0), (0, 0, 2.4)), ((-2.5, -6.0, 3.6), (0, 0, 2.8))],
            lens=40,
        )
