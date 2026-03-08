"use client";
import AboutMe from "@/app/_components/about/main";
import Hero from "@/app/_components/hero/main";
import Navbar from "@/app/_components/navbar/main";
import FloatingLines from "@/components/ui/FloatingLines";

export default function Home() {
  return (
    <>
      <div className="fixed inset-0 w-full h-full z-0">
        <FloatingLines
          linesGradient={["#4c3bcf", "#8b5cf6", "#06b6d4", "#10b981"]}
          enabledWaves={["middle", "bottom"]}
          lineCount={[8]}
          lineDistance={[8]}
          topWavePosition={{ x: 10.0, y: 0.5, rotate: -0.4 }}
          middleWavePosition={{ x: 5.0, y: 0.0, rotate: 0.2 }}
          bottomWavePosition={{ x: 2.0, y: -0.7, rotate: -1 }}
          animationSpeed={0.8}
          interactive={true}
        />
      </div>
      <Navbar />
      <Hero />
      <main id="main-content" className="md:mx-8" aria-label="Main Content">
        <AboutMe />
      </main>
    </>
  );
}
