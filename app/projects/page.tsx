import Background from "@/app/_components/background";
import Navbar from "@/app/_components/navbar/main";
import Projects from "@/app/_components/projects/main";
import type { Metadata } from "next";

const description =
  "An explorable arcade world of the things Rangga Aprilio Utama has built — every project is also listed as plain text below the game.";

export const metadata: Metadata = {
  title: "Projects | Rangga Aprilio Utama",
  description,
  alternates: { canonical: "/projects" },
  openGraph: {
    type: "website",
    url: "https://www.aprilio.dev/projects",
    title: "Projects | Rangga Aprilio Utama",
    description,
  },
};

export default function ProjectsPage() {
  return (
    <>
      <Navbar />
      <main className="relative min-h-screen">
        <Background />
        <Projects />
      </main>
    </>
  );
}
