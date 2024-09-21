import Image from "next/image";
import Hero from "@/app/_components/hero/main";
import {AuroraBackground} from "@/components/ui/aurora-background";
import {motion} from "framer-motion";
import {TypewriterEffectSmooth} from "@/components/ui/typewriter-effect";
import React from "react";
import Navbar from "@/app/_components/navbar/main";
import AboutMe from "@/app/_components/about/main";

export default function Home() {
  return (
    <main>
        <AuroraBackground className={"justify-start items-start"}>
            <Navbar />
            <Hero />
        </AuroraBackground>
       <div className="md:mx-8">
           <AboutMe />
       </div>
    </main>
  );
}
