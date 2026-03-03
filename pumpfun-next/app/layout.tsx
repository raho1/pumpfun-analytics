import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="https://pump.fun/favicon.ico" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
