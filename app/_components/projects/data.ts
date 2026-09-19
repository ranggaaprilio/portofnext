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

/**
 * One product screenshot. `width`/`height` are the intrinsic pixels of the file
 * in `public/` — next/image needs both to reserve space before the bytes land,
 * and these shots do not all share an aspect ratio.
 */
export type ProjectShot = {
  /** Same-origin path under /public. */
  src: string;
  /** Describes what the screen shows, not the fact that it is a screenshot. */
  alt: string;
  /** Short line rendered beneath the shot in the detail panel. */
  caption: string;
  width: number;
  height: number;
};

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
  /**
   * Product shots, first one first — the grid card shows only the opener, the
   * detail panel shows all of them. Omit for projects with nothing to show.
   */
  gallery?: readonly ProjectShot[];
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
  {
    id: "leadmanager",
    title: "LeadManager",
    tagline:
      "Construction project-lead platform for Hubexo Asia Pacific — 320k+ live projects, searched, mapped and pushed through a sales pipeline.",
    description:
      "LeadManager is Hubexo's subscription platform for the construction sales teams of Asia Pacific: manufacturers, distributors, contractors and consultants who need to reach a project before it is tendered. Researchers keep every project versioned, and the app turns that feed into a saved search, a map, a pipeline and a project record with the decision-makers attached. The work here ran end to end — a LoopBack API over Oracle and Elasticsearch feeding a filter model that survives 320,626 matches, list, split and map views over the same result set, and a drag-free pipeline that moves a project from Opportunity through to Won.",
    tech: [
      "React",
      "TypeScript",
      "LoopBack",
      "Oracle",
      "Elasticsearch",
      "Redis",
      "OpenStreetMap",
      "Amazon SQS",
      "Amazon SNS",
      "Amazon S3",
      "CloudFront",
      "Design system",
    ],
    role: "Fullstack Engineer",
    year: "2021 — Present",
    status: "live",
    links: {
      demo: "https://apac.hubexo.com/products/leadmanager/",
    },
    accent: "#e8402c",
    icon: "data",
    world: { x: -620, y: 420 },
    gallery: [
      {
        src: "/projects/leadmanager/dashboard.jpg",
        alt: "LeadManager dashboard with a project search bar, stage counters and a project pipeline panel",
        caption:
          "Dashboard — stage counters over 10,540 updated projects, with the pipeline and key accounts beside them.",
        width: 1600,
        height: 876,
      },
      {
        src: "/projects/leadmanager/search-results.jpg",
        alt: "Search results table listing construction projects with stage, value and last-update columns",
        caption:
          "Search results — 320,626 matching projects, filtered down the left rail and sorted in a dense table.",
        width: 1600,
        height: 918,
      },
      {
        src: "/projects/leadmanager/map-view.jpg",
        alt: "Map of Australia and New Zealand with clustered project pins",
        caption:
          "The same result set on a map, clustered by region so a territory reads at a glance.",
        width: 1600,
        height: 914,
      },
      {
        src: "/projects/leadmanager/pipeline.jpg",
        alt: "Project pipeline with Won, Negotiation, Opportunities and Quoted stages",
        caption:
          "Pipeline — projects move stage by stage, with AI-suggested lookalikes above the funnel.",
        width: 1600,
        height: 928,
      },
      {
        src: "/projects/leadmanager/project-details.jpg",
        alt: "Project detail page showing status, value, categories and pipeline position",
        caption:
          "Project record — versioned research, value, approvals and pipeline position on one page.",
        width: 1600,
        height: 899,
      },
    ],
  },
  {
    id: "bid-ocean",
    title: "Bid Ocean",
    tagline:
      "Public bid-opportunity platform for Hubexo North America — trade-first alerts across 423k US construction, goods and services postings.",
    description:
      "Bid Ocean is Hubexo North America's lead-generation platform for contractors chasing public work, launched in 2026 to bring the group's separate data packages into one feed. It is organised by trade and geography rather than by data source, so a civil contractor in Kansas sees closing dates and bid values that actually apply to them. The work here ran end to end — a NestJS service behind the feed with Kafka, OpenSearch and a HubSpot integration, and the opportunity surface on top of it: the saved-search and trade filter panel, the results table with bid value and close date, and the bid detail page with its documents, contacts and plan holders.",
    tech: [
      "React",
      "TypeScript",
      "NestJS",
      "Kafka",
      "OpenSearch",
      "Redis",
      "Amazon SNS",
      "HubSpot integration",
      "Design system",
    ],
    role: "Fullstack Engineer",
    year: "2026",
    status: "live",
    links: {
      demo: "https://na.hubexo.com/products/bidocean/",
    },
    accent: "#2f81c4",
    icon: "api",
    world: { x: -120, y: 300 },
    gallery: [
      {
        src: "/projects/bid-ocean/dashboard.jpg",
        alt: "Bid Ocean home page with a search bar over a construction photo and suggested bid cards",
        caption:
          "Home — saved searches on the hero, then suggested bids drawn from the opportunity tracker.",
        width: 1600,
        height: 958,
      },
      {
        src: "/projects/bid-ocean/filters.jpg",
        alt: "Filter drawer with keyword, location, posting type and trade checkboxes over a results table",
        caption:
          "Filter drawer — posting type and trade groups narrow 423,506 postings without leaving the results.",
        width: 1600,
        height: 917,
      },
      {
        src: "/projects/bid-ocean/bid-details.jpg",
        alt: "Bid detail page showing bid close date, status, project files, contacts and trade groups",
        caption:
          "Bid detail — close date, downloadable documents, owner contact and every trade the posting touches.",
        width: 1600,
        height: 921,
      },
    ],
  },
  // TODO(rangga): confirm `role` below — the screenshots show the console,
  // not who built which half of it.
  {
    id: "silancar",
    title: "Silancar",
    tagline:
      "Real-time GPS command centre for Indonesian traffic police — 185 vehicles tracked live, with a dashcam and a chat line to every driver.",
    description:
      "Silancar is the console a police command centre watches a patrol fleet from. Every unit reports its position over a WebSocket, so the OpenStreetMap view updates as the cars move rather than on a refresh, and each one carries a live status — moving, parked, engine off or offline. Operators draw POI zones and route corridors on the same map, then open a vehicle to see its dashcam and talk to the driver without leaving the screen. Built on a NestJS gateway feeding a React front end, and deployed to DITLANTAS and SATLANTAS units.",
    tech: [
      "NestJS",
      "React",
      "TypeScript",
      "WebSocket",
      "OpenStreetMap / Leaflet",
    ],
    role: "Fullstack Engineer",
    year: "2025",
    status: "live",
    links: {
      demo: "https://silancar.com/",
    },
    accent: "#3d63dd",
    icon: "api",
    world: { x: 340, y: 460 },
    gallery: [
      {
        src: "/projects/silancar/fleet-map.jpg",
        alt: "Map of West Java with clustered police vehicle markers and a vehicle status panel on the right",
        caption:
          "Mobilitas Kendaraan — 185 units clustered across the jurisdiction, each one live-filtered by moving, parked, engine-off or offline. Unit number and location redacted.",
        width: 1600,
        height: 840,
      },
      {
        src: "/projects/silancar/poi-geofence.jpg",
        alt: "OpenStreetMap view of Tangerang with a drawn polygon zone and a list of POIs awaiting approval",
        caption:
          "Titik POI — zones drawn straight onto the map, each one moving through an open, approved or rejected review.",
        width: 1600,
        height: 850,
      },
      {
        src: "/projects/silancar/live-cam-chat.jpg",
        alt: "Live Cam dialog showing a night dashcam feed beside a chat panel for the driver",
        caption:
          "Live Cam — the driver's outward or inward camera, with a chat thread to the command centre beside it. Driver name and telemetry redacted.",
        width: 1600,
        height: 840,
      },
    ],
  },
  // TODO(rangga): replace the entry below with a real project. Edit the copy,
  // add a `gallery`, drop `isPlaceholder` and set `status`. Leave `world` alone
  // unless you want to move the node on the map.
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
