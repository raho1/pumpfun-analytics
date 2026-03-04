"use client";

import { useMemo } from "react";
import { useDuneQuery } from "@/hooks/use-dune-query";
import { useCurrency } from "@/lib/currency-context";
import { ChartCard } from "@/components/chart-card";
import { SectionHeader } from "@/components/section-header";
import { StackedBarChartComponent } from "@/components/charts/stacked-bar-chart";
import { AreaChartComponent } from "@/components/charts/area-chart";
import { DataTable } from "@/components/charts/data-table";
import { COLORS } from "@/lib/colors";
import { formatCurrency, formatCompact } from "@/lib/utils";
import type { FeeRevenue } from "@/lib/types";

export function RevenueTab() {
  const { data: feeData, isLoading: l1 } = useDuneQuery<FeeRevenue[]>("fee_revenue");
  const { data: creators, isLoading: l2 } = useDuneQuery<Record<string, unknown>[]>("creator_leaderboard");
  const { currency, convert } = useCurrency();

  const cumData = useMemo(() => {
    if (!feeData || feeData.length === 0) return [];
    let cum = 0;
    return feeData.map((row) => {
      cum += convert(row.total_fees || 0);
      return { ...row, cum_val: cum };
    });
  }, [feeData, convert]);

  const totals = useMemo(() => {
    if (!feeData || feeData.length === 0) return null;
    const tp = feeData.reduce((s, r) => s + (r.protocol_fees || 0), 0);
    const tc = feeData.reduce((s, r) => s + (r.creator_fees || 0), 0);
    return {
      protocol: convert(tp),
      creator: convert(tc),
      total: convert(tp + tc),
      avgDaily: convert(feeData.reduce((s, r) => s + (r.total_fees || 0), 0) / feeData.length),
    };
  }, [feeData, convert]);

  return (
    <div>
      <SectionHeader
        title="Revenue & Fees"
        description="$935M+ cumulative revenue. Project Ascend shifted to sliding creator fees (0.05-0.95%). 98%+ of revenue now funds PUMP token buybacks ($254M+ bought back)."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Daily Fee Revenue" isLoading={l1}>
          {feeData && feeData.length > 0 && (
            <StackedBarChartComponent
              data={feeData.map((r) => ({
                ...r,
                protocol_fees_c: convert(r.protocol_fees || 0),
                creator_fees_c: convert(r.creator_fees || 0),
              }))}
              xKey="day"
              series={[
                { key: "protocol_fees_c", name: "Protocol (1%)", color: COLORS.purple },
                { key: "creator_fees_c", name: "Creator", color: COLORS.cyan },
              ]}
              yFormatter={(v) => formatCurrency(v, currency)}
            />
          )}
        </ChartCard>

        <ChartCard title="Cumulative Revenue" isLoading={l1}>
          {cumData.length > 0 && (
            <AreaChartComponent
              data={cumData}
              xKey="day"
              yKey="cum_val"
              color={COLORS.purple}
              yFormatter={(v) => formatCurrency(v, currency)}
            />
          )}
        </ChartCard>
      </div>

      {totals && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
          <div className="kpi-card">
            <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">Protocol Fees</div>
            <div className="text-lg font-bold text-white">{formatCurrency(totals.protocol, currency)}</div>
          </div>
          <div className="kpi-card">
            <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">Creator Fees</div>
            <div className="text-lg font-bold text-white">{formatCurrency(totals.creator, currency)}</div>
          </div>
          <div className="kpi-card">
            <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">Total Revenue</div>
            <div className="text-lg font-bold text-white">{formatCurrency(totals.total, currency)}</div>
          </div>
          <div className="kpi-card">
            <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">Avg Daily Revenue</div>
            <div className="text-lg font-bold text-white">{formatCurrency(totals.avgDaily, currency)}</div>
          </div>
        </div>
      )}

      <ChartCard title="Top Creator Fee Earners (7d)" isLoading={l2}>
        {creators && creators.length > 0 && (
          <DataTable
            data={creators}
            columns={[
              { key: "name", label: "Token" },
              { key: "symbol", label: "Symbol" },
              { key: "fees_sol", label: "Fees (SOL)", format: "sol", align: "right" },
              { key: "vol_sol", label: "Volume (SOL)", format: "sol", align: "right" },
              { key: "trades", label: "Trades", format: "number", align: "right" },
            ]}
          />
        )}
      </ChartCard>
    </div>
  );
}
