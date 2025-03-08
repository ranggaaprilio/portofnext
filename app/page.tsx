import Hero from "@/app/_components/hero/main";
import { AuroraBackground } from "@/components/ui/aurora-background";
import React from "react";
import Navbar from "@/app/_components/navbar/main";
import AboutMe from "@/app/_components/about/main";

export default function Home() {
  return (
    <>
      <AuroraBackground className={"justify-start items-start"}>
        <Navbar />
        <Hero />
      </AuroraBackground>
      <main
        id="main-content"
        className="md:mx-8"
        role="main"
        aria-label="Main Content"
      >
        <AboutMe />
      </main>
    </>
  );
}
