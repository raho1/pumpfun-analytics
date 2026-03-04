"use client";

import { useMemo } from "react";
import { useDuneQuery } from "@/hooks/use-dune-query";
import { ChartCard } from "@/components/chart-card";
import { SectionHeader } from "@/components/section-header";
import { StackedBarChartComponent } from "@/components/charts/stacked-bar-chart";
import { MultiLineChartComponent } from "@/components/charts/multi-line-chart";
import { DonutChartComponent } from "@/components/charts/donut-chart";
import { AreaChartComponent } from "@/components/charts/area-chart";
import { DataTable } from "@/components/charts/data-table";
import { COLORS } from "@/lib/colors";
import { formatCompact, formatCurrency } from "@/lib/utils";
import { useCurrency } from "@/lib/currency-context";
import type {
  CompetitorDexShare,
  CompetitorLaunches,
  CompetitorGradRates,
} from "@/lib/types";

const DEX_COLORS: Record<string, string> = {
  PumpSwap: COLORS.purple,
  "Pump.fun (Bonding)": COLORS.purpleLight,
  Meteora: COLORS.cyan,
  Raydium: COLORS.yellow,
  "Raydium LaunchLab": COLORS.orange,
  "Orca (Whirlpool)": COLORS.blue,
  Phoenix: COLORS.pink,
  Other: "#3d3d52",
};

const PLATFORM_COLORS: Record<string, string> = {
  "Pump.fun": COLORS.purple,
  "Raydium LaunchLab": COLORS.yellow,
  Moonshot: COLORS.cyan,
  "Boop.fun": COLORS.orange,
};

