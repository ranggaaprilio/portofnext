"""
Offline Devtools' workshop: a lumpy asteroid with a levelled deck on top
carrying a slewing crane, stacked containers and floodlights, plus a drill
rig biting into its flank. About 6 units across.

Runtime hooks:
  Crane       empty at the crane's slewing pivot; swing it about local up.
  Floodlight  emissive material on the lamps and boom tip; flicker it.
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
    render_preview,
    reset_scene,
)

ACCENT = "#41b883"
RADIUS = 2.2
SQUASH = (1.3, 1.0, 0.8)
SEED = 11
DECK_Z = RADIUS * SQUASH[2]

BANDS = [
    (-0.25, "#2c2b31"),
    (-0.08, "#423f47"),
    (0.08, "#5a5660"),
    (0.25, "#76717a"),
    (math.inf, "#958f90"),
]


def rock_height(direction):
    h = 0.45 * noise.fractal(direction * 1.4 + Vector((0, SEED, 0)), 1.0, 2.0, 4)
    # Flatten the top into a plateau for the deck.
    plateau = min(max((direction.z - 0.8) / 0.1, 0.0), 1.0)
    return h * (1.0 - plateau)


def box(name, size, location, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    obj.data.materials.append(mat)
    apply_transforms(obj)
    return obj


def oriented(obj, direction, location):
    """Point `obj`'s local +Z along `direction` and bake the transform."""
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = direction.to_track_quat("Z", "Y")
    obj.location = location
    apply_transforms(obj)
    return obj


def build():
    metal = material("Metal", "#c9ccd6", roughness=0.45, metallic=0.5)
    dark = material("HullDark", "#2a2d38", roughness=0.6, metallic=0.4)
    accent = material("Accent", ACCENT, roughness=0.5, emission=ACCENT, emission_strength=0.5)
    lamp = material("Floodlight", "#e9fff4", emission="#9dffd0", emission_strength=5.0)
    crate_colors = [
        material("CrateGreen", ACCENT, roughness=0.6),
        material("CrateWhite", "#dfe3e8", roughness=0.6),
        material("CrateGray", "#6b7280", roughness=0.6),
    ]

    root = empty("AsteroidWorkshop")

    rock = banded_planet("Asteroid", RADIUS, rock_height, BANDS, subdivisions=3)
    rock.scale = SQUASH
    apply_transforms(rock)
    parent(rock, root)

    z = DECK_Z
    static = [
        box("Deck", (2.6, 1.9, 0.16), (0, 0, z + 0.02), dark),
        box("DeckTrimN", (2.6, 0.06, 0.05), (0, 0.95, z + 0.12), accent),
        box("DeckTrimS", (2.6, 0.06, 0.05), (0, -0.95, z + 0.12), accent),
    ]
    green, white, gray = crate_colors
    for i, (x, y, layer, mat) in enumerate(
        [(-0.85, -0.5, 0, green), (-0.85, -0.12, 0, gray), (-0.85, -0.31, 1, white), (-0.15, -0.6, 0, green)]
    ):
        static.append(box(f"Crate{i}", (0.7, 0.34, 0.34), (x, y, z + 0.27 + layer * 0.35), mat))
    for i, x in enumerate((1.15, -1.15)):
        static.append(cylinder(f"LampMast{i}", 0.03, 0.9, metal, location=(x, 0.8, z + 0.55)))
        static.append(box(f"Lamp{i}", (0.22, 0.1, 0.1), (x, 0.8, z + 1.02), lamp))
    parent(join("WorkshopDeck", static), root)

    # Crane slews about its mast; the pivot sits on the deck.
    px, py = 0.6, 0.25
    pivot = empty("Crane", (px, py, z + 0.1))
    parent(pivot, root)
    boom = 1.8
    hook_x = px - boom + 0.4
    crane_parts = [
        cylinder("Turret", 0.22, 0.25, accent, location=(px, py, z + 0.22)),
        box("CraneMast", (0.14, 0.14, 1.3), (px, py, z + 0.95), metal),
        box("Cab", (0.3, 0.28, 0.24), (px + 0.18, py, z + 0.48), accent),
        box("Boom", (boom, 0.1, 0.1), (px - boom / 2 + 0.25, py, z + 1.55), metal),
        box("Counterweight", (0.3, 0.24, 0.24), (px + 0.45, py, z + 1.55), dark),
        cylinder("Cable", 0.012, 0.8, dark, location=(hook_x, py, z + 1.15)),
        box("Hook", (0.12, 0.12, 0.08), (hook_x, py, z + 0.74), accent),
        box("BoomTip", (0.08, 0.08, 0.08), (px - boom + 0.25, py, z + 1.62), lamp),
    ]
    parent(join("CraneBody", crane_parts), pivot)

    # Drill rig on the flank: housing outside the rock, bit pointing in.
    out = Vector((math.cos(math.radians(200)), math.sin(math.radians(200)), -0.15)).normalized()
    surface = Vector(tuple(out[i] * RADIUS * SQUASH[i] for i in range(3)))
    bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=0.28, radius2=0.0, depth=0.7)
    bit = bpy.context.active_object
    bit.data.materials.append(metal)
    oriented(bit, -out, surface + out * 0.15)
    housing = oriented(cylinder("DrillHousing", 0.3, 0.45, accent), out, surface + out * 0.7)
    cap = oriented(cylinder("DrillCap", 0.18, 0.2, dark), out, surface + out * 1.0)
    parent(join("DrillRig", [bit, housing, cap]), root)


if __name__ == "__main__":
    args = parse_args()
    reset_scene()
    build()
    export_glb(os.path.abspath(args.out))
    if args.preview:
        render_preview(
            os.path.abspath(args.preview),
            views=[((-9.0, -9.5, 6.5), (0, 0, 0.6)), ((-1.5, -4.8, 4.6), (0, 0, 2.2))],
            lens=40,
        )
