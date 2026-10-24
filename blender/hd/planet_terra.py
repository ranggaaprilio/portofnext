"""
Earth-like ocean world for the landing page (About stop). Radius 3 units.

Runtime hooks:
  Clouds  separate sphere just above the surface; rotate it a little faster
          than the planet so the weather drifts.
"""

import os
import sys

import numpy as np

sys.path.append(os.path.dirname(__file__))
from common_hd import (  # noqa: E402
    assign,
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
SEED = 11
TEX_W, TEX_H = 2048, 1024
CLOUD_W, CLOUD_H = 1024, 512
SEA_LEVEL = 0.04


def warped(d, seed, amount=0.45):
    w = np.stack([fbm(d * 1.4 + o, 4, seed + i) for i, o in enumerate((0.0, 5.2, 9.7))], axis=-1)
    return d + w * amount


def surface():
    d = sphere_directions(TEX_W, TEX_H)
    p = warped(d, SEED)
    continent = fbm(p * 1.3, 7, SEED)
    land = smoothstep(SEA_LEVEL, SEA_LEVEL + 0.25, continent)
    mountains = ridged(p * 3.5, 5, SEED + 3) * land
    height = continent + 0.35 * mountains

    lat = np.abs(d[..., 2])
    moisture = fbm(d * 2.5 + 40.0, 5, SEED + 8) * 0.5 + 0.5
    # Wet tropics, dry subtropical belts, as on Earth.
    moisture += 0.15 * np.exp(-((lat / 0.18) ** 2)) - 0.2 * np.exp(-(((lat - 0.42) / 0.1) ** 2))
    detail = fbm(d * 24.0, 4, SEED + 9) * 0.5 + 0.5

    # Ocean: darker with depth, turquoise right at the coast.
    depth = np.clip((SEA_LEVEL - continent) / 0.35, 0, 1)
    ocean = mix(srgb("#14527e"), srgb("#06172f"), depth)
    ocean = mix(srgb("#2a8a9a"), ocean, smoothstep(0.0, 0.06, SEA_LEVEL - continent))

    ground = mix(srgb("#b59a68"), srgb("#4a6b30"), smoothstep(0.3, 0.5, moisture))
    ground = mix(ground, srgb("#26401d"), smoothstep(0.55, 0.75, moisture))
    ground = mix(ground, srgb("#6f6352"), smoothstep(0.25, 0.6, mountains))
    ground *= (0.85 + 0.3 * detail)[..., None]

    is_land = continent > SEA_LEVEL
    albedo = np.where(is_land[..., None], ground, ocean)

    ice = smoothstep(0.8, 0.9, lat + 0.08 * fbm(d * 6.0, 4, SEED + 5))
    snow = np.maximum(ice, smoothstep(0.5, 0.75, mountains) * is_land)
    albedo = mix(albedo, srgb("#eef3f7"), snow)

    orm = np.zeros((TEX_H, TEX_W, 3))
    orm[..., 0] = 1.0
    orm[..., 1] = np.where(is_land, 0.85, 0.32)
    orm[..., 1] = orm[..., 1] * (1 - snow) + 0.55 * snow

    relief = np.where(is_land, height - SEA_LEVEL, 0.0) + 0.02 * detail * is_land
    normal = normal_map_from_height(relief * 0.06, 1.0)
    return albedo, normal, orm


def clouds():
    d = sphere_directions(CLOUD_W, CLOUD_H)
    stretched = d * np.array([2.2, 2.2, 4.5])
    p = warped(stretched, SEED + 20, amount=0.8)
    c = fbm(p, 6, SEED + 21) * 0.5 + 0.5
    lat = np.abs(d[..., 2])
    c *= 0.75 + 0.35 * smoothstep(0.2, 0.6, lat)  # stormier mid-latitudes
    alpha = smoothstep(0.55, 0.8, c) * 0.9
    rgba = np.ones((CLOUD_H, CLOUD_W, 4))
    rgba[..., 3] = alpha
    return rgba


def build():
    albedo, normal, orm = surface()
    planet = uv_sphere("Planet", RADIUS)
    assign(
        planet,
        pbr_material(
            "TerraSurface",
            base=make_image("TerraBase", albedo),
            normal=make_image("TerraNormal", normal, color=False),
            orm=make_image("TerraORM", orm, color=False),
        ),
    )
    cloud = uv_sphere("Clouds", RADIUS * 1.012, 96, 48)
    assign(
        cloud,
        pbr_material(
            "TerraClouds",
            base=make_image("TerraCloudMap", clouds(), alpha=True),
            roughness=1.0,
            alpha_from_base=True,
        ),
    )


if __name__ == "__main__":
    args = parse_args()
    reset_scene()
    build()
    export_glb_hd(os.path.abspath(args.out))
    if args.preview:
        render_preview(args.preview, [((0, -11, 3), (0, 0, 0)), ((8, 6, 4), (0, 0, 0))])
