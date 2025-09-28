"use client";
import SplitText from "@/components/ui/split-text";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
// import AnimatedEmoji from "./animated-emoji";
import { motion } from "framer-motion";
import React from "react";

const Hero = () => {
  return (
    <header
      className="relative flex justify-center items-center w-full h-[100vh] overflow-hidden"
      aria-label="Hero Section"
    >
      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative z-10 flex flex-col gap-2 items-center justify-center px-4"
      >
        <SplitText
          text="Rangga Aprilio Utama"
          className="text-3xl md:text-7xl font-bold dark:text-white text-center py-1.5 drop-shadow-lg"
          delay={150}
          animationFrom={{ opacity: 0, transform: "translate3d(0,50px,0)" }}
          animationTo={{ opacity: 1, transform: "translate3d(0,0,0)" }}
          easing={(t) => t}
          threshold={0.2}
        />
        <div
          className="font-extralight text-base md:text-4xl dark:text-neutral-200 md:py-4 my-0 drop-shadow-md flex"
          itemProp="jobTitle"
        >
          <TypewriterEffectSmooth
            words={[
              {
                text: "Fullstack",
                className:
                  "font-extralight text-base md:text-4xl dark:text-neutral-200 py-2",
              },
              {
                text: "Developer",
                className:
                  "font-extralight text-base md:text-4xl dark:text-neutral-200 py-4 text-[var(--palette-2)]",
              },
            ]}
          />
        </div>
        {/* Add skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded"
        >
          Skip to main content
        </a>
      </motion.div>
    </header>
  );
};

export default Hero;
