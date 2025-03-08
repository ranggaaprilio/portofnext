"use client";
import { motion } from "framer-motion";
import React from "react";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import SplitText from "@/components/ui/split-text";

const Hero = () => {
  return (
    <div className=" flex justify-center items-center w-full h-[100vh]">
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-2 items-center justify-center px-4"
      >
        <SplitText
          text="Rangga Aprilio Utama"
          className="text-3xl md:text-7xl font-bold dark:text-white text-center py-1.5"
          delay={150}
          animationFrom={{ opacity: 0, transform: "translate3d(0,50px,0)" }}
          animationTo={{ opacity: 1, transform: "translate3d(0,0,0)" }}
          easing={(t) => t}
          threshold={0.2}
          //   rootMargin="0px"
        />
        <div className="font-extralight text-base md:text-4xl dark:text-neutral-200 md:py-4 my-0">
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
      </motion.div>
    </div>
  );
};

export default Hero;
