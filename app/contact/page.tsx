import Contact from "@/app/_components/contact/main";
import ContactForm from "@/app/_components/contact/form";
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
      <main className="relative min-h-screen overflow-hidden bg-background">
        <div
          className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(76,59,207,0.28),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.16),transparent_30%)]"
          aria-hidden="true"
        />
        <Contact />
        <ContactForm />
      </main>
    </>
  );
}
