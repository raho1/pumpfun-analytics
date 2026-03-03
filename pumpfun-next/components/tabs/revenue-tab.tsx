"use client";

import { useMemo } from "react";
import { useDuneQuery } from "@/hooks/use-dune-query";
import { useSolPrice } from "@/hooks/use-sol-price";
import { ChartCard } from "@/components/chart-card";
import { SectionHeader } from "@/components/section-header";
import { StackedBarChartComponent } from "@/components/charts/stacked-bar-chart";
import { AreaChartComponent } from "@/components/charts/area-chart";
import { DataTable } from "@/components/charts/data-table";
import { COLORS } from "@/lib/colors";
import { formatCompact, formatSOL, formatUSD } from "@/lib/utils";
import type { FeeRevenue } from "@/lib/types";

export function RevenueTab() {
  const { data: feeData, isLoading: l1 } = useDuneQuery<FeeRevenue[]>("fee_revenue");
  const { data: creators, isLoading: l2 } = useDuneQuery<Record<string, unknown>[]>("creator_leaderboard");
  const { sol } = useSolPrice();

  const cumData = useMemo(() => {
    if (!feeData || feeData.length === 0 || !sol.price) return [];
    let cum = 0;
    return feeData.map((row) => {
      cum += (row.total_fees || 0) * sol.price;
      return { ...row, cum_usd: cum };
    });
  }, [feeData, sol.price]);

  const totals = useMemo(() => {
    if (!feeData || feeData.length === 0) return null;
    const sp = sol.price || 1;
    const tp = feeData.reduce((s, r) => s + (r.protocol_fees || 0), 0);
    const tc = feeData.reduce((s, r) => s + (r.creator_fees || 0), 0);
    return {
      protocolSOL: tp,
      creatorSOL: tc,
      totalSOL: tp + tc,
      avgDaily: feeData.reduce((s, r) => s + (r.total_fees || 0), 0) / feeData.length,
      protocolUSD: tp * sp,
      creatorUSD: tc * sp,
    };
  }, [feeData, sol.price]);

  return (
    <div>
      <SectionHeader
        title="Revenue & Fees"
        description="$935M+ cumulative revenue. Project Ascend shifted to sliding creator fees (0.05-0.95%). 98%+ of revenue now funds PUMP token buybacks ($254M+ bought back)."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Daily Fee Revenue (SOL)" isLoading={l1}>
          {feeData && feeData.length > 0 && (
            <StackedBarChartComponent
              data={feeData}
              xKey="day"
              series={[
                { key: "protocol_fees", name: "Protocol (1%)", color: COLORS.purple },
                { key: "creator_fees", name: "Creator", color: COLORS.cyan },
              ]}
              yFormatter={(v) => formatCompact(v)}
            />
          )}
        </ChartCard>

        <ChartCard title="Cumulative Revenue (USD)" isLoading={l1}>
          {cumData.length > 0 && (
            <AreaChartComponent
              data={cumData}
              xKey="day"
              yKey="cum_usd"
              color={COLORS.purple}
              yFormatter={(v) => formatUSD(v)}
            />
          )}
        </ChartCard>
      </div>

      {totals && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
          <div className="kpi-card">
            <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">Protocol Fees</div>
            <div className="text-lg font-bold text-white">{formatSOL(totals.protocolSOL)} SOL</div>
            <div className="text-xs text-[#55556a]">{formatUSD(totals.protocolUSD)}</div>
          </div>
          <div className="kpi-card">
            <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">Creator Fees</div>
            <div className="text-lg font-bold text-white">{formatSOL(totals.creatorSOL)} SOL</div>
            <div className="text-xs text-[#55556a]">{formatUSD(totals.creatorUSD)}</div>
          </div>
          <div className="kpi-card">
            <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">Total Revenue</div>
            <div className="text-lg font-bold text-white">{formatSOL(totals.totalSOL)} SOL</div>
          </div>
          <div className="kpi-card">
            <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">Avg Daily Revenue</div>
            <div className="text-lg font-bold text-white">{formatSOL(totals.avgDaily)} SOL</div>
          </div>
        </div>
      )}

      <ChartCard title="Top Creator Fee Earners (7d)" isLoading={l2}>
        {creators && creators.length > 0 && (
          <DataTable
            data={creators}
            columns={[
              { key: "creator", label: "Creator", format: "address" },
              { key: "tokens_created", label: "Tokens", format: "number", align: "right" },
              { key: "total_creator_fees_sol", label: "Fees (SOL)", format: "sol", align: "right" },
              { key: "total_volume_sol", label: "Volume (SOL)", format: "sol", align: "right" },
            ]}
          />
        )}
      </ChartCard>
    </div>
  );
}
