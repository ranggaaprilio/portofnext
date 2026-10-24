"""
Mars-like desert planet for the landing hero. Radius 3 units. Cratered rust
plains, darker basalt regions, a long canyon scar and a small polar cap.
"""

import os
import sys

import numpy as np

sys.path.append(os.path.dirname(__file__))
from common_hd import (  # noqa: E402
    assign,
    craters,
    export_glb_hd,
    fbm,
    make_image,
    mix,
    normal_map_from_height,
    parse_args,
    pbr_material,
    render_preview,
    reset_scene,
    ridged,
    smoothstep,
    sphere_directions,
    srgb,
    uv_sphere,
)

RADIUS = 3.0
SEED = 4
TEX_W, TEX_H = 2048, 1024


def surface():
    d = sphere_directions(TEX_W, TEX_H)
    lat = d[..., 2]

    regions = fbm(d * 1.6, 6, SEED) * 0.5 + 0.5
    detail = fbm(d * 18.0, 5, SEED + 1) * 0.5 + 0.5
    pits = craters(d, 420, SEED + 2, min_size=0.006, max_size=0.11)
    # One canyon system: a wandering band south of the equator that only
    # spans about a quarter of the globe and fades out at both ends.
    lon = np.arctan2(d[..., 1], d[..., 0])
    wander = 0.06 * fbm(d * 3.0, 3, SEED + 6)
    band = np.exp(-(((lat + 0.12 + wander) / 0.035) ** 2))
    span = smoothstep(1.1, 0.4, np.abs(lon - 0.6))
    canyon = band * span * (0.6 + 0.4 * ridged(d * 9.0, 4, SEED + 3))

    height = 0.25 * regions + 0.04 * detail + 0.9 * pits - 0.25 * canyon

    albedo = mix(srgb("#c1683a"), srgb("#5c2c1c"), smoothstep(0.45, 0.7, regions))
    albedo = mix(albedo, srgb("#d9925e"), smoothstep(0.55, 0.3, regions) * 0.6)
    albedo *= (0.82 + 0.36 * detail)[..., None]
    # Crater floors collect darker dust, rims catch bright ejecta.
    albedo = mix(albedo, srgb("#6b3322"), np.clip(-pits * 5, 0, 0.35))
    albedo = mix(albedo, srgb("#e3a57a"), np.clip(pits * 8, 0, 0.25))
    albedo = mix(albedo, srgb("#3d1d14"), np.clip(canyon * 1.2, 0, 0.7))

    cap = smoothstep(0.9, 0.95, lat + 0.03 * fbm(d * 8.0, 4, SEED + 4))
    albedo = mix(albedo, srgb("#f2ece4"), cap)

    orm = np.zeros((TEX_H, TEX_W, 3))
    orm[..., 0] = 1.0
    orm[..., 1] = 0.92 - 0.3 * cap
    normal = normal_map_from_height(height * 0.05, 1.0)
    return albedo, normal, orm


def build():
    albedo, normal, orm = surface()
    planet = uv_sphere("Planet", RADIUS)
    assign(
        planet,
        pbr_material(
            "MarsSurface",
            base=make_image("MarsBase", albedo),
            normal=make_image("MarsNormal", normal, color=False),
            orm=make_image("MarsORM", orm, color=False),
        ),
    )


if __name__ == "__main__":
    args = parse_args()
    reset_scene()
    build()
    export_glb_hd(os.path.abspath(args.out))
    if args.preview:
        render_preview(args.preview, [((0, -13, 2), (0, 0, 0)), ((9, 6, 6), (0, 0, 0))])
