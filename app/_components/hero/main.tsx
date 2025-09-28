"use client";
import SplitText from "@/components/ui/split-text";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
// import AnimatedEmoji from "./animated-emoji";
import { motion } from "framer-motion";
import React, { useCallback } from "react";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";
import type { Container, Engine } from "tsparticles-engine";

const Hero = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    console.log("Initializing particles...");
    await loadSlim(engine);
    console.log("Particles loaded successfully!");
  }, []);

  const particlesLoaded = useCallback(
    async (container: Container | undefined) => {
      console.log("Particles container:", container);
    },
    [],
  );

  return (
    <header
      className="relative flex justify-center items-center w-full h-[100vh] overflow-hidden"
      aria-label="Hero Section"
    >
      {/* Particles Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 120,
          interactivity: {
            events: {
              onClick: {
                enable: true,
                mode: "push",
              },
              onHover: {
                enable: true,
                mode: "repulse",
              },
              resize: true,
            },
            modes: {
              push: {
                quantity: 4,
              },
              repulse: {
                distance: 200,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: "#4c3bcf",
            },
            links: {
              color: "#4c3bcf",
              distance: 150,
              enable: true,
              opacity: 0.7,
              width: 1,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: false,
              speed: 1,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 80,
            },
            opacity: {
              value: 0.8,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 3 },
            },
          },
          detectRetina: true,
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative z-0 flex flex-col gap-2 items-center justify-center px-4"
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
