"""
Helpers for the semi-realistic landing-page models in this folder.

Same idea as ../common.py (everything generated from code, no .blend in the
repo), but surfaces come from textures instead of flat per-face colours:
numpy fBm noise is sampled straight on the sphere / tile, written into packed
Blender images and wired into a Principled BSDF that the glTF exporter
understands (base colour, tangent-space normal map, roughness/metallic).

Image rows run bottom-to-top, like Blender's own pixel buffer.
"""

import math
import os
import sys

import bpy
import numpy as np

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from common import (  # noqa: E402,F401
    empty,
    hex_to_linear,
    join,
    parent,
    parse_args,
    render_preview,
    reset_scene,
)

# --------------------------------------------------------------------------
# Noise


def _hash(ix, iy, iz, seed):
    h = (ix * 73856093) ^ (iy * 19349663) ^ (iz * 83492791) ^ (seed * 2654435761)
    h &= 0xFFFFFFFF
    h = ((h ^ (h >> 13)) * 1274126177) & 0xFFFFFFFF
    h ^= h >> 16
    return (h & 0xFFFF) / 65535.0 * 2.0 - 1.0


def value_noise(p, seed=0, period=None):
    """Smooth value noise in [-1, 1] at points p (..., 3). Optional lattice period for tiling."""
    cell = np.floor(p)
    f = p - cell
    f = f * f * (3.0 - 2.0 * f)
    i = cell.astype(np.int64)

    def corner(dx, dy, dz):
        x, y, z = i[..., 0] + dx, i[..., 1] + dy, i[..., 2] + dz
        if period is not None:
            x, y = x % period, y % period
        return _hash(x, y, z, seed)

    fx, fy, fz = f[..., 0], f[..., 1], f[..., 2]
    x00 = corner(0, 0, 0) + (corner(1, 0, 0) - corner(0, 0, 0)) * fx
    x10 = corner(0, 1, 0) + (corner(1, 1, 0) - corner(0, 1, 0)) * fx
    x01 = corner(0, 0, 1) + (corner(1, 0, 1) - corner(0, 0, 1)) * fx
    x11 = corner(0, 1, 1) + (corner(1, 1, 1) - corner(0, 1, 1)) * fx
    y0 = x00 + (x10 - x00) * fy
    y1 = x01 + (x11 - x01) * fy
    return y0 + (y1 - y0) * fz


def fbm(p, octaves=6, seed=0, lacunarity=2.0, gain=0.5, period=None):
    """Fractal sum, roughly in [-1, 1]."""
    total = np.zeros(p.shape[:-1])
    amp, norm, freq = 1.0, 0.0, 1.0
    for o in range(octaves):
        per = None if period is None else int(period * freq)
        total += amp * value_noise(p * freq, seed + o * 101, per)
        norm += amp
        amp *= gain
        freq *= lacunarity
    return total / norm


def ridged(p, octaves=5, seed=0):
    """Sharp crests in [0, 1]; good for mountain chains and canyons."""
    total = np.zeros(p.shape[:-1])
    amp, norm, freq = 1.0, 0.0, 1.0
    for o in range(octaves):
        n = 1.0 - np.abs(value_noise(p * freq, seed + o * 131))
        total += amp * n * n
        norm += amp
        amp *= 0.5
        freq *= 2.0
    return total / norm


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def mix(a, b, t):
    """Blend RGB colours/images a -> b by a scalar or per-texel weight t."""
    t = np.asarray(t, dtype=float)
    if t.ndim > 0:
        t = t[..., None]
    return a + (b - a) * t


def srgb(hex_color):
    hex_color = hex_color.lstrip("#")
    return np.array([int(hex_color[i : i + 2], 16) / 255 for i in (0, 2, 4)])


# --------------------------------------------------------------------------
# Sphere mapping (equirectangular)


def sphere_directions(width, height):
    """Unit direction per texel, (height, width, 3); +Z is north, row 0 is the south pole."""
    u = (np.arange(width) + 0.5) / width
    v = (np.arange(height) + 0.5) / height
    lon = (u - 0.5) * 2.0 * math.pi
    theta = math.pi * (1.0 - v)  # polar angle from +Z
    sin_t = np.sin(theta)[:, None]
    x = sin_t * np.cos(lon)[None, :]
    y = sin_t * np.sin(lon)[None, :]
    z = np.repeat(np.cos(theta)[:, None], width, axis=1)
    return np.stack([x, y, z], axis=-1)


