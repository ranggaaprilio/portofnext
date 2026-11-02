"""
Sirius' star: a blue-white star core inside a faceted geodesic cage, a small
white-dwarf companion on a tilted orbit (Sirius B), and a ring of agent nodes
riding a glowing pipeline ring, broken by gold gate posts where the work waits
for a human. Centred on the origin; the pipeline ring reaches 3.2.

Runtime hooks:
  Cage         geodesic shell around the core; turn it slowly.
  StarGlow     emissive material on the core; pulse it.
  BinaryOrbit  empty at the centre, tilted; spin about local up (three.js Y)
               and the companion riding it orbits.
  AgentRing    empty at the centre, tilted; spin about local up and the agents
               and gates riding it travel the pipeline.
  AgentLight   emissive material on the agent nodes; pulse it.
"""

import math
import os
import sys

import bmesh
import bpy

sys.path.append(os.path.dirname(__file__))
from common import (  # noqa: E402
    apply_transforms,
    cylinder,
    empty,
    export_glb,
    join,
    material,
    mesh_object,
    parent,
    parse_args,
    render_preview,
    reset_scene,
)

ACCENT = "#4f5bd5"
CORE_RADIUS = 1.0
CAGE_RADIUS = 1.5
RING_RADIUS = 3.2
AGENTS = 7
# A gate sits just after these agents on the ring.
GATES = (1, 4)


def octahedron(name, size, mat):
    s = size
    verts = [(s, 0, 0), (-s, 0, 0), (0, s, 0), (0, -s, 0), (0, 0, s * 1.4), (0, 0, -s * 1.4)]
    faces = [
        (0, 2, 4), (2, 1, 4), (1, 3, 4), (3, 0, 4),
        (2, 0, 5), (1, 2, 5), (3, 1, 5), (0, 3, 5),
    ]
    return mesh_object(name, verts, faces, mat)


def gate(name, angle, mat):
    """Two posts straddling the ring at `angle`, joined by a lintel."""
    radial = (math.cos(angle), math.sin(angle))
    posts = [
        cylinder(
            f"{name}Post{k}", 0.05, 0.6, mat, vertices=6,
            location=(r * radial[0], r * radial[1], 0),
        )
        for k, r in enumerate((RING_RADIUS - 0.22, RING_RADIUS + 0.22))
    ]
    bpy.ops.mesh.primitive_cube_add(
        size=1, location=(RING_RADIUS * radial[0], RING_RADIUS * radial[1], 0.32)
    )
    lintel = bpy.context.active_object
    lintel.scale = (0.56, 0.08, 0.06)
    lintel.rotation_euler = (0, 0, angle)
    lintel.data.materials.append(mat)
    apply_transforms(lintel)
    return join(name, [*posts, lintel])


def build():
    glow = material("StarGlow", "#dfe9ff", emission="#a9c4ff", emission_strength=6.0)
    corona = material("Corona", "#7f93ff", roughness=0.4, emission=ACCENT, emission_strength=1.2)
    cage_mat = material("CageMetal", "#2a2f45", roughness=0.35, metallic=0.8)
    dwarf = material("Dwarf", "#ffffff", emission="#f2f5ff", emission_strength=3.0)
    pipe = material("Pipeline", "#6f7cff", emission=ACCENT, emission_strength=2.5)
    agent_light = material("AgentLight", "#b9c4ff", emission="#8c9bff", emission_strength=3.5)
    agent_hull = material("AgentHull", "#c9ccd6", roughness=0.5, metallic=0.3)
    gold = material(
        "Gate", "#d9a441", roughness=0.35, metallic=0.7, emission="#d9a441", emission_strength=0.4
    )

    root = empty("SiriusStar")

    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=CORE_RADIUS)
    core = bpy.context.active_object
    core.name = "StarCore"
    core.data.materials.append(glow)
    parent(core, root)

    # Broken shell between core and cage: a halo the core glows through.
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=CORE_RADIUS * 1.18)
    halo = bpy.context.active_object
    halo.name = "Corona"
    halo.data.materials.append(corona)
    bm = bmesh.new()
    bm.from_mesh(halo.data)
    drop = [face for face in bm.faces if face.index % 3 != 0]
    bmesh.ops.delete(bm, geom=drop, context="FACES_ONLY")
    bm.to_mesh(halo.data)
    bm.free()
    parent(halo, root)

    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=CAGE_RADIUS)
    cage = bpy.context.active_object
    cage.name = "Cage"
    cage.data.materials.append(cage_mat)
    wire = cage.modifiers.new("Wire", "WIREFRAME")
    wire.thickness = 0.07
    bpy.ops.object.modifier_apply(modifier=wire.name)
    parent(cage, root)

    # Sirius B on its own tilted orbit, inside the agent ring.
    binary = empty("BinaryOrbit")
    binary.rotation_euler = (math.radians(35), math.radians(-10), 0)
    parent(binary, root)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.26)
    companion = bpy.context.active_object
    companion.name = "Companion"
    companion.data.materials.append(dwarf)
    companion.parent = binary
    companion.location = (2.25, 0, 0)

    # Pipeline ring with agents and gates riding it.
    ring = empty("AgentRing")
    ring.rotation_euler = (math.radians(14), math.radians(6), 0)
    parent(ring, root)

    bpy.ops.mesh.primitive_torus_add(
        major_segments=72, minor_segments=6, major_radius=RING_RADIUS, minor_radius=0.045
    )
    track = bpy.context.active_object
    track.name = "Pipeline"
    track.data.materials.append(pipe)
    track.parent = ring

    for i in range(AGENTS):
        angle = 2 * math.pi * i / AGENTS
        node = octahedron(f"AgentCore{i}", 0.2, agent_light)
        collar = cylinder(f"AgentCollar{i}", 0.24, 0.07, agent_hull, vertices=8)
        agent = join(f"Agent{i}", [node, collar])
        agent.parent = ring
        agent.location = (RING_RADIUS * math.cos(angle), RING_RADIUS * math.sin(angle), 0)

        if i in GATES:
            gate(f"Gate{i}", angle + math.pi / AGENTS, gold).parent = ring


if __name__ == "__main__":
    args = parse_args()
    reset_scene()
    build()
    export_glb(os.path.abspath(args.out))
    if args.preview:
        render_preview(
            os.path.abspath(args.preview),
            views=[((11.0, -11.0, 6.5), (0, 0, 0)), ((4.5, -5.5, 3.0), (2.0, 0, 0.3))],
            lens=40,
        )
