"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";

interface AnimatedEmojiProps {
  className?: string;
  width?: number;
  height?: number;
  emojiSrc: string;
  animationType?: "float" | "rotate" | "bounce" | "pulse" | "wiggle";
  duration?: number;
  delay?: number;
}

const AnimatedEmoji: React.FC<AnimatedEmojiProps> = ({
  className = "",
  width = 100,
  height = 100,
  emojiSrc,
  animationType = "float",
  duration = 2,
  delay = 0,
}) => {
  const getAnimationVariants = () => {
    switch (animationType) {
      case "float":
        return {
          animate: {
            y: [0, -20, 0],
            transition: {
              duration: duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: delay,
            },
          },
        };
      case "rotate":
        return {
          animate: {
            rotate: [0, 360],
            transition: {
              duration: duration,
              repeat: Infinity,
              ease: "linear",
              delay: delay,
            },
          },
        };
      case "bounce":
        return {
          animate: {
            y: [0, -30, 0],
            transition: {
              duration: duration,
              repeat: Infinity,
              ease: "easeOut",
              delay: delay,
            },
          },
        };
      case "pulse":
        return {
          animate: {
            scale: [1, 1.2, 1],
            transition: {
              duration: duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: delay,
            },
          },
        };
      case "wiggle":
        return {
          animate: {
            rotate: [0, 5, -5, 0],
            transition: {
              duration: duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: delay,
            },
          },
        };
      default:
        return {
          animate: {
            y: [0, -20, 0],
            transition: {
              duration: duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: delay,
            },
          },
        };
    }
  };

  return (
    <motion.div
      className={`inline-block ${className}`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: delay }}
    >
      <motion.div {...getAnimationVariants()}>
        <Image
          src={emojiSrc}
          alt="Animated emoji"
          width={width}
          height={height}
          className="object-contain"
          priority
        />
      </motion.div>
    </motion.div>
  );
};

export default AnimatedEmoji;
