"use client";

import { useEffect, useState } from "react";
import { WARP_MS, onWarp } from "./warp";

const FLASH_MS = 450;

/**
 * Full-screen light burst over the page at the end of the jump, so the route
 * change to /projects happens behind it instead of as a hard cut.
 */
const WarpFlash = () => {
  const [active, setActive] = useState(false);

  useEffect(() => onWarp(() => setActive(true)), []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] bg-[radial-gradient(circle_at_center,#ede9fe_0%,#a78bfa_18%,#0a0a0a_70%)] transition-opacity ease-in"
      style={{
        opacity: active ? 1 : 0,
        transitionDuration: `${FLASH_MS}ms`,
        transitionDelay: active ? `${WARP_MS - FLASH_MS}ms` : "0ms",
      }}
    />
  );
};

export default WarpFlash;
