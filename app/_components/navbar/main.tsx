"use client";

import { AnimatePresence, type Variants, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";

const GITHUB_URL = "https://github.com/ranggaaprilio";

type NavLink = {
  href: string;
  label: string;
  ariaLabel: string;
  target?: string;
};

const desktopLinks: NavLink[] = [
  { href: "/#about", label: "About", ariaLabel: "About section" },
  {
    href: "https://aprilio.hashnode.dev/",
    label: "Articles",
    ariaLabel: "Articles section",
    target: "_blank",
  },
  { href: "/#projects", label: "Projects", ariaLabel: "Projects section" },
  { href: "/devtools", label: "Devtools", ariaLabel: "Devtools" },
];

const mobileLinks: NavLink[] = [
  { href: "/#about", label: "About", ariaLabel: "About section" },
  {
    href: "https://medium.com/@ranggaaprillio",
    label: "Articles",
    ariaLabel: "Articles section",
    target: "_blank",
  },
  { href: "/#projects", label: "Projects", ariaLabel: "Projects section" },
  { href: "/devtools", label: "Devtools", ariaLabel: "Devtools" },
  { href: "/contact", label: "Contact", ariaLabel: "Contact page" },
];

const expoOut = [0.16, 1, 0.3, 1] as const;

const overlayVariants: Variants = {
  open: { opacity: 1, transition: { duration: 0.25, ease: expoOut } },
  closed: { opacity: 0, transition: { duration: 0.2, ease: expoOut } },
};

const listVariants: Variants = {
  open: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
  closed: {},
};

const itemVariants: Variants = {
  open: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: expoOut },
  },
  closed: { opacity: 0, y: 16 },
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 z-50 w-full transition-colors duration-300 ${
        isScrolled
          ? "bg-background/70 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
      aria-label="Main navigation"
    >
      <div className="relative z-50 flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-mono text-lg text-foreground"
          aria-label="Home"
        >
          aprilio.dev
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {desktopLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              aria-label={link.ariaLabel}
              target={link.target}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Profile"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <FaGithub className="h-5 w-5" />
          </a>
          <Link
            href="/contact"
            className="bg-primary text-primary-foreground rounded-full px-4 py-1.5 text-sm transition-colors hover:bg-primary/90"
            aria-label="Contact page"
          >
            Contact
          </Link>
        </div>

        {/* Hamburger Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="relative z-50 h-10 w-10 p-2 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <div className="absolute inset-0 m-auto flex w-6 transform flex-col items-center justify-center gap-1.5 transition-all duration-200">
            <span
              className={`block h-0.5 w-full bg-foreground transition-transform duration-200 ${
                isMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-full bg-foreground transition-opacity duration-200 ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-full bg-foreground transition-transform duration-200 ${
                isMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="mobile-menu"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur md:hidden"
          >
            <motion.ul
              variants={listVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="flex h-full flex-col items-center justify-center gap-8"
            >
              {mobileLinks.map((link) => (
                <motion.li key={link.href} variants={itemVariants}>
                  <Link
                    href={link.href}
                    className="font-display text-3xl text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={link.ariaLabel}
                    target={link.target}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
