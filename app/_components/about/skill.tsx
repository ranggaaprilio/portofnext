"use client";

import { GlowingEffect } from "@/components/ui/glowing-effect";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function Skills() {
  // All skills in a single array for masonry layout
  const skills = [
    {
      icon: <i className="ci-typescript h-[4rem] w-[4rem] block" />,
      title: "TypeScript",
      description:
        "TypeScript is a superset of JavaScript that adds static types, enabling better tooling and error checking.",
    },
    {
      icon: <i className=" ci-golang-wordmark h-[4rem] w-[4rem] block" />,
      title: "Golang",
      description:
        "A statically typed, compiled programming language designed for simplicity and efficiency.",
    },
    {
      icon: <i className="ci-nodejs-horizontal h-[4rem] w-[4rem] block" />,
      title: "Node JS",
      description:
        "run-time environment that executes JavaScript code outside a web browser.",
    },
    {
      icon: <i className=" ci-postgresql-vertical h-[4rem] w-[4rem] block" />,
      title: "PostgreSQL",
      description:
        "An open-source relational database management system emphasizing extensibility and SQL compliance.",
    },
    {
      icon: <i className=" ci-react  h-[4rem] w-[4rem] block" />,
      title: "React JS",
      description:
        "A JavaScript library for building user interfaces, React allows developers to create large web applications that can change data without reloading the page.",
    },
    {
      icon: <i className="ci-javascript h-[4rem] w-[4rem] block" />,
      title: "JavaScript",
      description:
        "Commonly used for web development, JavaScript is a versatile language that powers the interactive elements of websites.",
    },
    {
      icon: <i className=" ci-vuejs h-[4rem] w-[4rem] block" />,
      title: "Vue JS",
      description:
        "A progressive framework for building user interfaces, Vue.js is designed to be incrementally adoptable.",
    },
    {
      icon: <i className=" ci-php-wordmark h-[4rem] w-[4rem] block" />,
      title: "PHP",
      description:
        "A popular general-purpose scripting language that is especially suited to web development.",
    },
    {
      icon: <i className=" ci-elasticsearch h-[4rem] w-[4rem] block" />,
      title: "Elasticsearch",
      description:
        "A distributed, RESTful search and analytics engine capable of addressing a growing number of use cases.",
    },
    {
      icon: <i className=" ci-oracle-wordmark  h-[4rem] w-[4rem] block" />,
      title: "Oracle DB",
      description:
        "A multi-model database management system produced and marketed by Oracle Corporation.",
    },
    {
      icon: <i className="ci-redis-horizontal h-[4rem] w-[4rem] block" />,
      title: "Redis",
      description:
        "An open-source, in-memory data structure store, used as a database, cache, and message broker.",
    },
    {
      icon: <i className=" ci-tailwindcss h-[4rem] w-[4rem] block" />,
      title: "Tailwind CSS",
      description:
        "A utility-first CSS framework for creating custom designs without having to leave your HTML.",
    },
    {
      icon: <i className=" ci-python h-[4rem] w-[4rem] block" />,
      title: "Python",
      description:
        "A high-level, interpreted programming language known for its readability and versatility.",
    },
    {
      icon: <i className="  ci-mysql h-[4rem] w-[4rem] block" />,
      title: "MySQL",
      description:
        "An open-source relational database management system based on SQL.",
    },
    {
      icon: <i className=" ci-docker  h-[4rem] w-[4rem] block" />,
      title: "Docker",
      description:
        "A platform for developing, shipping, and running applications in containers.",
    },
    {
      icon: <i className="ci-socketio h-[5rem] w-[5rem] block" />,
      title: "Socket IO",
      description:
        "A JavaScript library for real-time web applications, enabling real-time, bidirectional communication between web clients and servers.",
    },
    {
      icon: <i className=" ci-laravel h-[4rem] w-[4rem] block" />,
      title: "Laravel",
      description:
        "A PHP framework for web artisans, providing a clean and elegant syntax.",
    },
    {
      icon: <i className=" ci-kafka h-[4rem] w-[4rem] block" />,
      title: "Kafka",
      description:
        "A distributed event streaming platform capable of handling trillions of events a day.",
    },
    {
      icon: <i className="  ci-graphql h-[4rem] w-[4rem] block" />,
      title: "GraphQL",
      description:
        "A query language for APIs and a runtime for fulfilling those queries with your existing data.",
    },
    {
      icon: <i className=" ci-microsoftsqlserver  h-[4rem] w-[4rem] block" />,
      title: "MsSQL Server",
      description:
        "A relational database management system developed by Microsoft.",
    },
  ];


  // Responsive columns: 1 (xs), 2 (sm), 3 (md), 4 (lg), 5 (xl), 7 (2xl+)
  const getColumns = () => {
    if (typeof window === 'undefined') return 1;
    const width = window.innerWidth;
    if (width < 640) return 1; // xs
    if (width < 768) return 2; // sm
    if (width < 1024) return 3; // md
    if (width < 1280) return 5; // lg
    if (width < 1536) return 7; // xl
    return 9; // 2xl+
  };

  const [columns, setColumns] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setColumns(getColumns());
    const handleResize = () => setColumns(getColumns());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  if (!mounted) return null;

  const masonry: Array<typeof skills> = Array.from({ length: columns }, () => []);
  skills.forEach((skill, i) => {
    masonry[i % columns].push(skill);
  });

  return (
    <>
      <h2 className="text-3xl lg:text-3xl md:text-2xl font-bold mb-4">
        Skills and Abilities
      </h2>
      <div className="w-full flex flex-col md:flex-row items-start md:gap-1">
        {masonry.map((col, colIdx) => (
          <motion.ul
            key={colIdx}
            className={`flex flex-col w-full md:w-auto md:flex-1 space-y-3 md:space-y-1 ${colIdx !== masonry.length - 1 ? 'md:mr-1' : ''}`}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {col.map((skill, idx) => {
              const sizeOptions = [
                'min-h-[11rem] max-w-[13rem] p-1.5',
                'min-h-[13rem] max-w-[13rem] p-2',
                'min-h-[15rem] max-w-[13rem] p-2.5',
              ];

              // Generate random icon sizes for desktop (2rem to 6rem)
              const iconSizeOptions = ['4', '6'];
              let hash = 0;
              for (let i = 0; i < skill.title.length; i++) {
                hash = skill.title.charCodeAt(i) + ((hash << 5) - hash);
              }
              const randomIconSize = iconSizeOptions[Math.abs(hash) % iconSizeOptions.length];


              // Clone the icon with responsive sizing
              const iconWithResponsiveSize = skill.icon && typeof skill.icon === 'object' && 'props' in skill.icon
                ? {
                    ...skill.icon,
                    props: {
                      ...skill.icon.props,
                      className: skill.icon.props.className.replace(/h-\[[^\]]+\]|w-\[[^\]]+\]/g, '') + ` h-[${randomIconSize}rem] w-[${randomIconSize}rem]`
                    }
                  }
                : skill.icon;
              
              // On mobile use full width, on desktop use random size
              const mobileSizeClass = 'w-[100vw] min-h-[15rem] max-w-none p-3 -ml-4 sm:-ml-0 md:w-auto md:max-w-[13rem]';
              const desktopSizeClass = sizeOptions[Math.abs(hash) % sizeOptions.length];
              // Add consistent bottom margin on mobile, smaller on desktop
              const cardMargin = '';
              return (
                <GridItem
                  key={skill.title}
                  area=""
                  icon={iconWithResponsiveSize}
                  title={skill.title}
                  description={skill.description}
                  sizeClass={`${cardMargin} ${mobileSizeClass.replace(desktopSizeClass.split(' ').slice(0, 2).join(' '), '')} md:${desktopSizeClass}`}
                />
              );
            })}
          </motion.ul>
        ))}
      </div>
    </>
  );
}
// ...existing code...

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  sizeClass?: string;
}

const gridItemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const GridItem = ({ area, icon, title, description, sizeClass }: GridItemProps) => {
  return (
    <motion.li
      className={`list-none ${area} ${sizeClass ?? 'min-h-[11rem] max-w-[13rem] p-1.5'} w-full`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={gridItemVariants}
    >
      <div className="relative h-full rounded-2xl border md:rounded-2xl">
        <GlowingEffect
          blur={0}
          borderWidth={2}
          spread={60}
          glow={true}
          disabled={false}
          proximity={48}
          inactiveZone={0.01}
        />
        <div className="relative flex h-full flex-col justify-between gap-3 overflow-hidden rounded-lg border-0.75 p-3 dark:shadow-[0px_0px_18px_0px_#2D2D2D] md:p-3">
          <div className="relative flex flex-1 flex-col justify-between gap-2">
            <div className="w-fit">{icon}</div>
            <div className="space-y-2">
              <h3 className="pt-0.5 text-base/[1.2rem] font-semibold font-sans -tracking-4 md:text-lg/[1.5rem] text-balance text-black dark:text-white">
                {title}
              </h3>
              <h2
                className="[&_b]:md:font-semibold [&_strong]:md:font-semibold font-sans text-xs/[1rem] md:text-sm/[1.125rem] text-black dark:text-neutral-400"
              >
                {description}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </motion.li>
  );
};
