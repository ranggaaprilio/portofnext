"use client";

import Link from "next/link";
import { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav
      className="w-full z-50 bg-opacity-90 backdrop-blur-sm fixed top-0 md:static"
      aria-label="Main navigation"
    >
      <div className="px-6 py-4 flex gap-4 items-center justify-between z-50">
        <Link
          href="/"
          className="text-xl font-bold hover:text-[var(--palette-2)] transition-colors z-50"
          aria-label="Home"
        >
          PORTOFOLIO
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6">
          <Link
            href="#about"
            className="hover:text-[var(--palette-2)] transition-all duration-200 transform hover:scale-105"
            aria-label="About section"
          >
            About
          </Link>
          <Link
            href="https://medium.com/@ranggaaprillio"
            className="hover:text-[var(--palette-2)] transition-all duration-200 hover:scale-105"
            aria-label="Articles section"
            target="_blank"
          >
            Articles
          </Link>
          <Link
            href="#projects"
            className="hover:text-[var(--palette-2)] transition-colors hover:scale-105"
            aria-label="Projects section"
          >
            Projects
          </Link>
          <Link
            href="#contact"
            className="hover:text-[var(--palette-2)] transition-colors hover:scale-105"
            aria-label="Contact section"
          >
            Contact
          </Link>
        </div>

        {/* Hamburger Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden relative w-10 h-10 p-2 z-50"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <div className="absolute w-6 inset-0 m-auto transform transition-all duration-200 flex flex-col gap-1.5 justify-center items-center">
            <span
              className={`block w-full h-0.5 bg-[var(--palette-1)] transition-transform duration-200 ${
                isMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block w-full h-0.5 bg-[var(--palette-1)] transition-opacity duration-200 ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-full h-0.5 bg-[var(--palette-1)] transition-transform duration-200 ${
                isMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-x-0 top-[88px] bg-[var(--palette-1)] bg-opacity-80 backdrop-blur-md transition-all duration-300 ease-in-out ${
          isMenuOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
        <div className="flex flex-col items-center py-8 gap-6 text-[var(--palette-4)]">
          <Link
            href="#about"
            className="hover:text-[var(--palette-2)] transition-colors"
            aria-label="About section"
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="https://medium.com/@ranggaaprillio"
            className="hover:text-[var(--palette-2)] transition-colors"
            aria-label="Articles section"
            target="_blank"
            onClick={() => setIsMenuOpen(false)}
          >
            Articles
          </Link>
          <Link
            href="#projects"
            className="hover:text-[var(--palette-2)] transition-colors"
            aria-label="Projects section"
            onClick={() => setIsMenuOpen(false)}
          >
            Projects
          </Link>
          <Link
            href="#contact"
            className="hover:text-[var(--palette-2)] transition-colors"
            aria-label="Contact section"
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
