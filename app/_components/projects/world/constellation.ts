import type { Project } from "@/app/_components/projects/data";
import type { WorldTextures } from "@/app/_components/projects/world/textures";
import { Container, Graphics, Sprite } from "pixi.js";

/**
 * Faint links between neighbouring stations. Edges whose ends have both been
 * seen light up and carry a travelling pulse, so exploring the map visibly
 * wires it together instead of just ticking a counter.
 *
 * The lit `Graphics` is only redrawn when the seen set changes — rebuilding
 * geometry every frame is the classic way to make a cheap effect expensive.
 */

type Edge = {
  a: string;
  b: string;
  ax: number;
  ay: number;
  bx: number;
  by: number;
  color: string;
};

export type Constellation = {
  view: Container;
  setSeen: (seen: ReadonlySet<string>) => void;
  update: (elapsed: number) => void;
  destroy: () => void;
};

/** Each station links to its two nearest neighbours; duplicates are dropped. */
const buildEdges = (projects: readonly Project[]): Edge[] => {
  const edges = new Map<string, Edge>();

  for (const project of projects) {
    const neighbours = projects
      .filter((other) => other.id !== project.id)
      .map((other) => ({
        other,
        distanceSq:
          (other.world.x - project.world.x) ** 2 +
          (other.world.y - project.world.y) ** 2,
      }))
      .sort((left, right) => left.distanceSq - right.distanceSq)
      .slice(0, 2);

    for (const { other } of neighbours) {
      const key = [project.id, other.id].sort().join("|");
      if (edges.has(key)) continue;
      edges.set(key, {
        a: project.id,
        b: other.id,
        ax: project.world.x,
        ay: project.world.y,
        bx: other.world.x,
        by: other.world.y,
        color: project.isPlaceholder ? "#52525b" : project.accent,
      });
    }
  }

  // Array.from rather than spread: the project targets ES5 lib output, where
  // spreading a Map iterator is a compile error.
  return Array.from(edges.values());
};

export const createConstellation = (
  projects: readonly Project[],
  textures: WorldTextures,
): Constellation => {
  const view = new Container();
  const edges = buildEdges(projects);

  const base = new Graphics();
  for (const edge of edges) {
    base.moveTo(edge.ax, edge.ay).lineTo(edge.bx, edge.by);
  }
  base.stroke({ color: 0xffffff, alpha: 0.05, width: 1 });

  const lit = new Graphics();
  lit.blendMode = "add";

  const pulseLayer = new Container();
  pulseLayer.blendMode = "add";

  view.addChild(base, lit, pulseLayer);

  const pulses = edges.map((edge) => {
    const sprite = new Sprite(textures.spark);
    sprite.anchor.set(0.5);
    sprite.tint = edge.color;
    sprite.scale.set(0.6);
    sprite.visible = false;
    pulseLayer.addChild(sprite);
    return sprite;
  });

  let activeEdges: number[] = [];

  return {
    view,
    setSeen: (seen) => {
      activeEdges = [];
      lit.clear();

      for (let index = 0; index < edges.length; index += 1) {
        const edge = edges[index];
        const isActive = seen.has(edge.a) && seen.has(edge.b);
        pulses[index].visible = isActive;
        if (!isActive) continue;

        activeEdges.push(index);
        lit
          .moveTo(edge.ax, edge.ay)
          .lineTo(edge.bx, edge.by)
          .stroke({ color: edge.color, alpha: 0.28, width: 1.5 });
      }
    },
    update: (elapsed) => {
      for (const index of activeEdges) {
        const edge = edges[index];
        // Offset per edge so the pulses do not march in lockstep.
        const progress = (elapsed * 0.22 + index * 0.37) % 1;
        const sprite = pulses[index];
        sprite.position.set(
          edge.ax + (edge.bx - edge.ax) * progress,
          edge.ay + (edge.by - edge.ay) * progress,
        );
        // Fade at both ends so a pulse appears to depart and arrive.
        sprite.alpha = Math.sin(progress * Math.PI) * 0.8;
      }
    },
    destroy: () => {
      view.destroy({ children: true });
    },
  };
};
