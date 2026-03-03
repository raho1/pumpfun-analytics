"use client";

import { useMemo } from "react";
import { useDuneQuery } from "@/hooks/use-dune-query";
import { ChartCard } from "@/components/chart-card";
import { SectionHeader } from "@/components/section-header";
import { BarChartComponent } from "@/components/charts/bar-chart";
import { AreaChartComponent } from "@/components/charts/area-chart";
import { StackedBarChartComponent } from "@/components/charts/stacked-bar-chart";
import { MultiAreaChartComponent } from "@/components/charts/multi-area-chart";
import { COLORS } from "@/lib/colors";
import { formatCompact, formatPercent } from "@/lib/utils";
import type { DailyLaunches, DailyVolume, GraduationRate, NewVsReturning } from "@/lib/types";

export function OverviewTab() {
  const { data: launches, isLoading: loadingLaunches } = useDuneQuery<DailyLaunches[]>("daily_launches");
  const { data: volume, isLoading: loadingVolume } = useDuneQuery<DailyVolume[]>("daily_volume");
  const { data: gradRateRaw, isLoading: loadingGrad } = useDuneQuery<GraduationRate[]>("graduation_rate");
  const { data: newRet, isLoading: loadingNR } = useDuneQuery<NewVsReturning[]>("new_vs_returning");

  const gradRate = useMemo(() => {
    if (!gradRateRaw) return undefined;
    return gradRateRaw.map((r) => ({ ...r, grad_rate: Number(r.grad_rate) }));
  }, [gradRateRaw]);

  return (
    <div>
      <SectionHeader
        title="Core Activity"
        description="11.9M+ tokens launched since Jan 2024. Revenue declined 75% YoY but Pump.fun maintains 73-80% of Solana launches. The mobile app (1.5M+ downloads) is expanding to multi-asset trading."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Daily Token Launches" isLoading={loadingLaunches}>
          {launches && launches.length > 0 && (
            <BarChartComponent
              data={launches}
              xKey="day"
              yKey="launches"
              color={COLORS.purple}
              gradient
              yFormatter={(v) => formatCompact(v)}
            />
          )}
        </ChartCard>

        <ChartCard title="Daily Unique Traders" isLoading={loadingVolume}>
          {volume && volume.length > 0 && (
            <AreaChartComponent
              data={volume}
              xKey="day"
              yKey="unique_traders"
              color={COLORS.cyan}
              yFormatter={(v) => formatCompact(v)}
            />
          )}
        </ChartCard>

        <ChartCard title="Graduation Rate (%)" isLoading={loadingGrad}>
          {gradRate && gradRate.length > 0 && (
            <AreaChartComponent
              data={gradRate}
              xKey="day"
              yKey="grad_rate"
              color={COLORS.yellow}
              yFormatter={(v) => formatPercent(v, 2)}
            />
          )}
        </ChartCard>

        <ChartCard title="Buy vs Sell Volume (SOL)" isLoading={loadingVolume}>
          {volume && volume.length > 0 && (
            <StackedBarChartComponent
              data={volume}
              xKey="day"
              series={[
                { key: "buy_vol", name: "Buy", color: COLORS.green },
                { key: "sell_vol", name: "Sell", color: COLORS.red },
              ]}
              yFormatter={(v) => formatCompact(v)}
            />
          )}
        </ChartCard>
      </div>

      <div className="mt-4">
        <ChartCard title="New vs Returning Traders" isLoading={loadingNR}>
          {newRet && newRet.length > 0 && (
            <MultiAreaChartComponent
              data={newRet}
              xKey="day"
              series={[
                { key: "new_traders", name: "New", color: COLORS.purple },
                { key: "returning_traders", name: "Returning", color: COLORS.cyan },
              ]}
              stacked
              yFormatter={(v) => formatCompact(v)}
            />
          )}
        </ChartCard>
      </div>
    </div>
  );
}
