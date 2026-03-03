"use client";

import { useMemo } from "react";
import { useDuneQuery } from "@/hooks/use-dune-query";
import { ChartCard } from "@/components/chart-card";
import { SectionHeader } from "@/components/section-header";
import { MultiLineChartComponent } from "@/components/charts/multi-line-chart";
import { DonutChartComponent } from "@/components/charts/donut-chart";
import { MultiAreaChartComponent } from "@/components/charts/multi-area-chart";
import { ComboChartComponent } from "@/components/charts/combo-chart";
import { COLORS } from "@/lib/colors";
import { formatCompact } from "@/lib/utils";
import type { DailyVolume, TradeSizeDist, PriceImpact, HourlyPattern } from "@/lib/types";

export function TradingTab() {
  const { data: volume, isLoading: l1 } = useDuneQuery<DailyVolume[]>("daily_volume");
  const { data: tradeSizeDist, isLoading: l2 } = useDuneQuery<TradeSizeDist[]>("trade_size_dist");
  const { data: priceImpact, isLoading: l3 } = useDuneQuery<PriceImpact[]>("price_impact");
  const { data: hourlyPattern, isLoading: l4 } = useDuneQuery<HourlyPattern[]>("hourly_pattern");

  const volumeWithMA = useMemo(() => {
    if (!volume || volume.length === 0) return [];
    const sorted = [...volume].sort((a, b) => a.day.localeCompare(b.day));
    return sorted.map((row, i) => {
      const slice7 = sorted.slice(Math.max(0, i - 6), i + 1);
      const slice30 = sorted.slice(Math.max(0, i - 29), i + 1);
      return {
        ...row,
        ma7: slice7.reduce((s, r) => s + (r.volume_sol || 0), 0) / slice7.length,
        ma30: slice30.reduce((s, r) => s + (r.volume_sol || 0), 0) / slice30.length,
      };
    });
  }, [volume]);

  const pieData = useMemo(() => {
    if (!tradeSizeDist) return [];
    return tradeSizeDist.map((d) => ({ name: d.bucket, value: d.pct_vol }));
  }, [tradeSizeDist]);

  return (
    <div>
      <SectionHeader
        title="Trading Dynamics"
        description="PumpSwap hit $176.8B cumulative volume and 74% Solana DEX share at peak. Volume correlates tightly with SOL price -- tracking price impact and slippage reveals the true cost of trading on thin bonding curves."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Volume + Moving Averages" isLoading={l1}>
          {volumeWithMA.length > 0 && (
            <MultiLineChartComponent
              data={volumeWithMA}
              xKey="day"
              series={[
                { key: "volume_sol", name: "Daily", color: "rgba(255,255,255,0.15)" },
                { key: "ma7", name: "7d MA", color: COLORS.purple },
                { key: "ma30", name: "30d MA", color: COLORS.orange, dash: "5 5" },
              ]}
              yFormatter={(v) => formatCompact(v)}
            />
          )}
        </ChartCard>

        <ChartCard title="Trade Size Distribution (7d)" isLoading={l2}>
          {pieData.length > 0 && (
            <DonutChartComponent
              data={pieData}
              valueFormatter={(v) => `${v.toFixed(1)}%`}
            />
          )}
        </ChartCard>

        <ChartCard title="Price Impact (Slippage)" isLoading={l3}>
          {priceImpact && priceImpact.length > 0 && (
            <MultiAreaChartComponent
              data={priceImpact}
              xKey="day"
              series={[
                { key: "p99", name: "P99", color: COLORS.red },
                { key: "p95", name: "P95", color: COLORS.yellow },
                { key: "med", name: "Median", color: COLORS.green },
              ]}
              yFormatter={(v) => `${v.toFixed(1)}%`}
            />
          )}
        </ChartCard>

        <ChartCard title="Intraday Trading Pattern (UTC)" isLoading={l4}>
          {hourlyPattern && hourlyPattern.length > 0 && (
            <ComboChartComponent
              data={hourlyPattern}
              xKey="hr"
              barKey="vol"
              barName="Volume"
              barColor={COLORS.purple}
              lineKey="traders"
              lineName="Traders"
              lineColor={COLORS.cyan}
              isDate={false}
              barYFormatter={(v) => formatCompact(v)}
              lineYFormatter={(v) => formatCompact(v)}
            />
          )}
        </ChartCard>
      </div>
    </div>
  );
}
