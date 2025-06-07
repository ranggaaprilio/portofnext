"use client";

import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Badge } from "@/components/ui/badge";
import BlurText from "@/components/ui/blur-text";
import PixelTransition from "@/components/ui/pixel-transition";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect } from "react";
import {
  FaGithubSquare,
  FaInstagramSquare,
  FaLinkedinIn,
  FaTwitterSquare,
} from "react-icons/fa";
import { Project } from "./project";
import { Skills } from "./skill";

const AboutMe = () => {
  useEffect(() => {
    // Add JSON-LD Schema
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Rangga Aprilio Utama",
      jobTitle: "Fullstack Web Developer",
      description:
        "Experienced Fullstack Web Developer with 4 years of expertise in web development",
      image: "https://www.aprilio.dev/assets/aboutMe.png",
      url: "https://www.aprilio.dev",
      sameAs: [
        "https://www.linkedin.com/in/ranggaaprilio",
        "https://twitter.com/ranggaAprilio",
        "https://instagram.com/ranggaaprilio",
        "https://github.com/ranggaaprilio",
      ],
      alumniOf: [
        {
          "@type": "CollegeOrUniversity",
          name: "Universitas Nusa Mandiri",
          sameAs: "https://www.nusamandiri.ac.id",
        },
        {
          "@type": "CollegeOrUniversity",
          name: "Universitas Bina Sarana Infromatika",
          sameAs: "https://www.bsi.ac.id",
        },
      ],
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-4 justify-center items-center">
      <section
        className="grid grid-cols-1 md:grid-cols-2 p-4 "
        aria-label="About Me Section"
        id="about"
      >
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeIn",
          }}
        >
          <header className="relative pb-4">
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
          </header>
          <div className="mt-24 relative">
            <p className="leading-loose" itemProp="description">
              I am an experienced Fullstack Web Developer with 5 years of
              expertise in all stages of advanced web development. I possess a
              deep knowledge of user interface design, testing, and debugging
              processes. I bring forth a strong background in the design,
              installation, testing, and maintenance of web systems. My skill
              set is diverse and promising, including proficiency in HTML, CSS,
              JavaScript, PHP, Microsoft SQL Server, and MySQL. In addition, I
              have mastered modern technologies such as React, Vue, Node.js,
              TypeScript, Golang, Oracle, and Elasticsearch. I am capable of
              effectively self-managing during independent projects and thrive
              in collaborative team environments
            </p>
          </div>
          <section className="pt-10" aria-label="Education History">
            <h2 className="text-3xl lg:text-3xl md:text-2xl font-bold">
              EDUCATION
            </h2>
            <div
              className="grid grid-cols-1 mt-6 gap-6"
              itemScope
              itemType="https://schema.org/EducationalOrganization"
            >
              <div className="flex">
                <Image
                  src="/assets/unmLogo.png"
                  width={100}
                  height={100}
                  alt="Universitas Nusa Mandiri logo"
                  itemProp="logo"
                />
                <div className="pl-4 flex flex-col justify-center items-start gap-1">
                  <h3 className="text-xl font-bold" itemProp="name">
                    Universitas Nusa Mandiri
                  </h3>
                  <p className="text-sm" itemProp="programName">
                    S1 - Program Studi Sistem infromasi
                  </p>
                  <span>
                    IPK : <Badge>3.95 / 4.00</Badge>
                  </span>
                </div>
              </div>
              <div className="flex">
                <Image
                  src="/assets/bsiLogo.png"
                  width={100}
                  height={100}
                  alt="Universitas Bina Sarana Infromatika logo"
                  itemProp="logo"
                />
                <div className="pl-4 flex flex-col justify-center items-start gap-1">
                  <h3 className="text-xl font-bold" itemProp="name">
                    Universitas Bina Sarana Infromatika
                  </h3>
                  <p className="text-sm" itemProp="programName">
                    D3 - Program Studi Sistem infromasi
                  </p>
                  <span>
                    IPK : <Badge>3.94 / 4.00</Badge>
                  </span>
                </div>
              </div>
            </div>
          </section>
        </motion.div>
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "backInOut",
          }}
          className="flex justify-between items-center gap-4 flex-col pb-4 h-fit mt-4 md:mt-0"
        >
          <PixelTransition
            firstContent={
              <div className="flex justify-center items-center w-full h-full">
                <Image
                  src="/assets/aboutMe.png"
                  width={400}
                  height={400}
                  alt="Rangga Aprilio Utama's profile picture"
                  itemProp="image"
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
                  style={{
                    fontWeight: 900,
                    fontSize: "3rem",
                    color: "#ffffff",
                  }}
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

          <nav
            className="grid grid-cols-4 gap-4 my-14 w-full md:w-2/3"
            aria-label="Social Media Links"
          >
            <div>
              <BackgroundGradient className="rounded-[22px] p-4 sm:p-4 bg-white dark:bg-zinc-900">
                <a
                  href="https://linkedin.com/in/ranggaaprilio"
                  aria-label="LinkedIn Profile"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedinIn className="w-full text-5xl" />
                </a>
              </BackgroundGradient>
            </div>
            <div>
              <BackgroundGradient className="rounded-[22px] p-4 sm:p-4 bg-white dark:bg-zinc-900">
                <a
                  href="https://twitter.com/ranggaAprilio"
                  aria-label="Twitter Profile"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaTwitterSquare className="w-full text-5xl" />
                </a>
              </BackgroundGradient>
            </div>
            <div>
              <BackgroundGradient className="rounded-[22px] p-4 sm:p-4 bg-white dark:bg-zinc-900">
                <a
                  href="https://instagram.com/ranggaaprilio"
                  aria-label="Instagram Profile"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagramSquare className="w-full text-5xl" />
                </a>
              </BackgroundGradient>
            </div>
            <div>
              <BackgroundGradient className="rounded-[22px] p-4 sm:p-4 bg-white dark:bg-zinc-900">
                <a
                  href="https://github.com/ranggaaprilio"
                  aria-label="GitHub Profile"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaGithubSquare className="w-full text-5xl" />
                </a>
              </BackgroundGradient>
            </div>
          </nav>
        </motion.div>
      </section>
      <section
        className="grid grid-cols-1 p-4 "
        aria-label="Skills and Experience"
        id="skills"
      >
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="pt-8 pb-8 md:w-[calc(100vw-100px)]"
          aria-label="Work Experience"
        >
          <h2 className="text-3xl lg:text-3xl md:text-2xl font-bold">
            Work Experience
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 mt-6 gap-6 ">
            <motion.div
              initial={{ opacity: 0.0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeIn",
              }}
              className="flex p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl border-1 border-solid border-gray-400"
            >
              <Image
                src="/assets/hubexo.jpg"
                width={100}
                height={100}
                alt="Hubexo logo"
                itemProp="logo"
              />
              <div className="pl-6 flex flex-col justify-center items-start gap-3">
                <h3 className="text-md font-bold" itemProp="name">
                  <a
                    href="https://hubexo.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black transition-colors"
                  >
                    Hubexo
                  </a>
                </h3>
                <p
                  className="text-sm text-gray-600 dark:text-gray-400"
                  itemProp="jobTitle"
                >
                  Fullstack Developer
                </p>
                <span className="text-gray-400 dark:text-gray-400 dark:bg-gray-700">
                  2021 - Present
                </span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0.0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.5,
                duration: 0.8,
                ease: "easeIn",
              }}
              className="flex p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl border-1 border-solid border-gray-400"
            >
              <Image
                src="/assets/Aseanindo-logo.png"
                width={100}
                height={100}
                alt="aseanindo logo"
                itemProp="logo"
                className="object-contain bg-white px-2"
              />
              <div className="pl-4 flex flex-col justify-center items-start gap-1">
                <h3 className="text-md font-bold" itemProp="name">
                  <a
                    href="https://aseanindo.co.id/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black transition-colors"
                  >
                    PT. Aseanindo Network Solutions
                  </a>
                </h3>
                <p className="text-sm text-gray-600" itemProp="jobTitle">
                  Programmer
                </p>
                <span className="text-gray-400">2019-2021</span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0.0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.7,
                duration: 0.8,
                ease: "easeIn",
              }}
              className="flex p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl border-1 border-solid border-gray-400"
            >
              <Image
                src="/assets/bsiLogo.png"
                width={100}
                height={100}
                alt="BSI logo"
                itemProp="logo"
                className="bg-white"
              />
              <div className="pl-4 flex flex-col justify-center items-start gap-1">
                <h3 className="text-md font-bold" itemProp="name">
                  <a
                    href="https://www.bsi.ac.id/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black transition-colors"
                  >
                    Universitas Bina Sarana Infromatika
                  </a>
                </h3>
                <p className="text-sm text-gray-600" itemProp="jobTitle">
                  Assistant Lecturer
                </p>
                <span className="text-gray-400">2018-2019</span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0.0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.9,
                duration: 0.8,
                ease: "easeIn",
              }}
              className="flex p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl border-1 border-solid border-gray-400"
            >
              <Image
                src="/assets/xlaxiata.jpeg"
                width={100}
                height={100}
                alt="xl logo"
                itemProp="logo"
                className="bg-white px-2"
              />
              <div className="pl-4 flex flex-col justify-center items-start gap-1">
                <h3 className="text-md font-bold" itemProp="name">
                  <a
                    href="https://www.xlaxiata.co.id/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black transition-colors"
                  >
                    PT XL Axiata Tbk
                  </a>
                </h3>
                <p
                  className="text-sm text-gray-600 dark:text-gray-400"
                  itemProp="jobTitle"
                >
                  IT Suppot Internship
                </p>
                <span className="text-gray-400 dark:text-gray-300 dark:bg-gray-700">
                  2018
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="pt-8 pb-8 md:w-[calc(100vw-100px)]"
          aria-label="Skills"
        >
          <Skills />
        </motion.div>
      </section>
    </div>
  );
};

export default AboutMe;
