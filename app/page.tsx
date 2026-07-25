"use client";
import AboutMe from "@/app/_components/about/main";
import Background from "@/app/_components/background";
import Hero from "@/app/_components/hero/main";
import Navbar from "@/app/_components/navbar/main";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { MotionConfig } from "framer-motion";

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <SpeedInsights />
      <Background />
      <Navbar />
      <Hero />
      <main id="main-content" className="md:mx-8" aria-label="Main Content">
        <AboutMe />
      </main>
    </MotionConfig>
  );
}
