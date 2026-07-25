"use client";

import { type Variants, motion } from "framer-motion";
import Link from "next/link";

const expoOut = [0.16, 1, 0.3, 1] as const;

const NAME = "Rangga Aprilio Utama";

const nameContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.15 } },
};

const charVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: expoOut },
  },
};

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: expoOut },
  },
};

const staggerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.5 } },
};

const Hero = () => {
  return (
    <header
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden"
      aria-label="Hero Section"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-6 text-center">
        {/* Availability pill */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: expoOut }}
          className="flex items-center gap-2.5 rounded-full border border-border px-4 py-1.5"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Available for work
          </span>
        </motion.div>

        {/* Name — staggered char reveal */}
        <motion.h1
          variants={nameContainerVariants}
          initial="hidden"
          animate="visible"
          aria-label={NAME}
          className="font-display font-bold tracking-[-0.04em] text-[clamp(2.75rem,8vw,6.5rem)] leading-[1.05]"
        >
          {NAME.split(" ").map((word) => (
            <span
              key={word}
              aria-hidden="true"
              className="inline-block whitespace-nowrap [&:not(:last-child)]:mr-[0.25em]"
            >
              {word.split("").map((char, charIndex) => (
                <motion.span
                  // biome-ignore lint/suspicious/noArrayIndexKey: name is a static string, order never changes
                  key={`${word}-${charIndex}`}
                  variants={charVariants}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
            </span>
          ))}
        </motion.h1>

        <motion.div
          variants={staggerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-6"
        >
          {/* Role line */}
          <motion.p
            variants={revealVariants}
            itemProp="jobTitle"
            className="text-xl md:text-2xl text-muted-foreground"
          >
            Fullstack <span className="text-brand">Developer</span>
          </motion.p>

          {/* Value prop */}
          <motion.p
            variants={revealVariants}
            className="max-w-xl text-base md:text-lg leading-relaxed text-muted-foreground"
          >
            I build reliable web systems end to end — 6 years of experience
            across React, Vue, Node.js, TypeScript, and Golang.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={revealVariants}
            className="mt-2 flex flex-wrap items-center justify-center gap-4"
          >
            <a
              href="#about"
              className="rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
            >
              View my work
            </a>
            <Link
              href="/contact"
              className="rounded-full border border-border px-6 py-3 text-sm text-foreground transition-colors hover:border-foreground/40"
            >
              Get in touch
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.a
        href="#about"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6, ease: expoOut }}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Scroll to about section"
      >
        <span className="font-mono text-xs uppercase tracking-[0.3em]">
          scroll
        </span>
        <motion.svg
          animate={{ y: [0, 6, 0] }}
          transition={{
            duration: 1.6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </motion.svg>
      </motion.a>

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded"
      >
        Skip to main content
      </a>
    </header>
  );
};

export default Hero;
