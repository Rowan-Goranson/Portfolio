import type { Metadata } from "next";
import { Source_Serif_4, Geist_Mono } from "next/font/google";
import "../globals.css";

// Its own root layout — deliberately not the site's Nav / HeroBackground /
// footer. This route is a structural prototype, not a reskin of the main
// site, so it gets nothing from the main site's chrome.
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rowan Goranson — redesign",
  description: "Structural prototype homepage.",
};

export default function RedesignLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sourceSerif.variable} ${geistMono.variable} bg-[var(--paper)]`}>
      <body className="text-[var(--ink)] antialiased">{children}</body>
    </html>
  );
}
