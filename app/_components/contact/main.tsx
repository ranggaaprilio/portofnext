"use client";

import TiltCard from "@/app/_components/ui/tilt-card";
import { expoOut } from "@/lib/motion";
import { type Variants, motion } from "framer-motion";
import type { IconType } from "react-icons";
import { FaGithub, FaInstagram, FaLinkedinIn, FaMedium } from "react-icons/fa";
import { SiThreads } from "react-icons/si";

const socialLinks: Array<{
  name: string;
  handle: string;
  href: string;
  description: string;
  Icon: IconType;
}> = [
  {
    name: "LinkedIn",
    handle: "ranggaaprilio",
    href: "https://www.linkedin.com/in/ranggaaprilio",
    description: "Connect with me professionally and explore my work history.",
    Icon: FaLinkedinIn,
  },
  {
    name: "Threads",
    handle: "@ranggaaprilio",
    href: "https://www.threads.com/@ranggaaprilio",
    description:
      "Follow my thoughts on tech, development, and product building.",
    Icon: SiThreads,
  },
  {
    name: "GitHub",
    handle: "ranggaaprilio",
    href: "https://github.com/ranggaaprilio",
    description: "See my code, open-source projects, and experiments.",
    Icon: FaGithub,
  },
  {
    name: "Instagram",
    handle: "@ranggaaprilio",
    href: "https://instagram.com/ranggaaprilio",
    description: "Follow behind-the-scenes moments and personal updates.",
    Icon: FaInstagram,
  },
  {
    name: "Medium",
    handle: "@ranggaaprillio",
    href: "https://medium.com/@ranggaaprillio",
    description: "Read my articles, tutorials, and development notes.",
    Icon: FaMedium,
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: expoOut },
  },
};

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const Contact = () => {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 py-28 text-center"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-24 mx-auto h-72 max-w-xl rounded-full bg-brand/10 blur-3xl"
        aria-hidden="true"
      />

      <motion.p
        variants={revealVariants}
        className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-brand"
      >
        Contact
      </motion.p>
      <motion.h1
        variants={revealVariants}
        className="max-w-3xl font-display text-4xl font-bold tracking-tight md:text-6xl"
      >
        Let&apos;s connect and build something great.
      </motion.h1>
      <motion.p
        variants={revealVariants}
        className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg"
      >
        You can reach me through these social channels. I&apos;m always open to
        discussing web development, collaboration, and new opportunities.
      </motion.p>

      <motion.div
        variants={gridVariants}
        className="mt-14 grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5"
      >
        {socialLinks.map(({ name, handle, href, description, Icon }) => (
          <TiltCard key={name} variants={revealVariants} className="h-full">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${name} profile`}
              className="group block h-full rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-brand/40"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground transition-colors group-hover:text-brand">
                <Icon
                  className="h-7 w-7 transition-transform group-hover:scale-110"
                  aria-hidden="true"
                />
              </div>
              <h2 className="text-2xl font-semibold">{name}</h2>
              <p className="mt-1 text-sm font-medium text-brand">{handle}</p>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </a>
          </TiltCard>
        ))}
      </motion.div>
    </motion.section>
  );
};

export default Contact;
