"use client";
import { cn } from "@/lib/utils";
import React from "react";

export const Meteors = ({
  number,
  className,
}: {
  number?: number;
  className?: string;
}) => {
  const meteors = new Array(number || 20).fill(true);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {meteors.map((el, idx) => (
        <span
          key={"meteor" + idx}
          className={cn(
            "animate-meteor-effect absolute h-0.5 w-0.5 rotate-[45deg] rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10]",
            "before:absolute before:top-1/2 before:h-[1px] before:w-[50px] before:-translate-y-[50%] before:transform before:bg-gradient-to-r before:from-[#64748b] before:to-transparent before:content-['']",
            className,
          )}
          style={{
            top: Math.floor(Math.random() * 40) + "%",
            left: Math.floor(Math.random() * 100) + "%",
            animationDelay: Math.random() * 3 + "s",
            animationDuration: Math.floor(Math.random() * (6 - 3) + 3) + "s",
          }}
        />
      ))}
    </div>
  );
};
