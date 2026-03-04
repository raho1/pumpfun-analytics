"use client";

import { useMemo } from "react";
import { useDuneQuery } from "@/hooks/use-dune-query";
import { ChartCard } from "@/components/chart-card";
import { SectionHeader } from "@/components/section-header";
import { BarChartComponent } from "@/components/charts/bar-chart";
import { AreaChartComponent } from "@/components/charts/area-chart";
import { DonutChartComponent } from "@/components/charts/donut-chart";
import { DataTable } from "@/components/charts/data-table";
import { COLORS, CHART_COLORS } from "@/lib/colors";
import { formatCompact } from "@/lib/utils";
import type { SandwichDetection, BotActivity, MEVBotStrategy } from "@/lib/types";

export function MEVTab() {
  const { data: sandwich, isLoading: l1 } = useDuneQuery<SandwichDetection[]>("sandwich_detection");
  const { data: bots, isLoading: l2 } = useDuneQuery<BotActivity[]>("bot_activity");
  const { data: botStrategies, isLoading: l3 } = useDuneQuery<MEVBotStrategy[]>("mev_bot_strategy");

  const topBots = useMemo(() => {
    if (!bots || bots.length === 0) return [];
    const agg: Record<string, { bot: string; vol: number; trades: number }> = {};
    for (const row of bots) {
      if (!agg[row.bot]) agg[row.bot] = { bot: row.bot, vol: 0, trades: 0 };
      agg[row.bot].vol += row.vol_usd || 0;
      agg[row.bot].trades += row.trades || 0;
    }
    return Object.values(agg)
      .sort((a, b) => b.vol - a.vol)
      .slice(0, 8);
  }, [bots]);

  const strategyBreakdown = useMemo(() => {
    if (!botStrategies || botStrategies.length === 0) return [];
    const agg: Record<string, number> = {};
    for (const b of botStrategies) {
      const s = b.strategy || "Other";
      agg[s] = (agg[s] || 0) + Number(b.volume_usd || 0);
    }
    return Object.entries(agg).map(([name, value]) => ({ name, value }));
  }, [botStrategies]);

  const sandwichTotals = useMemo(() => {
    if (!sandwich || sandwich.length === 0) return null;
    return {
      total: sandwich.reduce((s, r) => s + (r.attacks || 0), 0),
      avgDaily: sandwich.reduce((s, r) => s + (r.attacks || 0), 0) / sandwich.length,
      peakBots: Math.max(...sandwich.map((r) => r.bots || 0)),
    };
  }, [sandwich]);

  return (
    <div>
      <SectionHeader
        title="MEV & Sandwich Analysis"
        description='Sandwich attack detection using spellbook-derived logic adapted for Solana. A $500M class-action lawsuit names MEV practices as central to $4-5.5B in alleged retail losses. Top 7 bots control 92.6% of MEV extraction.'
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Daily Sandwich Attacks" isLoading={l1}>
          {sandwich && sandwich.length > 0 && (
            <BarChartComponent
              data={sandwich}
              xKey="day"
              yKey="attacks"
              color={COLORS.red}
              gradient
              yFormatter={(v) => formatCompact(v)}
            />
          )}
        </ChartCard>

        <ChartCard title="Unique MEV Bots" isLoading={l1}>
          {sandwich && sandwich.length > 0 && (
            <AreaChartComponent
              data={sandwich}
              xKey="day"
              yKey="bots"
              color={COLORS.orange}
            />
          )}
        </ChartCard>
      </div>

      {sandwichTotals && (
        <div className="grid grid-cols-3 gap-3 my-4">
          <div className="kpi-card">
            <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">Total Attacks</div>
            <div className="text-lg font-bold text-white">{sandwichTotals.total.toLocaleString()}</div>
          </div>
          <div className="kpi-card">
            <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">Avg Daily Attacks</div>
            <div className="text-lg font-bold text-white">{sandwichTotals.avgDaily.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
          <div className="kpi-card">
            <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">Peak Bots (single day)</div>
            <div className="text-lg font-bold text-white">{sandwichTotals.peakBots.toLocaleString()}</div>
          </div>
        </div>
      )}

      <ChartCard title="Bot Trading Activity" isLoading={l2}>
        {topBots.length > 0 && (
          <BarChartComponent
            data={topBots}
            xKey="bot"
            yKey="vol"
            isDate={false}
            color={COLORS.purple}
            gradient
            yFormatter={(v) => `$${formatCompact(v)}`}
          />
        )}
      </ChartCard>

      {/* Bot Strategy Classification */}
      <div className="mt-6">
        <SectionHeader
          title="Bot Strategy Classification"
          description="Bots classified by trading behavior: Sandwich/HFT (high frequency, many tokens), Snipers (mostly buys), Arbitrage (balanced buy/sell), Whale/Copy-Trade (large positions, few tokens)."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard title="Volume by Bot Strategy" isLoading={l3}>
            {strategyBreakdown.length > 0 && (
              <DonutChartComponent
                data={strategyBreakdown}
                colors={CHART_COLORS}
                valueFormatter={(v) => `$${formatCompact(v)}`}
              />
            )}
          </ChartCard>

          <ChartCard title="Bot Strategy Detail" isLoading={l3}>
            {botStrategies && botStrategies.length > 0 && (
              <DataTable
                data={botStrategies.slice(0, 15)}
                columns={[
                  { key: "bot", label: "Bot", format: "address" },
                  { key: "strategy", label: "Strategy" },
                  { key: "volume_usd", label: "Volume (USD)", format: "usd", align: "right" },
                  { key: "trades", label: "Trades", format: "number", align: "right" },
                  { key: "unique_tokens", label: "Tokens", format: "number", align: "right" },
                ]}
              />
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