def craters(directions, count, seed, min_size=0.03, max_size=0.18):
    """Height offset for `count` bowl craters with raised rims scattered on the sphere."""
    rng = np.random.default_rng(seed)
    centres = rng.normal(size=(count, 3))
    centres /= np.linalg.norm(centres, axis=1, keepdims=True)
    # Many small, few large.
    sizes = min_size + (max_size - min_size) * rng.random(count) ** 3
    out = np.zeros(directions.shape[:-1])
    for c, size in zip(centres, sizes):
        d = np.arccos(np.clip(directions @ c, -1.0, 1.0)) / size
        mask = d < 1.6
        if not mask.any():
            continue
        dd = d[mask]
        bowl = np.where(dd < 1.0, dd * dd - 1.0, 0.0)
        rim = 0.35 * np.exp(-((dd - 1.0) ** 2) / 0.04)
        out[mask] += (bowl + rim) * size
    return out


def normal_map_from_height(height, strength, equirect=True):
    """Tangent-space (OpenGL, +Y up) normal map RGB in [0, 1] from a height field."""
    h_rows, w_cols = height.shape
    dy, dx = np.gradient(height)
    if equirect:
        # Texels shrink towards the poles; correct the east-west slope for it.
        theta = math.pi * (1.0 - (np.arange(h_rows) + 0.5) / h_rows)
        dx = dx / np.maximum(np.sin(theta), 0.08)[:, None]
        dx *= w_cols / (2.0 * math.pi)
        dy *= h_rows / math.pi
    else:
        dx *= w_cols
        dy *= h_rows
    n = np.stack([-dx * strength, -dy * strength, np.ones_like(height)], axis=-1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    return n * 0.5 + 0.5


# --------------------------------------------------------------------------
# Blender images, meshes and materials


def make_image(name, pixels, color=True, alpha=False):
    """Packed image from (height, width, 3|4) floats in [0, 1]. JPEG unless it needs alpha."""
    h, w = pixels.shape[:2]
    if pixels.shape[2] == 3:
        pixels = np.concatenate([pixels, np.ones((h, w, 1))], axis=-1)
    img = bpy.data.images.new(name, w, h, alpha=alpha)
    img.colorspace_settings.name = "sRGB" if color else "Non-Color"
    img.pixels.foreach_set(np.clip(pixels, 0, 1).astype(np.float32).ravel())
    img.file_format = "PNG" if alpha else "JPEG"
    img.pack()
    return img


def uv_sphere(name, radius, segments=128, rings=64):
    """UV sphere whose UVs match `sphere_directions` exactly (u = longitude, v = latitude)."""
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=radius)
    obj = bpy.context.active_object
    obj.name = name
    obj.data.name = name
    mesh = obj.data
    uv = mesh.uv_layers.active or mesh.uv_layers.new()
    for poly in mesh.polygons:
        coords = []
        for li in poly.loop_indices:
            co = mesh.vertices[mesh.loops[li].vertex_index].co.normalized()
            u = math.atan2(co.y, co.x) / (2 * math.pi) + 0.5
            v = 1.0 - math.acos(max(-1.0, min(1.0, co.z))) / math.pi
            coords.append([li, u, v, abs(co.z) > 0.9999])
        # Faces straddling the date line: pull the low side past 1.
        us = [c[1] for c in coords if not c[3]]
        if us and max(us) - min(us) > 0.5:
            for c in coords:
                if c[1] < 0.5:
                    c[1] += 1.0
            us = [c[1] for c in coords if not c[3]]
        # Pole vertices take the mean longitude of their face.
        mean_u = sum(us) / len(us) if us else 0.5
        for li, u, v, pole in coords:
            uv.data[li].uv = (mean_u if pole else u, v)
    mesh.shade_smooth()
    return obj


def pbr_material(
    name,
    base=None,
    normal=None,
    orm=None,
    color="#ffffff",
    roughness=0.6,
    metallic=0.0,
    normal_strength=1.0,
    emission=None,
    emission_strength=0.0,
    alpha_from_base=False,
    vertex_colors=False,
):
    """
    Principled material in the shape the glTF exporter maps 1:1:
      base   image -> Base Color (and Alpha with alpha_from_base)
      normal image -> Normal Map node
      orm    image -> Separate Color: G roughness, B metallic
    """
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    mat.use_backface_culling = True
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    bsdf = nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = hex_to_linear(color)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic

    def tex(image):
        node = nodes.new("ShaderNodeTexImage")
        node.image = image
        return node

    if base is not None:
        node = tex(base)
        links.new(node.outputs["Color"], bsdf.inputs["Base Color"])
        if alpha_from_base:
            links.new(node.outputs["Alpha"], bsdf.inputs["Alpha"])
            mat.surface_render_method = "BLENDED"
    elif vertex_colors:
        node = nodes.new("ShaderNodeVertexColor")
        node.layer_name = "Col"
        links.new(node.outputs["Color"], bsdf.inputs["Base Color"])
    if normal is not None:
        node = tex(normal)
        nmap = nodes.new("ShaderNodeNormalMap")
        nmap.inputs["Strength"].default_value = normal_strength
        links.new(node.outputs["Color"], nmap.inputs["Color"])
        links.new(nmap.outputs["Normal"], bsdf.inputs["Normal"])
    if orm is not None:
        node = tex(orm)
        split = nodes.new("ShaderNodeSeparateColor")
        links.new(node.outputs["Color"], split.inputs["Color"])
        links.new(split.outputs["Green"], bsdf.inputs["Roughness"])
        links.new(split.outputs["Blue"], bsdf.inputs["Metallic"])
    if emission:
        bsdf.inputs["Emission Color"].default_value = hex_to_linear(emission)
        bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat


