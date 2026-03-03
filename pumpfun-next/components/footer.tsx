"use client";

import { QUERY_IDS } from "@/lib/queries";

export function Footer() {
  const now = new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC";

  return (
    <div className="text-center py-10 border-t border-[rgba(255,255,255,0.04)] mt-10">
      <p className="text-[#44445a] text-[0.8rem]">
        Built by <strong className="text-[#8888a0]">Ryan Holloway</strong> · Powered by{" "}
        <a href="https://dune.com" target="_blank" className="text-purple no-underline hover:text-purple-light">
          Dune Analytics
        </a>{" "}
        · CoinGecko · DeFiLlama
      </p>
      <p className="text-[0.7rem] text-[#33334a] mt-1">
        {now} · {Object.keys(QUERY_IDS).length} DuneSQL queries · Decoded events · Real-time
      </p>
      <div className="flex gap-2 justify-center flex-wrap mt-3">
        {["Next.js", "Recharts", "DuneSQL", "CoinGecko API", "DeFiLlama API", "TypeScript", "Tailwind CSS"].map(
          (tech) => (
            <span
              key={tech}
              className="text-[10px] font-semibold text-[#55556a] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] px-2.5 py-1 rounded font-mono"
            >
              {tech}
            </span>
          )
        )}
      </div>
    </div>
  );
}
