"use client";

import { Badge } from "@/components/ui/badge";
import { type Variants, motion } from "framer-motion";
import Image from "next/image";
import type { IconType } from "react-icons";
import { FaGithubSquare, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { SiThreads } from "react-icons/si";
import { Skills } from "./skill";

const expoOut = [0.16, 1, 0.3, 1] as const;

const sectionVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: expoOut },
  },
};

const personJsonLd = {
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
    "https://www.threads.com/@ranggaaprilio",
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
};

const education = [
  {
    logo: "/assets/unmLogo.png",
    logoAlt: "Universitas Nusa Mandiri logo",
    name: "Universitas Nusa Mandiri",
    program: "S1 - Program Studi Sistem infromasi",
    gpa: "3.95 / 4.00",
  },
  {
    logo: "/assets/bsiLogo.png",
    logoAlt: "Universitas Bina Sarana Infromatika logo",
    name: "Universitas Bina Sarana Infromatika",
    program: "D3 - Program Studi Sistem infromasi",
    gpa: "3.91 / 4.00",
  },
];

const experience = [
  {
    logo: "/assets/hubexo.jpg",
    logoAlt: "Hubexo logo",
    logoClassName: "rounded-lg",
    name: "Hubexo",
    href: "https://hubexo.com",
    role: "Fullstack Developer",
    period: "2021 - Present",
  },
  {
    logo: "/assets/Aseanindo-logo.png",
    logoAlt: "aseanindo logo",
    logoClassName: "object-contain bg-white rounded-lg p-1",
    name: "PT. Aseanindo",
    href: "https://aseanindo.co.id/",
    role: "Programmer",
    period: "2019-2021",
  },
  {
    logo: "/assets/bsiLogo.png",
    logoAlt: "BSI logo",
    logoClassName: "bg-white rounded-lg",
    name: "Universitas Bina Sarana",
    href: "https://www.bsi.ac.id/",
    role: "Assistant Lecturer",
    period: "2018-2019",
  },
  {
    logo: "/assets/xlaxiata.jpeg",
    logoAlt: "xl logo",
    logoClassName: "bg-white rounded-lg p-1",
    name: "PT XL Axiata Tbk",
    href: "https://www.xlaxiata.co.id/",
    role: "IT Support Internship",
    period: "2018",
  },
];

const socials: Array<{ href: string; label: string; Icon: IconType }> = [
  {
    href: "https://linkedin.com/in/ranggaaprilio",
    label: "LinkedIn Profile",
    Icon: FaLinkedinIn,
  },
  {
    href: "https://www.threads.com/@ranggaaprilio",
    label: "Threads Profile",
    Icon: SiThreads,
  },
  {
    href: "https://instagram.com/ranggaaprilio",
    label: "Instagram Profile",
    Icon: FaInstagram,
  },
  {
    href: "https://github.com/ranggaaprilio",
    label: "GitHub Profile",
    Icon: FaGithubSquare,
  },
];

const SectionHeader = ({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) => (
  <>
    <motion.p
      variants={revealVariants}
      className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground"
    >
      {eyebrow}
    </motion.p>
    <motion.h2
      variants={revealVariants}
      className="mt-3 font-display text-4xl md:text-5xl tracking-[-0.02em]"
    >
      {title}
    </motion.h2>
  </>
);

const AboutMe = () => {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-6">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD serialized from a static object, no user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

      {/* About */}
      <motion.section
        id="about"
        aria-label="About Me Section"
        className="scroll-mt-20 py-24"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <SectionHeader eyebrow="01 — About" title="About Me" />

        <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Bio + education */}
          <div>
            <motion.p
              variants={revealVariants}
              className="text-base md:text-lg leading-relaxed text-muted-foreground"
              itemProp="description"
            >
              I am an experienced Fullstack Web Developer with 6 years of
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
            </motion.p>

            <motion.section
              variants={revealVariants}
              className="pt-12"
              aria-label="Education History"
            >
              <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Education
              </h3>
              <div
                className="mt-6 grid grid-cols-1 gap-6"
                itemScope
                itemType="https://schema.org/EducationalOrganization"
              >
                {education.map((entry) => (
                  <div key={entry.name} className="flex">
                    <Image
                      src={entry.logo}
                      width={100}
                      height={100}
                      alt={entry.logoAlt}
                      itemProp="logo"
                    />
                    <div className="flex flex-col items-start justify-center gap-1 pl-4">
                      <h4 className="text-xl font-bold" itemProp="name">
                        {entry.name}
                      </h4>
                      <p
                        className="text-sm text-muted-foreground"
                        itemProp="programName"
                      >
                        {entry.program}
                      </p>
                      <span className="text-sm text-muted-foreground">
                        IPK : <Badge>{entry.gpa}</Badge>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Portrait + socials */}
          <motion.div
            variants={revealVariants}
            className="flex h-fit flex-col items-center gap-8"
          >
            <div className="rounded-2xl border border-border bg-card p-2">
              <Image
                src="/assets/aboutMe.png"
                width={400}
                height={400}
                alt="Rangga Aprilio Utama's profile picture"
                itemProp="image"
                className="rounded-xl"
              />
            </div>

            <nav className="flex gap-4" aria-label="Social Media Links">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={href}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </nav>
          </motion.div>
        </div>
      </motion.section>

      {/* Work experience */}
      <motion.section
        aria-label="Work Experience"
        className="py-24"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <SectionHeader eyebrow="02 — Experience" title="Work Experience" />

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {experience.map((job) => (
            <motion.div
              key={job.name}
              variants={revealVariants}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex">
                <Image
                  src={job.logo}
                  width={80}
                  height={80}
                  alt={job.logoAlt}
                  itemProp="logo"
                  className={job.logoClassName}
                />
                <div className="flex flex-col items-start justify-center gap-2 pl-4">
                  <h3 className="text-md font-bold" itemProp="name">
                    <a
                      href={job.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-brand"
                    >
                      {job.name}
                    </a>
                  </h3>
                  <p
                    className="text-sm text-muted-foreground"
                    itemProp="jobTitle"
                  >
                    {job.role}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {job.period}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Skills */}
      <motion.section
        id="skills"
        aria-label="Skills and Experience"
        className="scroll-mt-20 py-24"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <SectionHeader eyebrow="03 — Skills" title="Skills and Abilities" />
        <div className="mt-12">
          <Skills />
        </div>
      </motion.section>
    </div>
  );
};

export default AboutMe;
