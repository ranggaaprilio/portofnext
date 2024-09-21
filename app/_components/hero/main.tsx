"use client";
import { motion } from "framer-motion";
import React from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";

const Hero = () => {
  return (
      <div className=" flex justify-center items-center w-full h-[100vh]">
          <motion.div
              initial={{opacity: 0.0, y: 40}}
              whileInView={{opacity: 1, y: 0}}
              transition={{
                  delay: 0.3,
                  duration: 0.8,
                  ease: "easeInOut",
              }}
              className="relative flex flex-col gap-4 items-center justify-center px-4"
          >
              <div className="text-3xl md:text-7xl font-bold dark:text-white text-center">
                  Rangga Aprilio Utama
              </div>
              <div className="font-extralight text-base md:text-4xl dark:text-neutral-200 md:py-4">
                  <TypewriterEffectSmooth
                      words={[
                          {
                              text: "Fullstack",
                              className: "font-extralight text-base md:text-4xl dark:text-neutral-200 py-4",
                          },
                          {
                              text: "Developer",
                              className: "font-extralight text-base md:text-4xl dark:text-neutral-200 py-4 text-[var(--palette-2)]",
                          },
                      ]}
                  />
              </div>
          </motion.div>
      </div>
  );
}

export default Hero;