/**
 * Single source of truth for the /projects page.
 * Both the SSR grid and the PixiJS arcade world read from PROJECTS — never
 * duplicate project copy in a component.
 *
 * Keep this module free of `pixi.js` imports: it is part of the shared client
 * chunk, and a value import here would pull the whole renderer into every page.
 */

export type ProjectStatus = "live" | "wip" | "archived" | "planned";

/**
 * Which mark the Pixi station core draws. Declared here rather than next to the
 * painters so `data.ts` stays the shared module and never imports the renderer.
 */
export type GlyphKey = "site" | "tools" | "api" | "mobile" | "data" | "locked";

export type ProjectLinks = {
  /** Absolute URL, or a same-origin path such as "/devtools". */
  demo?: string;
  repo?: string;
};

/** World-space pixels, origin at the world centre, y pointing down. */
export type WorldPosition = { x: number; y: number };

export type Project = {
  /** Stable slug. Doubles as the Pixi node key and the `discovered` Set member. */
  id: string;
  title: string;
  /** One line. Used on the card, the in-world label and the HUD prompt. */
  tagline: string;
  /** Two to four sentences. Detail panel only. */
  description: string;
  tech: readonly string[];
  role: string;
  year: string;
  status: ProjectStatus;
  links: ProjectLinks;
  /** CSS hex. Pixi v8 `fill({ color })` accepts CSS strings, so one value drives both renderers. */
  accent: string;
  world: WorldPosition;
  /** Mark drawn inside the station core. Placeholders always render "locked". */
  icon?: GlyphKey;
  /** True for slots that are not a real project yet. */
  isPlaceholder?: boolean;
};

export const WORLD = {
  width: 2400,
  height: 1600,
  gridSize: 80,
  nodeRadius: 34,
  /** Enter proximity at this distance… */
  interactRadius: 96,
  /** …and leave at this one. The gap is hysteresis, it stops the prompt flickering. */
  releaseRadius: 120,
  avatarRadius: 16,
} as const;

const BRAND_ACCENT = "#7c5cf0";
const PLACEHOLDER_ACCENT = "#3f3f46";

const PLACEHOLDER_DESCRIPTION =
  "This node is a placeholder. Swap it for a real project in app/_components/projects/data.ts.";
const PLACEHOLDER_TAGLINE = "A slot reserved for the next thing worth showing.";

export const PROJECTS: readonly Project[] = [
  {
    id: "aprilio-dev",
    title: "aprilio.dev",
    tagline:
      "This site — dark-first portfolio with a WebGL hero and a 2D arcade project world.",
    description:
      "A personal site built as a playground for interaction work rather than a template fill-in. The hero runs a 2500-point three.js particle field that only mounts on capable pointer devices, and this projects page is a PixiJS arcade world layered over a plain HTML list so nothing is hidden behind the game. Everything degrades on touch and with reduced motion.",
    tech: [
      "Next.js 14",
      "TypeScript",
      "Tailwind CSS",
      "Framer Motion",
      "three.js / R3F",
      "PixiJS",
    ],
    role: "Designer & Developer",
    year: "2024 — Present",
    status: "live",
    links: {
      demo: "https://www.aprilio.dev",
      repo: "https://github.com/ranggaaprilio/portofnext",
    },
    accent: BRAND_ACCENT,
    icon: "site",
    world: { x: -520, y: -260 },
  },
  {
    id: "offline-devtools",
    title: "Offline Devtools",
    tagline:
      "78 offline developer utilities, self-hosted inside this site at /devtools.",
    description:
      "An it-tools fork trimmed and wired into the portfolio as a static Vite build served under /devtools, so the tools stay reachable without a second deployment. Everything runs client-side: encoders, converters, generators and formatters keep working with no network. Integrated through a Next.js rewrite and built as part of the same pnpm workspace.",
    tech: ["Vue 3", "TypeScript", "Vite", "Naive UI", "UnoCSS"],
    role: "Fork maintainer & integrator",
    year: "2024",
    status: "live",
    links: {
      demo: "/devtools",
      repo: "https://github.com/CorentinTh/it-tools",
    },
    accent: "#41b883",
    icon: "tools",
    world: { x: 480, y: -180 },
  },
  // TODO(rangga): replace the four entries below with real projects.
  // Edit title / tagline / description / tech / role / year / links / accent,
  // drop `isPlaceholder` and set `status` to "live" or "wip". Leave `world`
  // alone unless you want to move the node on the map.
  {
    id: "placeholder-1",
    title: "Coming soon",
    tagline: PLACEHOLDER_TAGLINE,
    description: PLACEHOLDER_DESCRIPTION,
    tech: [],
    role: "",
    year: "",
    status: "planned",
    links: {},
    accent: PLACEHOLDER_ACCENT,
    world: { x: -620, y: 420 },
    isPlaceholder: true,
  },
  {
    id: "placeholder-2",
    title: "Coming soon",
    tagline: PLACEHOLDER_TAGLINE,
    description: PLACEHOLDER_DESCRIPTION,
    tech: [],
    role: "",
    year: "",
    status: "planned",
    links: {},
    accent: PLACEHOLDER_ACCENT,
    world: { x: -120, y: 300 },
    isPlaceholder: true,
  },
  {
    id: "placeholder-3",
    title: "Coming soon",
    tagline: PLACEHOLDER_TAGLINE,
    description: PLACEHOLDER_DESCRIPTION,
    tech: [],
    role: "",
    year: "",
    status: "planned",
    links: {},
    accent: PLACEHOLDER_ACCENT,
    world: { x: 340, y: 460 },
    isPlaceholder: true,
  },
  {
    id: "placeholder-4",
    title: "Coming soon",
    tagline: PLACEHOLDER_TAGLINE,
    description: PLACEHOLDER_DESCRIPTION,
    tech: [],
    role: "",
    year: "",
    status: "planned",
    links: {},
    accent: PLACEHOLDER_ACCENT,
    world: { x: 760, y: 240 },
    isPlaceholder: true,
  },
];

export const PROJECT_TOTAL = PROJECTS.length;

/** Real entries only — structured data must not advertise stubs. */
export const REAL_PROJECTS = PROJECTS.filter(
  (project) => !project.isPlaceholder,
);

export const SITE_ORIGIN = "https://www.aprilio.dev";

export const isExternalLink = (href: string): boolean =>
  href.startsWith("http");

/** Same-origin paths need an origin before they can go into JSON-LD. */
export const toAbsoluteUrl = (href: string): string =>
  isExternalLink(href) ? href : `${SITE_ORIGIN}${href}`;

export const findProject = (id: string | null): Project | null =>
  id === null ? null : (PROJECTS.find((project) => project.id === id) ?? null);

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  live: "Live",
  wip: "In progress",
  archived: "Archived",
  planned: "Coming soon",
};
