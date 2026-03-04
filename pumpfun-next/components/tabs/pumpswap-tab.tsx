"use client";

import { useMemo } from "react";
import { useDuneQuery } from "@/hooks/use-dune-query";
import { ChartCard } from "@/components/chart-card";
import { SectionHeader } from "@/components/section-header";
import { AreaChartComponent } from "@/components/charts/area-chart";
import { StackedBarChartComponent } from "@/components/charts/stacked-bar-chart";
import { MultiLineChartComponent } from "@/components/charts/multi-line-chart";
import { BarChartComponent } from "@/components/charts/bar-chart";
import { DataTable } from "@/components/charts/data-table";
import { COLORS } from "@/lib/colors";
import { formatCompact } from "@/lib/utils";
import type {
  PumpSwapFees,
  MigrationFunnel,
  PumpSwapTopPool,
  PumpSwapLiquidity,
} from "@/lib/types";

export function PumpSwapTab() {
  const { data: fees, isLoading: l1 } = useDuneQuery<PumpSwapFees[]>("pumpswap_fees");
  const { data: funnel, isLoading: l2 } = useDuneQuery<MigrationFunnel[]>("migration_funnel");
  const { data: topPools, isLoading: l3 } = useDuneQuery<PumpSwapTopPool[]>("pumpswap_top_pools");
  const { data: liquidity, isLoading: l4 } = useDuneQuery<PumpSwapLiquidity[]>("pumpswap_liquidity");

  const kpis = useMemo(() => {
    if (!fees || fees.length === 0) return null;
    const totalVol = fees.reduce((s, r) => s + Number(r.volume_sol || 0), 0);
    const totalFees = fees.reduce((s, r) => s + Number(r.total_fees || 0), 0);
    const totalTrades = fees.reduce((s, r) => s + Number(r.trades || 0), 0);
    const avgPools = fees.reduce((s, r) => s + Number(r.active_pools || 0), 0) / fees.length;
    return {
      totalVol,
      totalFees,
      totalTrades,
      avgPools: Math.round(avgPools),
      avgDailyVol: totalVol / fees.length,
    };
  }, [fees]);

  const migrationKpis = useMemo(() => {
    if (!funnel || funnel.length === 0) return null;
    const totalCreated = funnel.reduce((s, r) => s + Number(r.created || 0), 0);
    const totalGrad = funnel.reduce((s, r) => s + Number(r.graduated || 0), 0);
    const totalMigrated = funnel.reduce((s, r) => s + Number(r.migrated_to_pumpswap || 0), 0);
    return {
      totalCreated,
      totalGrad,
      totalMigrated,
      gradRate: totalGrad / totalCreated * 100,
      migrationRate: totalGrad > 0 ? totalMigrated / totalGrad * 100 : 0,
    };
  }, [funnel]);

  const funnelCoerced = useMemo(() => {
    if (!funnel) return undefined;
    return funnel.map((r) => ({
      ...r,
      grad_rate: Number(r.grad_rate),
      migration_rate: Number(r.migration_rate),
    }));
  }, [funnel]);

  return (
    <div>
      <SectionHeader
        title="PumpSwap AMM"
        description="PumpSwap is Pump.fun's native AMM for graduated tokens. Tokens that complete the bonding curve automatically migrate to PumpSwap pools with a 3-way fee split: LP providers, protocol, and coin creators."
      />

      {/* KPIs */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
          <div className="kpi-card">
            <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">Total Volume</div>
            <div className="text-lg font-bold text-white font-mono">{formatCompact(kpis.totalVol)} SOL</div>
          </div>
          <div className="kpi-card">
            <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">Avg Daily Vol</div>
            <div className="text-lg font-bold text-white font-mono">{formatCompact(kpis.avgDailyVol)} SOL</div>
          </div>
          <div className="kpi-card">
            <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">Total Fees</div>
            <div className="text-lg font-bold text-white font-mono">{formatCompact(kpis.totalFees)} SOL</div>
          </div>
          <div className="kpi-card">
            <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">Total Trades</div>
            <div className="text-lg font-bold text-white font-mono">{formatCompact(kpis.totalTrades)}</div>
          </div>
          <div className="kpi-card">
            <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">Avg Active Pools</div>
            <div className="text-lg font-bold text-white font-mono">{kpis.avgPools.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* Volume & Fee Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="PumpSwap Daily Volume" isLoading={l1}>
          {fees && fees.length > 0 && (
            <AreaChartComponent
              data={fees}
              xKey="day"
              yKey="volume_sol"
              color={COLORS.cyan}
              yFormatter={(v) => `${formatCompact(v)} SOL`}
            />
          )}
        </ChartCard>

        <ChartCard title="Fee Revenue Breakdown" isLoading={l1}>
          {fees && fees.length > 0 && (
            <StackedBarChartComponent
              data={fees}
              xKey="day"
              series={[
                { key: "lp_fees", name: "LP Fees", color: COLORS.green },
                { key: "protocol_fees", name: "Protocol Fees", color: COLORS.purple },
                { key: "creator_fees", name: "Creator Fees", color: COLORS.cyan },
              ]}
              yFormatter={(v) => `${formatCompact(v)} SOL`}
            />
          )}
        </ChartCard>
      </div>

      {/* Migration Funnel */}
      <div className="mt-6">
        <SectionHeader
          title="Token Lifecycle Funnel"
          description="Created → Graduated → Migrated to PumpSwap. Track the full lifecycle of pump.fun tokens."
        />

        {migrationKpis && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
            <div className="kpi-card">
              <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">Tokens Created</div>
              <div className="text-lg font-bold text-white font-mono">{formatCompact(migrationKpis.totalCreated)}</div>
            </div>
            <div className="kpi-card">
              <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">Graduated</div>
              <div className="text-lg font-bold text-white font-mono">{formatCompact(migrationKpis.totalGrad)}</div>
            </div>
            <div className="kpi-card">
              <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">Migrated to PumpSwap</div>
              <div className="text-lg font-bold text-white font-mono">{formatCompact(migrationKpis.totalMigrated)}</div>
            </div>
            <div className="kpi-card">
              <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">Graduation Rate</div>
              <div className="text-lg font-bold font-mono" style={{ color: COLORS.purple }}>{migrationKpis.gradRate.toFixed(2)}%</div>
            </div>
            <div className="kpi-card">
              <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">Migration Rate</div>
              <div className="text-lg font-bold font-mono" style={{ color: COLORS.cyan }}>{migrationKpis.migrationRate.toFixed(1)}%</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard title="Daily Migration Funnel" isLoading={l2}>
            {funnelCoerced && funnelCoerced.length > 0 && (
              <MultiLineChartComponent
                data={funnelCoerced}
                xKey="day"
                series={[
                  { key: "created", name: "Created", color: COLORS.yellow },
                  { key: "graduated", name: "Graduated", color: COLORS.purple },
                  { key: "migrated_to_pumpswap", name: "Migrated", color: COLORS.cyan },
                ]}
                yFormatter={(v) => formatCompact(v)}
              />
            )}
          </ChartCard>

          <ChartCard title="Graduation & Migration Rates" isLoading={l2}>
            {funnelCoerced && funnelCoerced.length > 0 && (
              <MultiLineChartComponent
                data={funnelCoerced}
                xKey="day"
                series={[
                  { key: "grad_rate", name: "Graduation %", color: COLORS.purple },
                  { key: "migration_rate", name: "Migration %", color: COLORS.cyan },
                ]}
                yFormatter={(v) => `${Number(v).toFixed(1)}%`}
              />
            )}
          </ChartCard>
        </div>
      </div>

      {/* Liquidity */}
      <div className="mt-6">
        <SectionHeader
          title="Liquidity Activity"
          description="LP deposits, withdrawals, and net liquidity flow."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard title="Net Liquidity Flow (SOL)" isLoading={l4}>
            {liquidity && liquidity.length > 0 && (
              <BarChartComponent
                data={liquidity}
                xKey="day"
                yKey="net_liquidity_sol"
                color={COLORS.green}
                gradient
                yFormatter={(v) => `${formatCompact(v)} SOL`}
              />
            )}
          </ChartCard>

          <ChartCard title="New Pools Created" isLoading={l4}>
            {liquidity && liquidity.length > 0 && (
              <BarChartComponent
                data={liquidity}
                xKey="day"
                yKey="new_pools"
                color={COLORS.purple}
                gradient
                yFormatter={(v) => formatCompact(v)}
              />
            )}
          </ChartCard>
        </div>
      </div>

      {/* Top Pools Table */}
      <div className="mt-6">
        <ChartCard title="Top PumpSwap Pools (7d)" isLoading={l3}>
          {topPools && topPools.length > 0 && (
            <DataTable
              data={topPools}
              columns={[
                { key: "pool", label: "Pool", format: "address" },
                { key: "volume_sol", label: "Volume (SOL)", format: "sol", align: "right" },
                { key: "total_fees", label: "Fees (SOL)", format: "sol", align: "right" },
                { key: "trades", label: "Trades", format: "number", align: "right" },
                { key: "unique_traders", label: "Traders", format: "number", align: "right" },
              ]}
            />
          )}
        </ChartCard>
      </div>
    </div>
  );
}
