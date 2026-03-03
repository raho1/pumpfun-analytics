"use client";

const INSIGHTS = [
  {
    tag: "THE SUPER-APP PIVOT",
    title: "Beyond Memecoins",
    body: 'Pump.fun\'s mobile app (1.5M+ downloads) now supports tokens from Raydium, Meteora, and wrapped BTC/ETH. The strategy: evolve from launchpad to <strong>Solana\'s default trading interface</strong>. PumpSwap hit <strong>$176.8B cumulative volume</strong> and 74% of Solana DEX volume at peak.',
  },
  {
    tag: "PROJECT ASCEND",
    title: "Creator Fee Revolution",
    body: 'New sliding fees: <strong>0.95% under $300K mcap, 0.05% above $20M</strong>. First-week payouts hit $15.5M -- 183% more than the protocol\'s own take. The shift from extraction to <strong>creator-aligned incentives</strong> is Pump.fun\'s answer to competitors like Believe (2.58% grad rate) and LetsBonk.',
  },
  {
    tag: "THE MEV TAX",
    title: "$30M+ Bot Extraction",
    body: 'The notorious bot "arsc" extracted <strong>$30M+ in 2 months</strong> via sandwich attacks. Top 7 MEV bots hold 92.6% market share. A <strong>$500M class-action lawsuit</strong> names Pump.fun, Jito Labs, and Solana Foundation, alleging $4-5.5B in retail losses.',
  },
  {
    tag: "BUYBACK MACHINE",
    title: "$254M+ Token Buybacks",
    body: "<strong>98%+ of revenue</strong> goes to PUMP token buybacks, reducing circulating supply by ~20%. But the <strong>July 2026 unlock of 41% supply</strong> looms -- founders acquired tokens at near-zero cost. The buyback narrative vs. unlock cliff is the key tension.",
  },
  {
    tag: "THE 0.8% CLUB",
    title: "Graduation Funnel",
    body: 'Of ~30K daily launches, only <strong>0.8% graduate</strong> (~240 tokens). 56% die within 5 minutes. 43.6% never reach 1 SOL in reserves. Solidus Labs reports a <strong>98.6% rug-pull rate</strong> -- 986 of every 1,000 tokens are scams.',
  },
  {
    tag: "COMPETITIVE LANDSCAPE",
    title: "Market Share Wars",
    body: "Pump.fun clawed back to <strong>73-80% of Solana launches</strong> after dropping to 32% in July 2025. LetsBonk peaked at 65.9% daily share; Believe achieves higher graduation quality. Raydium launched LaunchLab in response to PumpSwap eating its volume.",
  },
];

export function ExecutiveBriefing() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2.5 text-[1.3rem] font-extrabold tracking-[-0.03em] text-[#e8e8f0] mb-0.5">
        Executive Briefing
        <span className="flex-1 h-px bg-gradient-to-r from-[rgba(124,58,237,0.3)] to-transparent" />
      </div>
      <p className="text-[0.85rem] text-[#55556a] mb-5">
        Key narratives driving the Pump.fun ecosystem right now.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {INSIGHTS.slice(0, 3).map((insight) => (
          <InsightCard key={insight.tag} {...insight} />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
        {INSIGHTS.slice(3).map((insight) => (
          <InsightCard key={insight.tag} {...insight} />
        ))}
      </div>
    </div>
  );
}

function InsightCard({ tag, title, body }: { tag: string; title: string; body: string }) {
  return (
    <div className="insight-card">
      <div className="text-[10px] font-bold tracking-[1.5px] uppercase text-purple mb-2">
        {tag}
      </div>
      <h4 className="text-[#e8e8f0] text-[0.95rem] font-semibold mb-1.5">{title}</h4>
      <p
        className="text-[#6b6b88] text-[0.8rem] leading-[1.6] [&_strong]:text-purple-light"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </div>
  );
}
