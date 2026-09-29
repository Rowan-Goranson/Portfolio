import type { Metadata } from "next";
import { Source_Serif_4, Geist_Mono } from "next/font/google";
import "../globals.css";
import Header from "./Header";

// Its own root layout — the academic-paper style established in /redesign,
// not the old site's Nav / HeroBackground / footer.
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
  title: "Rowan Goranson",
  description: "Quantitative projects in prediction markets, statistical arbitrage, and econometric modeling.",
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sourceSerif.variable} ${geistMono.variable} bg-[var(--paper)]`}>
      <body className="text-[var(--ink)] antialiased">
        <Header />
        <main className="max-w-6xl mx-auto px-8 pb-24">{children}</main>
      </body>
    </html>
  );
}
