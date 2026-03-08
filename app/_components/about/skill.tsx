"use client";

import LogoLoop from "@/components/LogoLoop";
import { motion } from "framer-motion";

export function Skills() {
  const skills = [
    { node: <i className="ci-typescript h-12 w-12 block text-4xl" /> },
    { node: <i className="ci-golang-wordmark h-12 w-12 block text-4xl" /> },
    { node: <i className="ci-nodejs-horizontal h-12 w-12 block text-4xl" /> },
    { node: <i className="ci-postgresql-vertical h-12 w-12 block text-4xl" /> },
    { node: <i className="ci-react h-12 w-12 block text-4xl" /> },
    { node: <i className="ci-javascript h-12 w-12 block text-4xl" /> },
    { node: <i className="ci-vuejs h-12 w-12 block text-4xl" /> },
    { node: <i className="ci-php-wordmark h-12 w-12 block text-4xl" /> },
    { node: <i className="ci-elasticsearch h-12 w-12 block text-4xl" /> },
    { node: <i className="ci-oracle-wordmark h-12 w-12 block text-4xl" /> },
    { node: <i className="ci-redis-horizontal h-12 w-12 block text-4xl" /> },
    { node: <i className="ci-tailwindcss h-12 w-12 block text-4xl" /> },
    { node: <i className="ci-python h-12 w-12 block text-4xl" /> },
    { node: <i className="ci-mysql h-12 w-12 block text-4xl" /> },
    { node: <i className="ci-docker h-12 w-12 block text-4xl" /> },
    { node: <i className="ci-socketio h-12 w-12 block text-4xl" /> },
    { node: <i className="ci-laravel h-12 w-12 block text-4xl" /> },
    { node: <i className="ci-kafka h-12 w-12 block text-4xl" /> },
    { node: <i className="ci-graphql h-12 w-12 block text-4xl" /> },
    { node: <i className="ci-microsoftsqlserver h-12 w-12 block text-4xl" /> },
  ];

  return (
    <div className="w-full mb-6 md:mb-0 overflow-hidden">
      <motion.h2
        className="text-3xl lg:text-4xl md:text-3xl font-bold mb-8 "
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
        className="w-full overflow-hidden"
      >
        <LogoLoop
          // @ts-expect-error - LogoLoop component from react-bits
          logos={skills}
          direction="left"
          speed={80}
          gap={80}
          logoHeight={48}
          pauseOnHover={true}
          fadeOut={false}
          fadeOutColor="hsl(222.2, 84%, 4.9%)"
          className="py-4"
        />
      </motion.div>
    </div>
  );
}
