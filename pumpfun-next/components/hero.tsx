"use client";

import { useSolPrice } from "@/hooks/use-sol-price";

export function Hero() {
  const { sol } = useSolPrice();

  return (
    <div className="relative pt-10 pb-6 -mx-4 overflow-hidden">
      {/* Subtle background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 50% 40% at 25% -10%, rgba(124,58,237,0.07), transparent 70%),
            radial-gradient(ellipse 35% 35% at 75% 0%, rgba(6,182,212,0.04), transparent 60%)
          `,
        }}
      />

      <div className="relative px-4 flex items-start justify-between gap-6">
        <div className="min-w-0">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 text-[10px] font-medium tracking-[1.5px] uppercase text-[#6b6b88] mb-3">
            <span
              className="w-1.5 h-1.5 rounded-full bg-green flex-shrink-0"
              style={{ boxShadow: "0 0 6px #22c55e", animation: "livePulse 2s infinite" }}
            />
            Live Analytics
            <span className="text-[#33334a] mx-0.5">|</span>
            <span className="text-[#44445a] normal-case tracking-normal">
              Refreshes every 5 min
            </span>
          </div>

          {/* Title */}
          <h1 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold tracking-[-0.03em] leading-[1.15] mb-2 text-white">
            Pump.fun Protocol
          </h1>

          {/* Subtitle */}
          <p className="text-[0.85rem] text-[var(--color-text-muted)] max-w-[480px] leading-[1.6]">
            On-chain intelligence for the largest memecoin launchpad on Solana.
          </p>
        </div>

        {/* SOL Price — right aligned */}
        {sol.price && (
          <div className="hidden sm:flex items-center gap-3 flex-shrink-0 mt-6 px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.05)]">
            <span className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider">SOL</span>
            <span className="text-[1.05rem] font-bold text-white font-mono">
              ${sol.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
            {sol.change_24h != null && (
              <span
                className="text-[0.7rem] font-semibold font-mono"
                style={{ color: sol.change_24h >= 0 ? "#22c55e" : "#ef4444" }}
              >
                {sol.change_24h >= 0 ? "\u2191" : "\u2193"} {Math.abs(sol.change_24h).toFixed(1)}%
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
