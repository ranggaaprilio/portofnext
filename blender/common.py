"""
Shared helpers for the procedural model scripts in this folder.

Every model is built from code so it can be regenerated and tweaked without a
.blend file in the repo. Run a script headless:

  Blender --background --factory-startup --python blender/ship.py -- \
    --out public/models/ship.glb --preview /tmp/ship.png

Conventions:
  - Blender is Z-up; the glTF exporter converts to Y-up, so Blender +Z becomes
    three.js +Y and Blender +Y becomes three.js -Z (three's "forward").
  - Objects and materials that the runtime animates get stable names
    (e.g. "EngineGlow", "RadarHead"); keep them when editing.
"""

import argparse
import math
import os
import sys

import bmesh
import bpy
from mathutils import Vector


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", required=True, help="Output .glb path")
    parser.add_argument("--preview", help="Optional preview .png path")
    return parser.parse_args(argv)


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def hex_to_linear(hex_color):
    """CSS hex -> linear RGBA, so colours match the values in data.ts."""
    hex_color = hex_color.lstrip("#")
    srgb = [int(hex_color[i : i + 2], 16) / 255 for i in (0, 2, 4)]
    linear = [
        c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb
    ]
    return (*linear, 1.0)


def material(
    name,
    color,
    roughness=0.7,
    metallic=0.0,
    emission=None,
    emission_strength=0.0,
    double_sided=False,
):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    mat.use_backface_culling = not double_sided
    rgba = hex_to_linear(color)
    mat.diffuse_color = rgba
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = rgba
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if emission:
        bsdf.inputs["Emission Color"].default_value = hex_to_linear(emission)
        bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat


def mesh_object(name, verts, faces, mat=None):
    """Object from raw verts/faces; normals are recalculated so winding is free."""
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata([tuple(v) for v in verts], [], faces)
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    return obj


def loft(name, rings, mat=None, start_apex=None, end_apex=None):
    """
    Skin a list of equal-length vertex rings. Each end is closed with an apex
    point when given, otherwise with a flat n-gon.
    """
    n = len(rings[0])
    verts = [v for ring in rings for v in ring]
    faces = []
    for r in range(len(rings) - 1):
        a, b = r * n, (r + 1) * n
        for i in range(n):
            j = (i + 1) % n
            faces.append((a + i, a + j, b + j, b + i))
    if start_apex is not None:
        verts.append(start_apex)
        apex = len(verts) - 1
        faces += [(apex, (i + 1) % n, i) for i in range(n)]
    else:
        faces.append(tuple(reversed(range(n))))
    last = (len(rings) - 1) * n
    if end_apex is not None:
        verts.append(end_apex)
        apex = len(verts) - 1
        faces += [(apex, last + i, last + (i + 1) % n) for i in range(n)]
    else:
        faces.append(tuple(last + i for i in range(n)))
    return mesh_object(name, verts, faces, mat)


def prism(name, outline, offset, mat=None):
    """Extrude a planar outline (list of 3D points) along `offset`."""
    n = len(outline)
    offset = Vector(offset)
    verts = [Vector(p) for p in outline] + [Vector(p) + offset for p in outline]
    faces = [tuple(range(n)), tuple(n + i for i in reversed(range(n)))]
    faces += [(i, (i + 1) % n, n + (i + 1) % n, n + i) for i in range(n)]
    return mesh_object(name, verts, faces, mat)


def cylinder(name, radius, depth, mat, vertices=6, location=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices, radius=radius, depth=depth, location=location
    )
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(mat)
    return obj


def surface_direction(polar_deg, azimuth_deg):
    polar, azimuth = math.radians(polar_deg), math.radians(azimuth_deg)
    return Vector(
        (
            math.sin(polar) * math.cos(azimuth),
            math.sin(polar) * math.sin(azimuth),
            math.cos(polar),
        )
    )


def place_on_surface(obj, radius, polar_deg, azimuth_deg, lift=0.0):
    """Stand `obj` on a sphere of `radius` with its local +Z along the normal."""
    normal = surface_direction(polar_deg, azimuth_deg)
    obj.location = normal * (radius + lift)
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = normal.to_track_quat("Z", "Y")


