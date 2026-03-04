"use client";

import { useDuneQuery } from "@/hooks/use-dune-query";
import { useSolPrice } from "@/hooks/use-sol-price";
import { ChartCard } from "@/components/chart-card";
import { SectionHeader } from "@/components/section-header";
import { ComboChartComponent } from "@/components/charts/combo-chart";
import { StackedBarChartComponent } from "@/components/charts/stacked-bar-chart";
import { BarChartComponent } from "@/components/charts/bar-chart";
import { COLORS, STAGE_COLORS } from "@/lib/colors";
import { formatCompact } from "@/lib/utils";
import type { FeeVsSurvival, FeeCurveGranular } from "@/lib/types";

export function FeeAnalyticsTab() {
  const { data: feeVsSurv, isLoading: l2 } = useDuneQuery<FeeVsSurvival[]>("fee_vs_survival");
  const { data: feeCurve, isLoading: l3 } = useDuneQuery<FeeCurveGranular[]>("fee_curve_granular");

  return (
    <div>
      <SectionHeader
        title="Fee Deep Dive"
        description="Granular analysis of how fee structures affect token behavior and protocol revenue."
      />

      <ChartCard title="Current Fee Landscape: Creator Fee % vs Reserve Level" isLoading={l3}>
        {feeCurve && feeCurve.length > 0 && (
          <ComboChartComponent
            data={feeCurve}
            xKey="reserve_bucket_sol"
            barKey="volume_sol"
            barName="Volume (SOL)"
            barColor="rgba(124,58,237,0.15)"
            lineKey="avg_creator_fee_pct"
            lineName="Avg Creator Fee %"
            lineColor={COLORS.cyan}
            isDate={false}
            barYFormatter={(v) => formatCompact(v)}
            lineYFormatter={(v) => `${v.toFixed(3)}%`}
            height={380}
          />
        )}
      </ChartCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <ChartCard title="Token Lifespan by Creator Fee Tier" isLoading={l2}>
          {feeVsSurv && feeVsSurv.length > 0 && (
            <StackedBarChartComponent
              data={feeVsSurv}
              xKey="fee_tier"
              series={[
                { key: "median_lifespan_min", name: "Median", color: COLORS.purple },
                { key: "avg_lifespan_min", name: "Mean", color: COLORS.cyan },
              ]}
              grouped
              isDate={false}
              yFormatter={(v) => `${formatCompact(v)} min`}
            />
          )}
        </ChartCard>

        <ChartCard title="Avg Volume by Creator Fee Tier" isLoading={l2}>
          {feeVsSurv && feeVsSurv.length > 0 && (
            <BarChartComponent
              data={feeVsSurv}
              xKey="fee_tier"
              yKey="avg_volume_sol"
              color={COLORS.purple}
              gradient
              isDate={false}
              yFormatter={(v) => `${v.toFixed(1)} SOL`}
            />
          )}
        </ChartCard>
      </div>
    </div>
  );
}
