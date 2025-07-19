"use client";

import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { motion } from "framer-motion";

export function Skills() {
  // All skills in a single array
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

  return (
    <div className="w-full">
      <motion.h2
        className="text-3xl lg:text-4xl md:text-3xl font-bold mb-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Skills and Abilities
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <BentoGrid className="max-w-7xl mx-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr gap-8">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut",
              }}
            >
              <BentoGridItem
                title={skill.title}
                description={skill.description}
                header={
                  <div className="flex h-36 w-full items-center justify-center rounded-t-xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
                    <div className="p-4">{skill.icon}</div>
                  </div>
                }
                className="hover:scale-105 transition-all duration-300 ease-in-out h-full min-h-[300px]"
              />
            </motion.div>
          ))}
        </BentoGrid>
      </motion.div>
    </div>
  );
}
