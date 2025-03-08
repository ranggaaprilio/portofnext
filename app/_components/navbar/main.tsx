"use client";

import Link from "next/link";

const Navbar = () => {
  return (
    <nav
      className="w-full z-50 bg-opacity-90 backdrop-blur-sm"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="m-8 flex gap-4 items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold hover:text-[var(--palette-2)] transition-colors"
          aria-label="Home"
        >
          PORTOFOLIO
        </Link>
        <div className="hidden md:flex gap-6">
          <Link
            href="#about"
            className="hover:text-[var(--palette-2)] transition-colors"
            aria-label="About section"
          >
            About
          </Link>
          <Link
            href="#projects"
            className="hover:text-[var(--palette-2)] transition-colors"
            aria-label="Projects section"
          >
            Projects
          </Link>
          <Link
            href="#contact"
            className="hover:text-[var(--palette-2)] transition-colors"
            aria-label="Contact section"
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
