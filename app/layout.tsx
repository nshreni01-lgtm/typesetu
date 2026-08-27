import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Without an explicitly loaded Devanagari face the passage falls back to
// whatever the OS provides (Mangal / Nirmala UI on Windows, something else on
// Android), so the same passage would look different per device and matra
// positioning could not be judged reliably.
const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari", "latin"],
});

export const metadata: Metadata = {
  title: "TypeSetu — Typing Exam Practice",
  description:
    "Practice and mock tests for Indian government typing exams: CPCT, SSC CHSL/CGL, RRB NTPC, UPSSSC and High Court tests.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${notoDevanagari.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
