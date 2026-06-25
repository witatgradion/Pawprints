import type { Metadata } from "next";
import { Nunito, Fredoka, Geist_Mono } from "next/font/google";
import "./globals.css";

// rounded, friendly body
const sansRounded = Nunito({
  variable: "--font-sans-rounded",
  subsets: ["latin"],
});

// playful rounded display for headings + logo
const displayRounded = Fredoka({
  variable: "--font-display-rounded",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pawprints — usability testing, qualified by numbers",
  description:
    "Paste a URL, record the right path, share a link. Learn exactly where real participants get lost — every insight backed by a number, a sample size, and a confidence level.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sansRounded.variable} ${displayRounded.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
