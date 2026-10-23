"""
Four loose asteroid shapes for instanced belts. Each RockN is centred on its
own origin and roughly 1 unit in radius; they are spread along X only so the
preview shows all of them. The runtime should take each mesh's geometry and
scatter it with an InstancedMesh, ignoring these node positions.
"""

import math
import os
import random
import sys

from mathutils import Vector, noise

sys.path.append(os.path.dirname(__file__))
from common import (  # noqa: E402
    apply_transforms,
    banded_planet,
    empty,
    export_glb,
    material,
    parent,
    parse_args,
    render_preview,
    reset_scene,
)

BANDS = [
    (-0.15, "#2c2b31"),
    (0.0, "#423f47"),
    (0.15, "#5a5660"),
    (math.inf, "#76717a"),
]


def build():
    materials = [material(f"Rock{i}", color, roughness=0.95) for i, (_, color) in enumerate(BANDS)]
    root = empty("Asteroids")
    rng = random.Random(5)
    for i in range(4):
        offset = Vector([rng.uniform(-50, 50) for _ in range(3)])
        rock = banded_planet(
            f"Rock{i}",
            1.0,
            lambda d, o=offset: 0.35 * noise.fractal(d * 1.3 + o, 1.0, 2.0, 3),
            BANDS,
            subdivisions=2,
            materials=materials,
        )
        rock.scale = (rng.uniform(0.8, 1.3), rng.uniform(0.7, 1.0), rng.uniform(0.6, 0.9))
        rock.rotation_euler = tuple(rng.uniform(0, math.pi) for _ in range(3))
        apply_transforms(rock)
        rock.location = (i * 3.0 - 4.5, 0, 0)
        parent(rock, root)


if __name__ == "__main__":
    args = parse_args()
    reset_scene()
    build()
    export_glb(os.path.abspath(args.out))
    if args.preview:
        render_preview(
            os.path.abspath(args.preview),
            views=[((0, -11.0, 4.0), (0, 0, 0))],
            lens=40,
        )