def assign(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    return obj


def box_uv(obj, size=1.0):
    """World-scale cube projection, so tiling textures keep one texel density everywhere."""
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.cube_project(cube_size=size, scale_to_bounds=False, correct_aspect=True)
    bpy.ops.object.mode_set(mode="OBJECT")


def apply_modifiers(obj):
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    for mod in list(obj.modifiers):
        bpy.ops.object.modifier_apply(modifier=mod.name)


def apply_transforms_all(objects):
    """Bake location/rotation/scale into the mesh, so joining keeps placement."""
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)


def smooth(obj, subdivisions=0, bevel=0.0, bevel_segments=2):
    """Optional bevel then subdivision, applied, then smooth shading."""
    if bevel > 0:
        mod = obj.modifiers.new("Bevel", "BEVEL")
        mod.width = bevel
        mod.segments = bevel_segments
        mod.limit_method = "ANGLE"
    if subdivisions > 0:
        mod = obj.modifiers.new("Subsurf", "SUBSURF")
        mod.levels = subdivisions
        mod.render_levels = subdivisions
    apply_modifiers(obj)
    obj.data.shade_smooth()
    return obj


# --------------------------------------------------------------------------
# Tiling surface textures for built hulls


def panel_textures(name, size, base_hex, seed, panels=6, grime=0.12, rough=(0.35, 0.55), metal=0.6):
    """
    Tiling hull plating: a grid of plates with random splits, recessed seams,
    rivet dots and soft grime. Returns (base, normal, orm) images.
    """
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:size, 0:size] / size
    height = np.ones((size, size))
    seam = 1.5 / size

    def line_mask(coord, positions):
        d = np.full(coord.shape, 1.0)
        for p in positions:
            d = np.minimum(d, np.abs(coord - p))
            d = np.minimum(d, 1.0 - np.abs(coord - p))
        return d < seam

    rows = np.linspace(0, 1, panels, endpoint=False)
    height[line_mask(yy, rows)] = 0.0
    # Each row of plates gets its own vertical splits.
    plate_shade = np.zeros((size, size))
    for r0 in rows:
        band = (yy >= r0) & (yy < r0 + 1.0 / panels)
        cuts = np.sort(rng.random(rng.integers(2, 5)))
        height[band & line_mask(xx, cuts)] = 0.0
        edges = np.concatenate([[0.0], cuts, [1.0]])
        for a, b in zip(edges[:-1], edges[1:]):
            plate_shade[band & (xx >= a) & (xx < b)] = rng.normal(0, 0.035)
    # Rivets along each row.
    for r0 in rows:
        ry = r0 + 4.0 / size
        for rx in np.arange(0.02, 1.0, 0.04):
            d = np.hypot(xx - rx, yy - ry)
            height[d < 1.2 / size] = 1.25

    p = np.stack([xx * 8, yy * 8, np.zeros_like(xx)], axis=-1)
    dirt = fbm(p, 5, seed, period=8) * 0.5 + 0.5
    albedo = srgb(base_hex)[None, None, :] * (1.0 + plate_shade[..., None])
    albedo *= 1.0 - grime * dirt[..., None]
    albedo[height < 0.5] *= 0.55

    orm = np.zeros((size, size, 3))
    orm[..., 0] = 1.0
    orm[..., 1] = rough[0] + (rough[1] - rough[0]) * dirt
    orm[..., 2] = metal
    normal = normal_map_from_height(height * 0.004, 1.0, equirect=False)
    return (
        make_image(f"{name}Base", albedo),
        make_image(f"{name}Normal", normal, color=False),
        make_image(f"{name}ORM", orm, color=False),
    )


def export_glb_hd(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        export_cameras=False,
        export_lights=False,
        # JPEG everywhere; images with alpha (clouds) stay PNG automatically.
        export_image_format="JPEG",
        export_jpeg_quality=85,
    )