def banded_planet(
    name, radius, height_fn, bands, subdivisions=4, sea_level=None, materials=None
):
    """
    Icosphere displaced by `height_fn(direction)`, each face coloured by the
    first (upper bound, colour) band its average height falls under. With
    `sea_level`, vertices below it are lifted onto a flat sea but keep their
    raw height for colouring, so deep water reads darker than shallows.
    Pass `materials` (one per band) to share them between several bodies.
    """
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=subdivisions, radius=radius)
    planet = bpy.context.active_object
    planet.name = name
    planet.data.name = name

    bm = bmesh.new()
    bm.from_mesh(planet.data)
    raw = {}
    for v in bm.verts:
        direction = v.co.normalized()
        h = height_fn(direction)
        raw[v.index] = h
        surface = h if sea_level is None else max(h, sea_level)
        v.co = direction * (radius + surface)

    if materials is None:
        materials = [
            material(f"Terrain{i}", color, roughness=0.95)
            for i, (_, color) in enumerate(bands)
        ]
    for mat in materials:
        planet.data.materials.append(mat)
    for face in bm.faces:
        height = sum(raw[v.index] for v in face.verts) / len(face.verts)
        face.material_index = next(
            i for i, (bound, _) in enumerate(bands) if height < bound
        )
    bm.to_mesh(planet.data)
    bm.free()
    return planet


def dish_mesh(name, mat, radius=0.6, depth=0.18, segments=12, rings=3):
    """Shallow paraboloid opening towards local +Z."""
    verts = [(0, 0, 0)]
    for r in range(1, rings + 1):
        rr = radius * r / rings
        z = depth * (rr / radius) ** 2
        verts += [
            (rr * math.cos(2 * math.pi * i / segments), rr * math.sin(2 * math.pi * i / segments), z)
            for i in range(segments)
        ]
    faces = [(0, 1 + i, 1 + (i + 1) % segments) for i in range(segments)]
    for r in range(rings - 1):
        a, b = 1 + r * segments, 1 + (r + 1) * segments
        faces += [(a + i, a + (i + 1) % segments, b + (i + 1) % segments, b + i) for i in range(segments)]
    return mesh_object(name, verts, faces, mat)


def join(name, objects):
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()
    joined = bpy.context.view_layer.objects.active
    joined.name = name
    joined.data.name = name
    return joined


def apply_transforms(obj):
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)


def empty(name, location=(0, 0, 0)):
    obj = bpy.data.objects.new(name, None)
    obj.location = location
    bpy.context.scene.collection.objects.link(obj)
    return obj


def parent(child, new_parent):
    """Parent while keeping the child's world transform."""
    # matrix_world is stale until the depsgraph runs; without this, a
    # location/rotation set just before parenting is silently reset.
    bpy.context.view_layer.update()
    world = child.matrix_world.copy()
    child.parent = new_parent
    child.matrix_world = world


def export_glb(path):
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        export_cameras=False,
        export_lights=False,
    )


def render_preview(path, views, lens=50):
    """
    Add camera + three-point lighting on a dark sky and render one still per
    (camera location, look-at target) pair in `views`; extra views get a
    numeric suffix.
    """
    scene = bpy.context.scene

    world = bpy.data.worlds.new("Preview")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (
        hex_to_linear("#05060a")
    )
    scene.world = world

    focus = empty("PreviewTarget")
    cam = bpy.data.objects.new("PreviewCamera", bpy.data.cameras.new("Camera"))
    cam.data.lens = lens
    scene.collection.objects.link(cam)
    track = cam.constraints.new("TRACK_TO")
    track.target = focus
    track.track_axis = "TRACK_NEGATIVE_Z"
    track.up_axis = "UP_Y"
    scene.camera = cam

    def sun(name, rotation, strength, color):
        light = bpy.data.objects.new(name, bpy.data.lights.new(name, "SUN"))
        light.data.energy = strength
        light.data.color = hex_to_linear(color)[:3]
        light.rotation_euler = [math.radians(a) for a in rotation]
        scene.collection.objects.link(light)

    sun("Key", (50, 10, 35), 3.5, "#fff1e0")
    sun("Fill", (60, 0, -140), 0.6, "#8fa6ff")
    sun("Rim", (-60, 0, 180), 2.0, "#b9a6ff")

    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 800
    scene.view_settings.view_transform = "Standard"
    stem, ext = os.path.splitext(path)
    for i, (location, target) in enumerate(views):
        cam.location = location
        focus.location = target
        scene.render.filepath = path if i == 0 else f"{stem}-{i + 1}{ext}"
        bpy.ops.render.render(write_still=True)
