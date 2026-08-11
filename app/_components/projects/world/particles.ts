import type { WorldTextures } from "@/app/_components/projects/world/textures";
import {
  PARTICLE_POOL,
  SHOCKWAVE_POOL,
} from "@/app/_components/projects/world/tuning";
import { Container, Graphics, Sprite } from "pixi.js";

/**
 * Additive particles for the thruster trail and the discovery burst, plus the
 * expanding rings that fire on discovery.
 *
 * Everything is pre-allocated: the frame loop only ever mutates existing
 * sprites. Allocating a `Sprite` per puff at 60fps is exactly the kind of
 * garbage that turns a smooth canvas into a stuttering one.
 */

type Particle = {
  sprite: Sprite;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  startScale: number;
  endScale: number;
  drag: number;
};

type Shockwave = { graphics: Graphics; life: number; maxLife: number };

export type ParticleSystem = {
  view: Container;
  emit: (
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: string,
    life: number,
    scale: number,
  ) => void;
  burst: (x: number, y: number, color: string) => void;
  update: (dt: number) => void;
  destroy: () => void;
};

export const createParticles = (textures: WorldTextures): ParticleSystem => {
  const view = new Container();

  const sparkLayer = new Container();
  sparkLayer.blendMode = "add";

  const waveLayer = new Container();
  waveLayer.blendMode = "add";

  view.addChild(waveLayer, sparkLayer);

  const particles: Particle[] = [];
  for (let index = 0; index < PARTICLE_POOL; index += 1) {
    const sprite = new Sprite(textures.spark);
    sprite.anchor.set(0.5);
    sprite.visible = false;
    sparkLayer.addChild(sprite);
    particles.push({
      sprite,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 1,
      startScale: 1,
      endScale: 0,
      drag: 2,
    });
  }

  const shockwaves: Shockwave[] = [];
  for (let index = 0; index < SHOCKWAVE_POOL; index += 1) {
    const graphics = new Graphics()
      .circle(0, 0, 40)
      .stroke({ color: 0xffffff, width: 2, alpha: 1 });
    graphics.visible = false;
    waveLayer.addChild(graphics);
    shockwaves.push({ graphics, life: 0, maxLife: 1 });
  }

  // Round-robin cursors: when the pool is saturated the oldest puff is reused,
  // which shortens the trail rather than dropping frames.
  let particleCursor = 0;
  let waveCursor = 0;

  const emit: ParticleSystem["emit"] = (x, y, vx, vy, color, life, scale) => {
    const particle = particles[particleCursor];
    particleCursor = (particleCursor + 1) % particles.length;

    particle.sprite.position.set(x, y);
    particle.sprite.tint = color;
    particle.sprite.visible = true;
    particle.sprite.alpha = 1;
    particle.sprite.scale.set(scale);
    particle.vx = vx;
    particle.vy = vy;
    particle.life = life;
    particle.maxLife = life;
    particle.startScale = scale;
    particle.endScale = scale * 0.2;
    particle.drag = 2.5;
  };

  const burst: ParticleSystem["burst"] = (x, y, color) => {
    for (let index = 0; index < 24; index += 1) {
      const angle = (index / 24) * Math.PI * 2;
      const speed = 90 + Math.random() * 130;
      emit(
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        color,
        0.6 + Math.random() * 0.4,
        0.5 + Math.random() * 0.5,
      );
    }

    const wave = shockwaves[waveCursor];
    waveCursor = (waveCursor + 1) % shockwaves.length;
    wave.graphics.position.set(x, y);
    wave.graphics.tint = color;
    wave.graphics.visible = true;
    wave.graphics.alpha = 0.9;
    wave.graphics.scale.set(0.3);
    wave.life = 0.75;
    wave.maxLife = 0.75;
  };

  return {
    view,
    emit,
    burst,
    update: (dt) => {
      for (const particle of particles) {
        if (particle.life <= 0) continue;

        particle.life -= dt;
        if (particle.life <= 0) {
          particle.sprite.visible = false;
          continue;
        }

        const decay = Math.exp(-particle.drag * dt);
        particle.vx *= decay;
        particle.vy *= decay;
        particle.sprite.x += particle.vx * dt;
        particle.sprite.y += particle.vy * dt;

        const remaining = particle.life / particle.maxLife;
        particle.sprite.alpha = remaining;
        particle.sprite.scale.set(
          particle.endScale +
            (particle.startScale - particle.endScale) * remaining,
        );
      }

      for (const wave of shockwaves) {
        if (wave.life <= 0) continue;

        wave.life -= dt;
        if (wave.life <= 0) {
          wave.graphics.visible = false;
          continue;
        }

        const progress = 1 - wave.life / wave.maxLife;
        wave.graphics.scale.set(0.3 + progress * 2.4);
        wave.graphics.alpha = 0.9 * (1 - progress) ** 2;
      }
    },
    destroy: () => {
      view.destroy({ children: true });
    },
  };
};
