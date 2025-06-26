import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.aprilio.dev"),
  title: "Rangga Aprilio Utama | Fullstack Developer Portfolio",
  description:
    "Experienced Fullstack Developer with 6 years of expertise in web development, UI/UX design, and modern technologies like React, Vue, Node.js, TypeScript, and Golang.",
  keywords: [
    "Fullstack Developer",
    "Web Development",
    "React",
    "TypeScript",
    "Node.js",
    "Vue",
    "Golang",
    "UI/UX Design",
  ],
  authors: [{ name: "Rangga Aprilio Utama" }],
  creator: "Rangga Aprilio Utama",
  publisher: "Rangga Aprilio Utama",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.aprilio.dev",
    title: "Rangga Aprilio Utama | Fullstack Developer Portfolio",
    description:
      "Experienced Fullstack Developer with 4 years of expertise in web development, UI/UX design, and modern technologies.",
    siteName: "Rangga Aprilio Utama Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rangga Aprilio Utama | Fullstack Developer",
    description:
      "Experienced Fullstack Developer with 4 years of expertise in web development.",
    creator: "@ranggaAprilio",
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID, // You'll need to add your actual Google verification ID
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/dheereshagrwal/coloured-icons@1.9.0/src/app/ci.min.css"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
