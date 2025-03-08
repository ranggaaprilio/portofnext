"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import {
  FaLinkedinIn,
  FaTwitterSquare,
  FaInstagramSquare,
  FaGithubSquare,
} from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import BlurText from "@/components/ui/blur-text";
import PixelTransition from "@/components/ui/pixel-transition";

const AboutMe = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 p-4 h-[100vh]">
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeIn",
        }}
      >
        <div className="relative pb-4">
          <h1 className="absolute font-bold text-[4vw] text-gray-300 text-wrap">
            ABOUT ME
          </h1>
          <BlurText
            text="You Want To Know Me?"
            delay={150}
            animateBy="words"
            direction="top"
            className="absolute text-3xl lg:text-3xl md:text-2xl left-5 top-11 font-bold"
          />
        </div>
        <div className="mt-24 relative">
          <p className={"leading-loose"}>
            I am an experienced Fullstack Web Developer with 4 years of
            expertise in all stages of advanced web development. I possess a
            deep knowledge of user interface design, testing, and debugging
            processes. I bring forth a strong background in the design,
            installation, testing, and maintenance of web systems. My skill set
            is diverse and promising, including proficiency in HTML, CSS,
            JavaScript, PHP, Microsoft SQL Server, and MySQL. In addition, I
            have mastered modern technologies such as React, Vue, Node.js,
            TypeScript, Golang, Oracle, and Elasticsearch. I am capable of
            effectively self-managing during independent projects and thrive in
            collaborative team environments
          </p>
        </div>
        <div className={"pt-10"}>
          <span className={"text-3xl lg:text-3xl md:text-2xl font-bold"}>
            EDUCATION
          </span>
          <div className={"grid grid-cols-1 mt-6 gap-6"}>
            <div className={"flex"}>
              <Image
                src="/assets/unmLogo.png"
                width={100}
                height={100}
                alt="Picture of the author"
              />
              <div
                className={
                  "pl-4 flex flex-col justify-center items-start gap-1"
                }
              >
                <h1 className={"text-xl font-bold"}>
                  Universitas Nusa Mandiri
                </h1>
                <p className={"text-sm"}>S1 - Program Studi Sistem infromasi</p>
                <span>
                  IPK : <Badge>3.95 / 4.00</Badge>
                </span>
              </div>
            </div>
            <div className={"flex"}>
              <Image
                src="/assets/bsiLogo.png"
                width={100}
                height={100}
                alt="Picture of the author"
              />
              <div
                className={
                  "pl-4 flex flex-col justify-center items-start gap-1"
                }
              >
                <h1 className={"text-xl font-bold"}>
                  Universitas Bina Sarana Infromatika
                </h1>
                <p className={"text-sm"}>D3 - Program Studi Sistem infromasi</p>
                <span>
                  IPK : <Badge>3.94 / 4.00</Badge>
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "backInOut",
        }}
        className={
          "flex justify-between items-center gap-4 flex-col pb-4 h-fit"
        }
      >
        <PixelTransition
          firstContent={
            <div className="flex justify-center items-center w-full h-full">
              <Image
                src="/assets/aboutMe.png"
                width={400}
                height={400}
                alt="Picture of the author"
              />
            </div>
          }
          secondContent={
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "grid",
                placeItems: "center",
                backgroundColor: "#111",
                padding: "2rem",
              }}
            >
              <p
                style={{ fontWeight: 900, fontSize: "3rem", color: "#ffffff" }}
              >
                "Talk is cheap. Show me the code" - Linus Torvalds.
              </p>
            </div>
          }
          gridSize={12}
          pixelColor="#ffffff"
          animationStepDuration={0.4}
          className="w-[600px] h-[600px] bg-transparent"
        />

        <div className={"grid grid-cols-4 gap-4 my-14  w-full md:w-2/3"}>
          <div>
            <BackgroundGradient className="rounded-[22px]  p-4 sm:p-4 bg-white dark:bg-zinc-900">
              <FaLinkedinIn className="w-full text-5xl" />
            </BackgroundGradient>
          </div>
          <div>
            <BackgroundGradient className="rounded-[22px]  p-4 sm:p-4 bg-white dark:bg-zinc-900">
              <FaTwitterSquare className=" w-full text-5xl" />
            </BackgroundGradient>
          </div>
          <div>
            <BackgroundGradient className="rounded-[22px]  p-4 sm:p-4 bg-white dark:bg-zinc-900">
              <FaInstagramSquare className="w-full text-5xl" />
            </BackgroundGradient>
          </div>
          <div>
            <BackgroundGradient className="rounded-[22px]  p-4 sm:p-4 bg-white dark:bg-zinc-900">
              <FaGithubSquare className="w-full text-5xl" />
            </BackgroundGradient>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutMe;
