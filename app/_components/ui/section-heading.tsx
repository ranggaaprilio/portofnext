"use client";

import { expoOut } from "@/lib/motion";
import { type Variants, motion } from "framer-motion";

const eyebrowVariants: Variants = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.5, ease: expoOut },
  },
};

const titleVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: expoOut },
  },
};

const SectionHeading = ({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) => (
  <>
    <motion.p
      variants={eyebrowVariants}
      className="origin-left font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground"
    >
      {eyebrow}
    </motion.p>
    <motion.h2
      variants={titleVariants}
      className="mt-3 font-display text-4xl tracking-[-0.02em] md:text-5xl"
    >
      {title}
    </motion.h2>
  </>
);

export default SectionHeading;
