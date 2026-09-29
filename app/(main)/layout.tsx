import type { Metadata } from "next";
import { Source_Serif_4, Geist_Mono } from "next/font/google";
import "../globals.css";
import Nav from "@/components/Nav";
import PageBackground from "@/components/HeroBackground";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sourceSerif.variable} ${geistMono.variable} h-full bg-[var(--paper)]`}>
      <body className="min-h-full flex flex-col text-[var(--ink)] antialiased">
        <PageBackground />
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="py-10 text-center text-xs text-[var(--ink-muted)] font-mono tracking-widest uppercase">
          Rowan Goranson — {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}
