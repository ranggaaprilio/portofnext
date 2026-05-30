import type { IconType } from "react-icons";
import { FaGithub, FaInstagram, FaLinkedinIn, FaMedium } from "react-icons/fa";
import { SiThreads } from "react-icons/si";

const socialLinks: Array<{
  name: string;
  handle: string;
  href: string;
  description: string;
  Icon: IconType;
}> = [
  {
    name: "LinkedIn",
    handle: "ranggaaprilio",
    href: "https://www.linkedin.com/in/ranggaaprilio",
    description: "Connect with me professionally and explore my work history.",
    Icon: FaLinkedinIn,
  },
  {
    name: "Threads",
    handle: "@ranggaaprilio",
    href: "https://www.threads.com/@ranggaaprilio",
    description:
      "Follow my thoughts on tech, development, and product building.",
    Icon: SiThreads,
  },
  {
    name: "GitHub",
    handle: "ranggaaprilio",
    href: "https://github.com/ranggaaprilio",
    description: "See my code, open-source projects, and experiments.",
    Icon: FaGithub,
  },
  {
    name: "Instagram",
    handle: "@ranggaaprilio",
    href: "https://instagram.com/ranggaaprilio",
    description: "Follow behind-the-scenes moments and personal updates.",
    Icon: FaInstagram,
  },
  {
    name: "Medium",
    handle: "@ranggaaprillio",
    href: "https://medium.com/@ranggaaprillio",
    description: "Read my articles, tutorials, and development notes.",
    Icon: FaMedium,
  },
];

const Contact = () => {
  return (
    <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 py-28 text-center">
      <div
        className="pointer-events-none absolute inset-x-0 top-24 mx-auto h-72 max-w-3xl rounded-full bg-[var(--palette-2)]/20 blur-3xl"
        aria-hidden="true"
      />

      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[var(--palette-2)]">
        Contact
      </p>
      <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white md:text-6xl">
        Let&apos;s connect and build something great.
      </h1>
      <p className="mt-6 max-w-2xl text-base leading-8 text-gray-300 md:text-lg">
        You can reach me through these social channels. I&apos;m always open to
        discussing web development, collaboration, and new opportunities.
      </p>

      <div className="mt-14 grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {socialLinks.map(({ name, handle, href, description, Icon }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${name} profile`}
            className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-left shadow-2xl shadow-black/20 backdrop-blur transition duration-300 hover:-translate-y-2 hover:border-[var(--palette-2)]/70 hover:bg-white/[0.08]"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--palette-2)]/15 text-[var(--palette-2)] transition duration-300 group-hover:bg-[var(--palette-2)] group-hover:text-white">
              <Icon className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-semibold text-white">{name}</h2>
            <p className="mt-1 text-sm font-medium text-[var(--palette-2)]">
              {handle}
            </p>
            <p className="mt-4 text-sm leading-6 text-gray-400">
              {description}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
};

export default Contact;