export function CompetitorsTab() {
  const { data: dexShare, isLoading: l1 } = useDuneQuery<CompetitorDexShare[]>("competitor_dex_share");
  const { data: launches, isLoading: l2 } = useDuneQuery<CompetitorLaunches[]>("competitor_launches");
  const { data: gradRates, isLoading: l3 } = useDuneQuery<CompetitorGradRates[]>("competitor_grad_rates");
  const { currency, convertFromUSD } = useCurrency();

  // --- DEX Market Share aggregations ---
  const avgShareByDex = useMemo(() => {
    if (!dexShare || dexShare.length === 0) return [];
    const agg: Record<string, { vol: number; count: number }> = {};
    for (const r of dexShare) {
      if (!agg[r.dex]) agg[r.dex] = { vol: 0, count: 0 };
      agg[r.dex].vol += r.volume_usd || 0;
      agg[r.dex].count++;
    }
    return Object.entries(agg)
      .map(([name, { vol, count }]) => ({
        name,
        value: vol / count,
      }))
      .sort((a, b) => b.value - a.value);
  }, [dexShare]);

  const dexShareTimeSeries = useMemo(() => {
    if (!dexShare || dexShare.length === 0) return [];
    const byDay: Record<string, Record<string, number>> = {};
    for (const r of dexShare) {
      if (!byDay[r.day]) byDay[r.day] = {};
      byDay[r.day][r.dex] = r.market_share_pct || 0;
    }
    return Object.entries(byDay)
      .map(([day, dexes]) => ({ day, ...dexes }))
      .sort((a, b) => a.day.localeCompare(b.day));
  }, [dexShare]);

  const dexKpis = useMemo(() => {
    if (!dexShare || dexShare.length === 0) return null;
    const days = new Set(dexShare.map((r) => r.day));
    const numDays = days.size;
    const pumpswapRows = dexShare.filter((r) => r.dex === "PumpSwap");
    const avgPumpswapShare = pumpswapRows.reduce((s, r) => s + (r.market_share_pct || 0), 0) / (pumpswapRows.length || 1);
    const totalVolume = dexShare.reduce((s, r) => s + (r.volume_usd || 0), 0);
    const pumpswapVol = pumpswapRows.reduce((s, r) => s + (r.volume_usd || 0), 0);
    const meteoraRows = dexShare.filter((r) => r.dex === "Meteora");
    const avgMeteora = meteoraRows.reduce((s, r) => s + (r.market_share_pct || 0), 0) / (meteoraRows.length || 1);
    return {
      avgPumpswapShare,
      avgMeteora,
      totalVolume,
      pumpswapVol,
      numDays,
      avgDailyVol: totalVolume / numDays,
    };
  }, [dexShare]);

  // --- DEX table summary ---
  const dexSummaryTable = useMemo(() => {
    if (!dexShare || dexShare.length === 0) return [];
    const agg: Record<string, { vol: number; trades: number; traders: number; days: number }> = {};
    for (const r of dexShare) {
      if (!agg[r.dex]) agg[r.dex] = { vol: 0, trades: 0, traders: 0, days: 0 };
      agg[r.dex].vol += r.volume_usd || 0;
      agg[r.dex].trades += r.trades || 0;
      agg[r.dex].traders += r.traders || 0;
      agg[r.dex].days++;
    }
    const totalVol = Object.values(agg).reduce((s, v) => s + v.vol, 0);
    return Object.entries(agg)
      .map(([dex, v]) => ({
        dex,
        volume_usd: v.vol,
        trades: v.trades,
        avg_daily_traders: Math.round(v.traders / v.days),
        market_share: totalVol > 0 ? (v.vol / totalVol) * 100 : 0,
      }))
      .sort((a, b) => b.volume_usd - a.volume_usd);
  }, [dexShare]);

  // --- Launch data ---
  const launchTimeSeries = useMemo(() => {
    if (!launches || launches.length === 0) return [];
    const byDay: Record<string, Record<string, number>> = {};
    for (const r of launches) {
      const d = r.day.split("T")[0].split(" ")[0];
      if (!byDay[d]) byDay[d] = {};
      byDay[d][r.platform] = r.launches || 0;
    }
    return Object.entries(byDay)
      .map(([day, platforms]) => ({ day, ...platforms }))
      .sort((a, b) => a.day.localeCompare(b.day));
  }, [launches]);

  const launchPlatforms = useMemo(() => {
    if (!launches || launches.length === 0) return [];
    return [...new Set(launches.map((r) => r.platform))];
  }, [launches]);

  const launchKpis = useMemo(() => {
    if (!launches || launches.length === 0) return null;
    const days = new Set(launches.map((r) => r.day.split("T")[0].split(" ")[0]));
    const numDays = days.size;
    const pumpRows = launches.filter((r) => r.platform === "Pump.fun");
    const pumpTotal = pumpRows.reduce((s, r) => s + (r.launches || 0), 0);
    const allTotal = launches.reduce((s, r) => s + (r.launches || 0), 0);
    return {
      pumpAvgDaily: Math.round(pumpTotal / numDays),
      pumpTotal,
      allTotal,
      dominance: allTotal > 0 ? (pumpTotal / allTotal) * 100 : 0,
      numDays,
    };
  }, [launches]);

  // --- Graduation rates ---
  const gradTimeSeries = useMemo(() => {
    if (!gradRates || gradRates.length === 0) return [];
    const byDay: Record<string, Record<string, number>> = {};
    for (const r of gradRates) {
      const d = r.day.split("T")[0].split(" ")[0];
      if (!byDay[d]) byDay[d] = {};
      byDay[d][`${r.platform}_rate`] = Number(r.grad_rate_pct) || 0;
      byDay[d][`${r.platform}_created`] = r.created || 0;
      byDay[d][`${r.platform}_graduated`] = r.graduated || 0;
    }
    return Object.entries(byDay)
      .map(([day, data]) => ({ day, ...data }))
      .sort((a, b) => a.day.localeCompare(b.day));
  }, [gradRates]);

  const gradPlatforms = useMemo(() => {
    if (!gradRates || gradRates.length === 0) return [];
    return [...new Set(gradRates.map((r) => r.platform))];
  }, [gradRates]);

  const gradKpis = useMemo(() => {
    if (!gradRates || gradRates.length === 0) return null;
    const pumpRows = gradRates.filter((r) => r.platform === "Pump.fun");
    const avgGrad = pumpRows.reduce((s, r) => s + Number(r.grad_rate_pct || 0), 0) / (pumpRows.length || 1);
    const totalGrads = pumpRows.reduce((s, r) => s + (r.graduated || 0), 0);
    return { avgGrad, totalGrads };
  }, [gradRates]);

  // Unique DEX names for stacked chart series
  const dexNames = useMemo(() => {
    if (!dexShare) return [];
    const names = [...new Set(dexShare.map((r) => r.dex))];
    // Order by total volume
    const volByDex: Record<string, number> = {};
    for (const r of dexShare) {
      volByDex[r.dex] = (volByDex[r.dex] || 0) + (r.volume_usd || 0);
    }
    return names.sort((a, b) => (volByDex[b] || 0) - (volByDex[a] || 0));
  }, [dexShare]);

  return (
    <div>
      <SectionHeader
        title="Competitive Landscape"
        description="Market share analysis across Solana DEXes and launchpad platforms. Pump.fun + PumpSwap vs. Raydium, Meteora, Orca, and emerging competitors."
        methodology="DEX volume from dex_solana.trades spellbook (aggregates all Solana DEX trades with standardized schema). Launch counts from decoded contract tables per platform. Graduation = token completing bonding curve and migrating to DEX. Believe and LetsBonk excluded — their contracts are not yet decoded on Dune."
        sourceLabel="Dune Spellbook"
      />

      {/* DEX Market Share KPIs */}
      {dexKpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="kpi-card">
            <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">
              PumpSwap Avg Share
            </div>
            <div className="text-lg font-bold font-mono" style={{ color: COLORS.purple }}>
              {dexKpis.avgPumpswapShare.toFixed(1)}%
            </div>
          </div>
          <div className="kpi-card">
            <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">
              Meteora Avg Share
            </div>
            <div className="text-lg font-bold font-mono" style={{ color: COLORS.cyan }}>
              {dexKpis.avgMeteora.toFixed(1)}%
            </div>
          </div>
          <div className="kpi-card">
            <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">
              Total DEX Volume (30d)
            </div>
            <div className="text-lg font-bold text-white font-mono">
              {formatCurrency(convertFromUSD(dexKpis.totalVolume), currency)}
            </div>
          </div>
          <div className="kpi-card">
            <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">
              Avg Daily Volume
            </div>
            <div className="text-lg font-bold text-white font-mono">
              {formatCurrency(convertFromUSD(dexKpis.avgDailyVol), currency)}
            </div>
          </div>
        </div>
      )}

      {/* DEX Market Share Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard
          title="DEX Volume Market Share (%)"
          note="Daily share of total Solana DEX volume by project"
          isLoading={l1}
        >
          {dexShareTimeSeries.length > 0 && (
            <StackedBarChartComponent
              data={dexShareTimeSeries}
              xKey="day"
              series={dexNames.map((name) => ({
                key: name,
                name,
                color: DEX_COLORS[name] || "#3d3d52",
              }))}
              yFormatter={(v) => `${v.toFixed(0)}%`}
            />
          )}
        </ChartCard>

        <ChartCard
          title="Average Daily Volume by DEX"
          note="30-day average, ordered by volume"
          isLoading={l1}
        >
          {avgShareByDex.length > 0 && (
            <DonutChartComponent
              data={avgShareByDex}
              colors={avgShareByDex.map((d) => DEX_COLORS[d.name] || "#3d3d52")}
              valueFormatter={(v) => formatCurrency(convertFromUSD(v), currency)}
            />
          )}
        </ChartCard>
      </div>

      {/* DEX Summary Table */}
      <div className="mt-4">
        <ChartCard
          title="DEX Comparison Table (30d)"
          note="Aggregated across the trailing 30-day window"
          isLoading={l1}
        >
          {dexSummaryTable.length > 0 && (
            <DataTable
              data={dexSummaryTable}
              columns={[
                { key: "dex", label: "DEX" },
                { key: "volume_usd", label: "Volume (USD)", format: "usd", align: "right" },
                { key: "trades", label: "Trades", format: "number", align: "right" },
                { key: "avg_daily_traders", label: "Avg Daily Traders", format: "number", align: "right" },
                { key: "market_share", label: "Share %", format: "percent", align: "right" },
              ]}
            />
          )}
        </ChartCard>
      </div>

      {/* Launchpad Competition */}
      <div className="mt-6">
        <SectionHeader
          title="Launchpad Token Creation"
          description="Daily token launches across Solana launchpads. Pump.fun dominates with 30K+ daily launches. Competitors with decoded contracts on Dune: Raydium LaunchLab, Moonshot (Dexscreener), Boop.fun."
          methodology="Counts creation events from each platform's decoded tables: pump_evt_createevent, raydium_launchpad_call_initialize, token_launchpad_call_tokenmint, boop_call_create_token. Believe and LetsBonk are not decoded on Dune and cannot be tracked."
          sourceLabel="Decoded Tables"
        />

        {launchKpis && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <div className="kpi-card">
              <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">
                Pump.fun Avg Daily
              </div>
              <div className="text-lg font-bold font-mono" style={{ color: COLORS.purple }}>
                {formatCompact(launchKpis.pumpAvgDaily)}
              </div>
            </div>
            <div className="kpi-card">
              <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">
                Pump.fun Dominance
              </div>
              <div className="text-lg font-bold font-mono" style={{ color: COLORS.purple }}>
                {launchKpis.dominance.toFixed(1)}%
              </div>
            </div>
            <div className="kpi-card">
              <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">
                Total Launches (30d)
              </div>
              <div className="text-lg font-bold text-white font-mono">
                {formatCompact(launchKpis.allTotal)}
              </div>
            </div>
            <div className="kpi-card">
              <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">
                Period
              </div>
              <div className="text-lg font-bold text-white font-mono">
                {launchKpis.numDays}d
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard
            title="Daily Token Launches by Platform"
            note="Log scale — Pump.fun ~30K/day vs competitors in single digits"
            isLoading={l2}
          >
            {launchTimeSeries.length > 0 && (
              <StackedBarChartComponent
                data={launchTimeSeries}
                xKey="day"
                series={launchPlatforms.map((p) => ({
                  key: p,
                  name: p,
                  color: PLATFORM_COLORS[p] || "#3d3d52",
                }))}
                grouped
                yFormatter={(v) => formatCompact(v)}
              />
            )}
          </ChartCard>

          <ChartCard
            title="Pump.fun Daily Launches"
            note="Isolated view — consistent ~30K tokens per day"
            isLoading={l2}
          >
            {launchTimeSeries.length > 0 && (
              <AreaChartComponent
                data={launchTimeSeries}
                xKey="day"
                yKey="Pump.fun"
                color={COLORS.purple}
                yFormatter={(v) => formatCompact(v)}
              />
            )}
          </ChartCard>
        </div>
      </div>

      {/* Graduation Rates */}
      <div className="mt-6">
        <SectionHeader
          title="Graduation Rate Comparison"
          description="Percentage of tokens that complete the bonding curve and migrate to a DEX pool. A higher graduation rate indicates better token quality or lower barriers."
          methodology="Graduation rate = graduated tokens / created tokens per day. Pump.fun: pump_evt_completeevent / pump_evt_createevent. Raydium LaunchLab: migrate_to_cpswap / initialize. Decimal values (Dune decimal(38,15) type) are coerced to float."
        />

        {gradKpis && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
            <div className="kpi-card">
              <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">
                Pump.fun Avg Grad Rate
              </div>
              <div className="text-lg font-bold font-mono" style={{ color: COLORS.purple }}>
                {gradKpis.avgGrad.toFixed(2)}%
              </div>
            </div>
            <div className="kpi-card">
              <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">
                Total Graduations (30d)
              </div>
              <div className="text-lg font-bold text-white font-mono">
                {formatCompact(gradKpis.totalGrads)}
              </div>
            </div>
            <div className="kpi-card">
              <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">
                Context
              </div>
              <div className="text-[0.75rem] font-medium text-[#7a7a94] leading-[1.5]">
                ~99% of tokens never graduate. The 0.8-1% that do generate all post-bonding volume.
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard
            title="Daily Graduation Rate (%)"
            note="Pump.fun graduation rate over time"
            isLoading={l3}
          >
            {gradTimeSeries.length > 0 && (
              <MultiLineChartComponent
                data={gradTimeSeries}
                xKey="day"
                series={gradPlatforms.map((p) => ({
                  key: `${p}_rate`,
                  name: p,
                  color: PLATFORM_COLORS[p] || "#3d3d52",
                }))}
                yFormatter={(v) => `${Number(v).toFixed(2)}%`}
              />
            )}
          </ChartCard>

          <ChartCard
            title="Daily Graduations (Count)"
            note="Absolute number of tokens graduating per day"
            isLoading={l3}
          >
            {gradTimeSeries.length > 0 && (
              <MultiLineChartComponent
                data={gradTimeSeries}
                xKey="day"
                series={gradPlatforms.map((p) => ({
                  key: `${p}_graduated`,
                  name: p,
                  color: PLATFORM_COLORS[p] || "#3d3d52",
                }))}
                yFormatter={(v) => formatCompact(Number(v))}
              />
            )}
          </ChartCard>
        </div>
      </div>

      {/* Data Coverage Note */}
      <div className="mt-6">
        <div
          className="px-4 py-3 rounded-lg text-[0.75rem] leading-[1.6]"
          style={{
            background: "rgba(124,58,237,0.04)",
            border: "1px solid rgba(124,58,237,0.12)",
            color: "#7a7a94",
          }}
        >
          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.5px] text-[#a78bfa] block mb-1">
            Data Coverage Notes
          </span>
          <strong className="text-[#8888a0]">Included:</strong> Pump.fun, PumpSwap, Raydium, Raydium LaunchLab, Meteora, Orca (Whirlpool), Phoenix, Moonshot, Boop.fun.{" "}
          <strong className="text-[#8888a0]">Not yet decoded on Dune:</strong> Believe (2.58% reported graduation rate), LetsBonk (peaked at 65.9% daily launch share in Jul 2025).{" "}
          DEX volume data from <span className="text-[#a78bfa]">dex_solana.trades</span> Dune Spellbook. Launch counts from decoded contract event tables.
        </div>
      </div>
    </div>
  );
}
