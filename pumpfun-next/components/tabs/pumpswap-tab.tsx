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
import { formatCompact, formatCurrency } from "@/lib/utils";
import { useCurrency } from "@/lib/currency-context";
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
  const { currency, convert } = useCurrency();

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
        methodology="Volume sourced from dex_solana.trades spellbook (project = pumpdotfun), cross-validated against DeFiLlama. Fee splits computed from known PumpSwap basis points: 25 bps LP, 5 bps protocol. SOL conversion via daily prices.usd average."
        sourceLabel="Dune: dex_solana.trades"
      />

      {/* KPIs */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
          <div className="kpi-card">
            <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">Total Volume</div>
            <div className="text-lg font-bold text-white font-mono">{formatCurrency(convert(kpis.totalVol), currency)}</div>
          </div>
          <div className="kpi-card">
            <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">Avg Daily Vol</div>
            <div className="text-lg font-bold text-white font-mono">{formatCurrency(convert(kpis.avgDailyVol), currency)}</div>
          </div>
          <div className="kpi-card">
            <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">Total Fees</div>
            <div className="text-lg font-bold text-white font-mono">{formatCurrency(convert(kpis.totalFees), currency)}</div>
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
        <ChartCard
          title="PumpSwap Daily Volume"
          note="Volume from dex_solana.trades spellbook, converted to SOL via daily price"
          isLoading={l1}
        >
          {fees && fees.length > 0 && (
            <AreaChartComponent
              data={fees}
              xKey="day"
              yKey="volume_sol"
              color={COLORS.cyan}
              yFormatter={(v) => formatCurrency(convert(v), currency)}
            />
          )}
        </ChartCard>

        <ChartCard
          title="Fee Revenue Breakdown"
          note="3-way split: LP providers, protocol, and coin creators"
          isLoading={l1}
        >
          {fees && fees.length > 0 && (
            <StackedBarChartComponent
              data={fees}
              xKey="day"
              series={[
                { key: "lp_fees", name: "LP Fees", color: COLORS.green },
                { key: "protocol_fees", name: "Protocol Fees", color: COLORS.purple },
                { key: "creator_fees", name: "Creator Fees", color: COLORS.cyan },
              ]}
              yFormatter={(v) => formatCurrency(convert(v), currency)}
            />
          )}
        </ChartCard>
      </div>

      {/* Migration Funnel */}
      <div className="mt-6">
        <SectionHeader
          title="Token Lifecycle Funnel"
          description="Created → Graduated → Migrated to PumpSwap. Track the full lifecycle of pump.fun tokens from bonding curve creation through graduation and AMM migration."
          methodology="Created = pump_evt_createevent count. Graduated = pump_evt_completeevent count. Migrated = pump_evt_completepumpammmigrationevent count. Graduation rate = graduated / created. Migration rate = migrated / graduated."
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
          description="LP deposit activity and new pool creation on PumpSwap."
          methodology="Deposits tracked via pump_amm_evt_depositevent (quote_amount_in / 1e9 = SOL). Pool creation from pump_amm_evt_createpoolevent. Withdrawal counts from pump_amm_evt_withdrawevent."
          sourceLabel="Dune: pumpdotfun_solana"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard
            title="SOL Deposited by LPs"
            subtitle="Daily LP deposits into PumpSwap pools"
            isLoading={l4}
          >
            {liquidity && liquidity.length > 0 && (
              <BarChartComponent
                data={liquidity}
                xKey="day"
                yKey="sol_deposited"
                color={COLORS.green}
                gradient
                yFormatter={(v) => formatCurrency(convert(v), currency)}
              />
            )}
          </ChartCard>

          <ChartCard
            title="New Pools Created"
            subtitle="Graduated tokens auto-migrate to new PumpSwap pools"
            isLoading={l4}
          >
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
        <ChartCard
          title="Top PumpSwap Pools (7d)"
          note="Ranked by trading volume over the last 7 days"
          isLoading={l3}
        >
          {topPools && topPools.length > 0 && (
            <DataTable
              data={topPools}
              columns={[
                { key: "pool", label: "Pool" },
                { key: "volume_sol", label: "Volume", format: "sol", align: "right" },
                { key: "total_fees", label: "Fees", format: "sol", align: "right" },
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
