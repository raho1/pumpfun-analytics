"use client";

const INSIGHTS = [
  {
    tag: "Super-App Pivot",
    body: "Mobile app (1.5M+ downloads) now supports Raydium, Meteora, and wrapped BTC/ETH. PumpSwap hit $176.8B cumulative volume.",
  },
  {
    tag: "Project Ascend",
    body: "Sliding creator fees: 0.95% under $300K mcap, 0.05% above $20M. First-week payouts hit $15.5M \u2014 183% more than protocol take.",
  },
  {
    tag: "MEV Tax",
    body: "Top bot \"arsc\" extracted $30M+ in 2 months. Top 7 MEV bots hold 92.6% share. $500M class-action lawsuit pending.",
  },
  {
    tag: "Buyback Machine",
    body: "98%+ of revenue goes to PUMP buybacks, reducing supply ~20%. July 2026 unlock of 41% supply is the key risk.",
  },
  {
    tag: "The 0.8% Club",
    body: "Of ~30K daily launches, only 0.8% graduate. 56% die within 5 min. Solidus Labs reports a 98.6% rug-pull rate.",
  },
  {
    tag: "Market Share",
    body: "Pump.fun clawed back to 73\u201380% of Solana launches after dropping to 32%. LetsBonk peaked at 65.9% daily share.",
  },
];

export function ExecutiveBriefing() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-[0.95rem] font-semibold text-[#8888a0] tracking-[-0.01em]">
          Key Narratives
        </h3>
        <span className="flex-1 h-px bg-[rgba(255,255,255,0.04)]" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {INSIGHTS.map((insight) => (
          <div key={insight.tag} className="insight-card">
            <div className="text-[0.65rem] font-semibold tracking-[1px] uppercase text-[#7c3aed] mb-1.5">
              {insight.tag}
            </div>
            <p className="text-[0.78rem] text-[#6b6b88] leading-[1.55]">
              {insight.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
