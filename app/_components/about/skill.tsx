"use client";

import { GlowingEffect } from "@/components/ui/glowing-effect";
import { motion } from "framer-motion";

export function Skills() {
  return (
    <>
      <h2 className="text-3xl lg:text-3xl md:text-2xl font-bold mb-4">
        Skills and Abilities
      </h2>
      <div className="mb-4 flex flex-col gap-4">
        <motion.ul
          className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2"
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
          <GridItem
            area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
            icon={<i className="ci-typescript h-[4rem] w-[4rem] block" />}
            title="TypeScript"
            description="TypeScript is a superset of JavaScript that adds static types, enabling better tooling and error checking."
          />

          <GridItem
            area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
            icon={<i className=" ci-golang-wordmark h-[4rem] w-[4rem] block" />}
            title="Golang"
            description="A statically typed, compiled programming language designed for simplicity and efficiency."
          />

          <GridItem
            area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
            icon={
              <i className="ci-nodejs-horizontal h-[10rem] w-[10rem] block" />
            }
            title="Node JS"
            description="run-time environment that executes JavaScript code outside a web browser."
          />

          <GridItem
            area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
            icon={
              <i className=" ci-postgresql-vertical h-[4rem] w-[4rem] block" />
            }
            title="PostgreSQL"
            description="An open-source relational database management system emphasizing extensibility and SQL compliance."
          />

          <GridItem
            area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
            icon={<i className=" ci-react  h-[4rem] w-[4rem] block" />}
            title="React JS"
            description="A JavaScript library for building user interfaces, React allows developers to create large web applications that can change data without reloading the page."
          />
        </motion.ul>
        <motion.ul
          className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2"
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
          <GridItem
            area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
            icon={<i className="ci-javascript h-[4rem] w-[4rem] block" />}
            title="JavaScript"
            description="Commonly used for web development, JavaScript is a versatile language that powers the interactive elements of websites."
          />

          <GridItem
            area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
            icon={<i className=" ci-vuejs h-[4rem] w-[4rem] block" />}
            title="Vue JS"
            description="A progressive framework for building user interfaces, Vue.js is designed to be incrementally adoptable."
          />

          <GridItem
            area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
            icon={<i className=" ci-php-wordmark h-[10rem] w-[10rem] block" />}
            title="PHP"
            description="A popular general-purpose scripting language that is especially suited to web development."
          />

          <GridItem
            area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
            icon={<i className=" ci-elasticsearch h-[4rem] w-[4rem] block" />}
            title="Elasticsearch"
            description="A distributed, RESTful search and analytics engine capable of addressing a growing number of use cases."
          />

          <GridItem
            area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
            icon={
              <i className=" ci-oracle-wordmark  h-[4rem] w-[4rem] block" />
            }
            title="Oracle DB"
            description="A multi-model database management system produced and marketed by Oracle Corporation."
          />
        </motion.ul>
        <motion.ul
          className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2"
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
          <GridItem
            area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
            icon={<i className="ci-redis-horizontal h-[6rem] w-[6rem] block" />}
            title="Redis"
            description="An open-source, in-memory data structure store, used as a database, cache, and message broker."
          />

          <GridItem
            area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
            icon={<i className=" ci-tailwindcss h-[4rem] w-[4rem] block" />}
            title="Tailwind CSS"
            description="A utility-first CSS framework for creating custom designs without having to leave your HTML."
          />

          <GridItem
            area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
            icon={<i className=" ci-python h-[10rem] w-[10rem] block" />}
            title="Python"
            description="A high-level, interpreted programming language known for its readability and versatility."
          />

          <GridItem
            area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
            icon={<i className="  ci-mysql h-[4rem] w-[4rem] block" />}
            title="MySQL"
            description="An open-source relational database management system based on SQL."
          />

          <GridItem
            area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
            icon={<i className=" ci-docker  h-[4rem] w-[4rem] block" />}
            title="Docker"
            description="A platform for developing, shipping, and running applications in containers."
          />
        </motion.ul>
        <motion.ul
          className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2"
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
          <GridItem
            area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
            icon={<i className="ci-socketio h-[5rem] w-[5rem] block" />}
            title="Socket IO"
            description="A JavaScript library for real-time web applications, enabling real-time, bidirectional communication between web clients and servers."
          />

          <GridItem
            area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
            icon={<i className=" ci-laravel h-[4rem] w-[4rem] block" />}
            title="Laravel"
            description="A PHP framework for web artisans, providing a clean and elegant syntax."
          />

          <GridItem
            area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
            icon={<i className=" ci-kafka h-[10rem] w-[10rem] block" />}
            title="Kafka"
            description="A distributed event streaming platform capable of handling trillions of events a day."
          />

          <GridItem
            area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
            icon={<i className="  ci-graphql h-[4rem] w-[4rem] block" />}
            title="GraphQL"
            description="A query language for APIs and a runtime for fulfilling those queries with your existing data."
          />

          <GridItem
            area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
            icon={
              <i className=" ci-microsoftsqlserver  h-[4rem] w-[4rem] block" />
            }
            title="MsSQL Server"
            description="A relational database management system developed by Microsoft."
          />
        </motion.ul>
      </div>
    </>
  );
}

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
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

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
  return (
    <motion.li
      className={`min-h-[14rem] list-none ${area}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={gridItemVariants}
    >
      <div className="relative h-full rounded-2.5xl border  p-2  md:rounded-3xl md:p-3">
        <GlowingEffect
          blur={0}
          borderWidth={3}
          spread={80}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-0.75 p-6  dark:shadow-[0px_0px_27px_0px_#2D2D2D] md:p-6">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit">{icon}</div>
            <div className="space-y-3">
              <h3 className="pt-0.5 text-xl/[1.375rem] font-semibold font-sans -tracking-4 md:text-2xl/[1.875rem] text-balance text-black dark:text-white">
                {title}
              </h3>
              <h2
                className="[&_b]:md:font-semibold [&_strong]:md:font-semibold font-sans text-sm/[1.125rem] 
              md:text-base/[1.375rem]  text-black dark:text-neutral-400"
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
