"use client";

import { useDuneQuery } from "@/hooks/use-dune-query";
import { ChartCard } from "@/components/chart-card";
import { SectionHeader } from "@/components/section-header";
import { BarChartComponent } from "@/components/charts/bar-chart";
import { COLORS, CHART_COLORS } from "@/lib/colors";
import type { TokenSurvival, BondingCurve } from "@/lib/types";

export function ProtocolHealthTab() {
  const { data: survival, isLoading: l1 } = useDuneQuery<TokenSurvival[]>("token_survival");
  const { data: bonding, isLoading: l2 } = useDuneQuery<BondingCurve[]>("bonding_curve");

  return (
    <div>
      <SectionHeader
        title="Protocol Health"
        description="Solidus Labs reports 98.6% of launches are scams. Only 0.8% graduate. Understanding the token lifecycle funnel is critical for platform trust and retention."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Token Survival (Lifespan)" isLoading={l1}>
          {survival && survival.length > 0 && (
            <BarChartComponent
              data={survival}
              xKey="bucket"
              yKey="pct"
              horizontal
              isDate={false}
              colors={CHART_COLORS}
              yFormatter={(v) => `${v.toFixed(1)}%`}
            />
          )}
        </ChartCard>

        <ChartCard title="Bonding Curve Progress" isLoading={l2}>
          {bonding && bonding.length > 0 && (
            <BarChartComponent
              data={bonding}
              xKey="bucket"
              yKey="pct"
              isDate={false}
              colors={CHART_COLORS}
              yFormatter={(v) => `${v.toFixed(1)}%`}
            />
          )}
        </ChartCard>
      </div>

      {survival && survival.length > 0 && bonding && bonding.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div className="insight-card">
            <div className="text-[10px] font-bold tracking-[1.5px] uppercase text-purple mb-2">MORTALITY</div>
            <h4 className="text-[#e8e8f0] text-[0.95rem] font-semibold mb-1.5">Token Lifespan</h4>
            <p className="text-[#6b6b88] text-[0.8rem] leading-[1.6]">
              <strong className="text-purple-light">{survival[0]?.pct?.toFixed(0)}%</strong> of tokens die within 5 minutes.
              Only <strong className="text-purple-light">{survival[survival.length - 1]?.pct?.toFixed(1)}%</strong> survive beyond 3 days.
            </p>
          </div>
          <div className="insight-card">
            <div className="text-[10px] font-bold tracking-[1.5px] uppercase text-purple mb-2">BONDING CURVE</div>
            <h4 className="text-[#e8e8f0] text-[0.95rem] font-semibold mb-1.5">Reserve Distribution</h4>
            <p className="text-[#6b6b88] text-[0.8rem] leading-[1.6]">
              <strong className="text-purple-light">{bonding[0]?.pct?.toFixed(0)}%</strong> never reach 1 SOL in reserves.
              Only <strong className="text-purple-light">{bonding[bonding.length - 1]?.pct?.toFixed(1)}%</strong> graduate (79+ SOL).
            </p>
          </div>
          <div className="insight-card">
            <div className="text-[10px] font-bold tracking-[1.5px] uppercase text-purple mb-2">IMPLICATION</div>
            <h4 className="text-[#e8e8f0] text-[0.95rem] font-semibold mb-1.5">Quality Signal</h4>
            <p className="text-[#6b6b88] text-[0.8rem] leading-[1.6]">
              Tokens surviving 24+ hours are in the <strong className="text-purple-light">top ~8%</strong> by longevity,
              making survival a meaningful quality filter.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
