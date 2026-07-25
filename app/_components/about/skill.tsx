"use client";

import { type Variants, motion } from "framer-motion";
import type { IconType } from "react-icons";
import {
  SiApachekafka,
  SiDocker,
  SiElasticsearch,
  SiGo,
  SiGraphql,
  SiJavascript,
  SiLaravel,
  SiMysql,
  SiNodedotjs,
  SiOracle,
  SiPhp,
  SiPostgresql,
  SiPython,
  SiReact,
  SiRedis,
  SiSocketdotio,
  SiTailwindcss,
  SiTypescript,
  SiVuedotjs,
} from "react-icons/si";

const expoOut = [0.16, 1, 0.3, 1] as const;

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const chipVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: expoOut },
  },
};

const skills: Array<{ label: string; Icon: IconType }> = [
  { label: "TypeScript", Icon: SiTypescript },
  { label: "Go", Icon: SiGo },
  { label: "Node.js", Icon: SiNodedotjs },
  { label: "PostgreSQL", Icon: SiPostgresql },
  { label: "React", Icon: SiReact },
  { label: "JavaScript", Icon: SiJavascript },
  { label: "Vue", Icon: SiVuedotjs },
  { label: "PHP", Icon: SiPhp },
  { label: "Elasticsearch", Icon: SiElasticsearch },
  { label: "Oracle", Icon: SiOracle },
  { label: "Redis", Icon: SiRedis },
  { label: "Tailwind CSS", Icon: SiTailwindcss },
  { label: "Python", Icon: SiPython },
  { label: "MySQL", Icon: SiMysql },
  { label: "Docker", Icon: SiDocker },
  { label: "Socket.io", Icon: SiSocketdotio },
  { label: "Laravel", Icon: SiLaravel },
  { label: "Kafka", Icon: SiApachekafka },
  { label: "GraphQL", Icon: SiGraphql },
];

export function Skills() {
  return (
    <motion.ul
      variants={gridVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="grid w-full grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6"
      aria-label="Skills list"
    >
      {skills.map(({ label, Icon }) => (
        <motion.li
          key={label}
          variants={chipVariants}
          className="group flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
        >
          <Icon
            className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-brand"
            aria-hidden="true"
          />
          <span className="truncate text-sm text-muted-foreground transition-colors group-hover:text-foreground">
            {label}
          </span>
        </motion.li>
      ))}
    </motion.ul>
  );
}
