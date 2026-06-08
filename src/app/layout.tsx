import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { PriceTicker } from "@/components/layout/price-ticker";
import { Footer } from "@/components/layout/footer";
import { AIAssistant } from "@/components/assistant/ai-assistant";
import { GridBackground } from "@/components/animations/motion-components";
import "./globals.css";
import "@/styles/custom.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: {
    default: "QuantumVest | Premium Crypto Investment Platform",
    template: "%s | QuantumVest",
  },
  description:
    "Navigate the decentralized frontier with precision engineering. Advanced yield strategies and institutional-grade security for the next generation of investors.",
  keywords: [
    "crypto investment",
    "wealth management",
    "DeFi",
    "portfolio",
    "yield",
  ],
  openGraph: {
    title: "QuantumVest | Premium Crypto Investment Platform",
    description: "Institutional-grade crypto investment infrastructure",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} font-sans`}>
        <GridBackground />
        <PriceTicker />
        <Navbar />
        <main className="relative z-10 min-h-screen pt-[7.5rem]">{children}</main>
        <Footer />
        <AIAssistant />
      </body>
    </html>
  );
}
