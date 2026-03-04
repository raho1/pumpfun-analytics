"use client";

import { SectionHeader } from "@/components/section-header";

const SECTIONS = [
  {
    tag: "PumpSwap AMM",
    title: "The DEX That Changed Everything",
    paragraphs: [
      "PumpSwap launched as Pump.fun's native AMM, replacing Raydium as the graduation destination for bonding curve tokens. Every token that graduates now automatically migrates to a PumpSwap pool with a 3-way fee split: LP providers, protocol, and coin creators.",
      "The migration rate is 100% — every graduated token flows to PumpSwap. This vertical integration captures post-graduation trading fees that previously leaked to Raydium. Combined with the sliding creator fee from Project Ascend, PumpSwap creates a continuous revenue stream from token creation through post-graduation trading.",
      "The liquidity model is key: PumpSwap pools start with the SOL from the bonding curve as initial liquidity. LP providers can deposit additional liquidity to earn fees. This creates a natural bootstrap mechanism that competitors lack — no cold-start liquidity problem.",
    ],
  },
  {
    tag: "The Super-App Pivot",
    title: "Beyond Memecoins",
    paragraphs: [
      "Pump.fun's mobile app (1.5M+ downloads) now supports tokens from Raydium, Meteora, and wrapped BTC/ETH. The strategy is clear: evolve from a memecoin launchpad into Solana's default trading interface.",
      "PumpSwap has hit $176.8B cumulative volume and reached 74% of Solana DEX volume at peak. By integrating multi-asset trading directly into the app, Pump.fun is positioning itself as the Robinhood of Solana \u2014 a one-stop shop for all token trading, not just launches.",
      "The key risk is execution. Expanding beyond memecoins means competing with established DEX aggregators like Jupiter, which has deeper liquidity and routing. But Pump.fun's distribution advantage (millions of mobile users) gives it a unique wedge.",
    ],
  },
  {
    tag: "Project Ascend",
    title: "Creator Fee Revolution",
    paragraphs: [
      "Project Ascend introduced sliding creator fees: 0.95% under $300K market cap, scaling down to 0.05% above $20M. This inverts the traditional extraction model \u2014 creators earn more on early, risky volume and less on established tokens.",
      "First-week payouts under the new model hit $15.5M, which was 183% more than the protocol's own take. This creator-aligned incentive structure is Pump.fun's answer to competitors like Believe (2.58% graduation rate) and LetsBonk.",
      "The Fee Optimization Lab in this dashboard models what alternative fee structures would look like. The data suggests that growth-optimized fees (lower rates on early-stage tokens) could increase launch volume by 15-20% while maintaining revenue.",
    ],
  },
  {
    tag: "The MEV Tax",
    title: "$30M+ in Bot Extraction",
    paragraphs: [
      "The notorious bot \"arsc\" extracted $30M+ in just 2 months via sandwich attacks on Pump.fun trades. The top 7 MEV bots hold 92.6% of the sandwich attack market share, creating a concentrated extraction layer.",
      "A $500M class-action lawsuit names Pump.fun, Jito Labs, and the Solana Foundation, alleging $4-5.5B in cumulative retail losses from MEV exploitation. This is the biggest legal challenge facing the Solana DeFi ecosystem.",
      "The MEV tab in this dashboard tracks sandwich detection, bot market share, and profit extraction in real time. Understanding the scale of this problem is essential for evaluating platform trust and user retention.",
    ],
  },
  {
    tag: "Buyback Machine",
    title: "$254M+ Token Buybacks",
    paragraphs: [
      "98%+ of Pump.fun's revenue now goes to PUMP token buybacks, reducing circulating supply by approximately 20%. This aggressive buyback program has been the primary narrative supporting the token price.",
      "However, the July 2026 unlock of 41% of total supply looms large. Founders acquired tokens at near-zero cost, creating a massive overhang. The tension between ongoing buybacks and the approaching unlock cliff is the key risk/reward dynamic for PUMP holders.",
      "The Revenue tab tracks daily fee generation and cumulative revenue. At current burn rates, the protocol needs to maintain $10M+/month in fees to keep the buyback narrative credible against the unlock pressure.",
    ],
  },
  {
    tag: "The 0.8% Club",
    title: "Graduation Funnel Analysis",
    paragraphs: [
      "Of roughly 30,000 daily token launches, only 0.8% graduate from the bonding curve (~240 tokens per day). 56% of all tokens die within 5 minutes of creation. 43.6% never reach even 1 SOL in reserves.",
      "Solidus Labs reports a 98.6% rug-pull rate \u2014 meaning 986 of every 1,000 tokens launched are effectively scams. This presents a fundamental trust problem for the platform, despite it being the primary driver of volume and fees.",
      "The Protocol Health tab visualizes the token survival funnel and bonding curve progression. Tokens that survive beyond 24 hours are in the top ~8% by longevity, making survival duration a meaningful quality signal for traders.",
    ],
  },
  {
    tag: "Competitive Landscape",
    title: "Market Share Wars",
    paragraphs: [
      "Pump.fun clawed back to 73-80% of Solana token launches after dropping to as low as 32% in July 2025. LetsBonk peaked at 65.9% daily share but couldn't sustain it. Believe achieves higher graduation quality but lower volume.",
      "Raydium launched LaunchLab as a direct response to PumpSwap eating into its DEX volume. The competitive dynamics are shifting from \"who has the most launches\" to \"who has the best trading experience and creator incentives.\"",
      "Pump.fun's moat is increasingly its mobile distribution and brand recognition rather than any technical advantage. The super-app pivot is a bet that mobile-first trading will be the winning strategy on Solana.",
    ],
  },
];

export function AnalysisTab() {
  return (
    <div>
      <SectionHeader
        title="Analysis"
        description="Deep-dive narratives on the key dynamics shaping the Pump.fun ecosystem. Based on on-chain data and public reporting."
      />

      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <div key={section.tag} className="insight-card">
            <div className="text-[0.65rem] font-semibold tracking-[1px] uppercase text-[#7c3aed] mb-2">
              {section.tag}
            </div>
            <h4 className="text-[1rem] font-semibold text-white mb-3">
              {section.title}
            </h4>
            <div className="space-y-2.5">
              {section.paragraphs.map((p, i) => (
                <p key={i} className="text-[0.82rem] text-[#7a7a94] leading-[1.65]">
                  {p}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
