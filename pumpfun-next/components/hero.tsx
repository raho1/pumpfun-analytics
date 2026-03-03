"use client";

import { useSolPrice } from "@/hooks/use-sol-price";

export function Hero() {
  const { sol } = useSolPrice();

  return (
    <div className="relative py-12 pb-10 -mx-4 overflow-hidden">
      {/* Background gradients */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 0%, rgba(124,58,237,0.12), transparent 70%),
            radial-gradient(ellipse 60% 50% at 80% 10%, rgba(6,182,212,0.08), transparent 70%),
            radial-gradient(ellipse 40% 30% at 50% 100%, rgba(239,68,68,0.05), transparent 60%)
          `,
          animation: "heroPulse 8s ease-in-out infinite alternate",
        }}
      />

      <div className="relative px-4">
        {/* Eyebrow */}
        <div className="animate-fade-in inline-flex items-center gap-2 text-[10px] font-bold tracking-[2.5px] uppercase text-purple-light bg-[rgba(124,58,237,0.08)] border border-[rgba(124,58,237,0.2)] px-3.5 py-1.5 rounded-full mb-5">
          <span
            className="w-1.5 h-1.5 rounded-full bg-green"
            style={{ boxShadow: "0 0 6px #22c55e", animation: "livePulse 2s infinite" }}
          />
          LIVE PROTOCOL INTELLIGENCE
        </div>

        {/* Title */}
        <h1
          className="animate-gradient text-[clamp(2rem,4.5vw,3.2rem)] font-black tracking-[-0.04em] leading-[1.1] mb-3 bg-clip-text text-transparent"
          style={{
            backgroundImage: "linear-gradient(135deg, #ffffff 0%, #a78bfa 50%, #06b6d4 100%)",
            animation: "gradientShift 6s ease infinite, fadeSlideIn 0.8s ease-out",
          }}
        >
          Pump.fun Analytics
        </h1>

        {/* Subtitle */}
        <p className="text-[0.95rem] text-[#6b6b88] max-w-[640px] leading-[1.7] animate-fade-in">
          Deep on-chain analysis of the{" "}
          <strong className="text-[#8888a0]">largest memecoin launchpad on Solana</strong>.
          Real-time data from decoded contract events, curated Dune spells, and external APIs.
        </p>

        {/* Pills */}
        <div
          className="flex gap-2.5 flex-wrap mt-5"
          style={{ animation: "fadeSlideIn 1.2s ease-out" }}
        >
          {[
            { label: "19", text: "DuneSQL queries" },
            { label: "5", text: "decoded tables" },
            { label: "3", text: "data sources" },
          ].map((p) => (
            <span
              key={p.text}
              className="text-[11px] font-semibold text-[#55556a] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] px-3 py-1.5 rounded-md font-mono"
            >
              <code className="text-purple-light bg-transparent p-0">{p.label}</code>{" "}
              {p.text}
            </span>
          ))}
          {["MEV detection", "PumpSwap AMM", "Project Ascend fees", "Buyback economics", "Fee optimization lab"].map(
            (pill) => (
              <span
                key={pill}
                className="text-[11px] font-semibold text-[#55556a] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] px-3 py-1.5 rounded-md font-mono"
              >
                {pill}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
