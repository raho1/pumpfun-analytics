import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pump.fun Protocol Analytics",
  description:
    "Deep on-chain analysis of the largest memecoin launchpad on Solana. Real-time data from decoded contract events, curated Dune spells, and external APIs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" href="https://pump.fun/favicon.ico" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
