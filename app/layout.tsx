import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portofolio",
  description: "Portofolio Rangga Aprilio Utama :Fullstack Developer berpengalaman. Portofolio ini menampilkan berbagai proyek web yang menggabungkan desain yang menarik dengan fungsionalitas yang kuat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
