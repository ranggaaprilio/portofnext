import Background from "@/app/_components/background";
import Contact from "@/app/_components/contact/main";
import Navbar from "@/app/_components/navbar/main";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Rangga Aprilio Utama",
  description:
    "Connect with Rangga Aprilio Utama on LinkedIn, Threads, GitHub, Instagram, and Medium.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-hidden">
        <Background />
        <Contact />
      </main>
    </>
  );
}
