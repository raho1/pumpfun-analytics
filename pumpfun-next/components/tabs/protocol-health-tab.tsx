"use client";

import { useMemo } from "react";
import { useDuneQuery } from "@/hooks/use-dune-query";
import { ChartCard } from "@/components/chart-card";
import { SectionHeader } from "@/components/section-header";
import { BarChartComponent } from "@/components/charts/bar-chart";
import { CHART_COLORS } from "@/lib/colors";
import type { TokenSurvival, BondingCurve } from "@/lib/types";

export function ProtocolHealthTab() {
  const { data: survivalRaw, isLoading: l1 } = useDuneQuery<TokenSurvival[]>("token_survival");
  const { data: bondingRaw, isLoading: l2 } = useDuneQuery<BondingCurve[]>("bonding_curve");

  const survival = useMemo(() => {
    if (!survivalRaw) return undefined;
    return survivalRaw.map((r) => ({ ...r, pct: Number(r.pct), cnt: Number(r.cnt) }));
  }, [survivalRaw]);

  const bonding = useMemo(() => {
    if (!bondingRaw) return undefined;
    return bondingRaw.map((r) => ({ ...r, pct: Number(r.pct), cnt: Number(r.cnt) }));
  }, [bondingRaw]);

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
            <div className="text-[0.65rem] font-semibold tracking-[1px] uppercase text-[#7c3aed] mb-1.5">Mortality</div>
            <p className="text-[0.78rem] text-[#6b6b88] leading-[1.55]">
              <strong className="text-[#a78bfa]">{survival[0]?.pct?.toFixed(0)}%</strong> of tokens die within 5 minutes.
              Only <strong className="text-[#a78bfa]">{survival[survival.length - 1]?.pct?.toFixed(1)}%</strong> survive beyond 3 days.
            </p>
          </div>
          <div className="insight-card">
            <div className="text-[0.65rem] font-semibold tracking-[1px] uppercase text-[#7c3aed] mb-1.5">Bonding Curve</div>
            <p className="text-[0.78rem] text-[#6b6b88] leading-[1.55]">
              <strong className="text-[#a78bfa]">{bonding[0]?.pct?.toFixed(0)}%</strong> never reach 1 SOL in reserves.
              Only <strong className="text-[#a78bfa]">{bonding[bonding.length - 1]?.pct?.toFixed(1)}%</strong> graduate (79+ SOL).
            </p>
          </div>
          <div className="insight-card">
            <div className="text-[0.65rem] font-semibold tracking-[1px] uppercase text-[#7c3aed] mb-1.5">Implication</div>
            <p className="text-[0.78rem] text-[#6b6b88] leading-[1.55]">
              Tokens surviving 24+ hours are in the <strong className="text-[#a78bfa]">top ~8%</strong> by longevity,
              making survival a meaningful quality filter.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
