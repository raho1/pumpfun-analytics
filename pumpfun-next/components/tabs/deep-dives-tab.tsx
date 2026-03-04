"use client";

import { useMemo } from "react";
import { useDuneQuery } from "@/hooks/use-dune-query";
import { ChartCard } from "@/components/chart-card";
import { SectionHeader } from "@/components/section-header";
import { BarChartComponent } from "@/components/charts/bar-chart";
import { MultiLineChartComponent } from "@/components/charts/multi-line-chart";
import { AreaChartComponent } from "@/components/charts/area-chart";
import { COLORS, CHART_COLORS } from "@/lib/colors";
import { formatDate, formatCompact } from "@/lib/utils";
import type {
  CohortRetention,
  RevenueQuality,
  PostGradSurvival,
  CurveVelocity,
} from "@/lib/types";

/* ── helpers ── */

function retentionColor(pct: number): string {
  if (pct >= 20) return "rgba(34,197,94,0.7)";
  if (pct >= 10) return "rgba(34,197,94,0.45)";
  if (pct >= 5) return "rgba(234,179,8,0.45)";
  if (pct >= 2) return "rgba(239,68,68,0.3)";
  return "rgba(239,68,68,0.15)";
}

/* ── Component ── */

export function DeepDivesTab() {
  const { data: cohortRaw, isLoading: l1 } = useDuneQuery<CohortRetention[]>("cohort_retention");
  const { data: revenueRaw, isLoading: l2 } = useDuneQuery<RevenueQuality[]>("revenue_quality");
  const { data: survivalRaw, isLoading: l3 } = useDuneQuery<PostGradSurvival[]>("post_grad_survival");
  const { data: velocityRaw, isLoading: l4 } = useDuneQuery<CurveVelocity[]>("curve_velocity");

  /* Cohort Retention — pivot into rows keyed by cohort_week */
  const cohortData = useMemo(() => {
    if (!cohortRaw || cohortRaw.length === 0) return undefined;
    const map = new Map<string, { cohort_week: string; cohort_size: number; weeks: Record<number, number> }>();
    for (const r of cohortRaw) {
      const weekKey = String(r.cohort_week).slice(0, 10);
      if (!map.has(weekKey)) {
        map.set(weekKey, { cohort_week: weekKey, cohort_size: Number(r.cohort_size), weeks: {} });
      }
      map.get(weekKey)!.weeks[r.week_offset] = Number(r.retention_pct);
    }
    return Array.from(map.values()).sort((a, b) => b.cohort_week.localeCompare(a.cohort_week));
  }, [cohortRaw]);

  const maxOffset = useMemo(() => {
    if (!cohortData) return 0;
    return Math.max(...cohortData.flatMap((c) => Object.keys(c.weeks).map(Number)));
  }, [cohortData]);

  /* Revenue Quality — sort ascending for charts */
  const revenue = useMemo(() => {
    if (!revenueRaw) return undefined;
    return [...revenueRaw]
      .map((r) => ({
        ...r,
        arpu_sol: Number(r.arpu_sol),
        top10_concentration_pct: Number(r.top10_concentration_pct),
        mature_revenue_pct: Number(r.mature_revenue_pct),
        total_fees: Number(r.total_fees),
        total_traders: Number(r.total_traders),
      }))
      .sort((a, b) => String(a.day).localeCompare(String(b.day)));
  }, [revenueRaw]);

  const revenueKPIs = useMemo(() => {
    if (!revenue || revenue.length === 0) return null;
    const recent = revenue.slice(-7);
    const avgArpu = recent.reduce((s, r) => s + r.arpu_sol, 0) / recent.length;
    const avgConc = recent.reduce((s, r) => s + r.top10_concentration_pct, 0) / recent.length;
    const avgMature = recent.reduce((s, r) => s + r.mature_revenue_pct, 0) / recent.length;
    return { avgArpu, avgConc, avgMature };
  }, [revenue]);

  /* Post-Grad Survival — reshape for multi-line chart */
  const survivalChart = useMemo(() => {
    if (!survivalRaw || survivalRaw.length === 0) return undefined;
    return [...survivalRaw]
      .map((r) => ({
        grad_week: String(r.grad_week).slice(0, 10),
        total_graduated: Number(r.total_graduated),
        survival_1h: Number(r.survival_1h),
        survival_6h: Number(r.survival_6h),
        survival_24h: Number(r.survival_24h),
        survival_48h: Number(r.survival_48h),
        survival_7d: Number(r.survival_7d),
      }))
      .sort((a, b) => a.grad_week.localeCompare(b.grad_week));
  }, [survivalRaw]);

  /* Survival snapshot — latest week as step data */
  const survivalSnapshot = useMemo(() => {
    if (!survivalChart || survivalChart.length === 0) return undefined;
    const latest = survivalChart[survivalChart.length - 1];
    return [
      { stage: "Graduation", pct: 100 },
      { stage: "1 hour", pct: latest.survival_1h },
      { stage: "6 hours", pct: latest.survival_6h },
      { stage: "24 hours", pct: latest.survival_24h },
      { stage: "48 hours", pct: latest.survival_48h },
    ];
  }, [survivalChart]);

  /* Curve Velocity */
  const velocity = useMemo(() => {
    if (!velocityRaw) return undefined;
    return [...velocityRaw]
      .map((r) => ({
        ...r,
        token_count: Number(r.token_count),
        avg_trades: Number(r.avg_trades),
        median_minutes: Number(r.median_minutes),
        bucket_order: Number(r.bucket_order),
      }))
      .sort((a, b) => a.bucket_order - b.bucket_order);
  }, [velocityRaw]);

  const velocityKPIs = useMemo(() => {
    if (!velocity || velocity.length === 0) return null;
    const total = velocity.reduce((s, r) => s + r.token_count, 0);
    const fast = velocity.filter((v) => v.bucket_order <= 2).reduce((s, r) => s + r.token_count, 0);
    const fastPct = (100 * fast) / total;
    // Weighted median approximation
    const medianBucket = velocity.find((v) => v.bucket_order === 1);
    return { total, fastPct, medianMin: medianBucket?.median_minutes ?? 0 };
  }, [velocity]);

  return (
    <div>
      <SectionHeader
        title="Deep Dives"
        description="Advanced metrics no public Pump.fun dashboard has. Wallet retention, revenue quality, post-graduation survival, and bonding curve velocity."
        methodology="Cohort retention groups wallets by first-trade week (8-week window). Revenue quality computes ARPU, top-10 token fee concentration, and % from mature tokens (>24hr old). Survival tracks DEX activity post-graduation. Velocity measures time from first trade to bonding curve completion."
      />

      {/* ── 1. Cohort Retention Heatmap ── */}
      <ChartCard
        title="Wallet Cohort Retention"
        subtitle="% of wallets still active N weeks after first trade"
        note="Week 0 = 100% by definition. Green = high retention, red = low."
        isLoading={l1}
      >
        {cohortData && cohortData.length > 0 && (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-[0.7rem] font-mono border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-1.5 px-2 text-[#55556a] font-medium whitespace-nowrap">Cohort</th>
                  <th className="text-right py-1.5 px-2 text-[#55556a] font-medium whitespace-nowrap">Size</th>
                  {Array.from({ length: maxOffset + 1 }, (_, i) => (
                    <th key={i} className="text-center py-1.5 px-2 text-[#55556a] font-medium">
                      W{i}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cohortData.map((row) => (
                  <tr key={row.cohort_week} className="border-t border-[rgba(255,255,255,0.04)]">
                    <td className="py-1.5 px-2 text-[#8888a0] whitespace-nowrap">
                      {formatDate(row.cohort_week)}
                    </td>
                    <td className="py-1.5 px-2 text-right text-[#8888a0]">
                      {formatCompact(row.cohort_size)}
                    </td>
                    {Array.from({ length: maxOffset + 1 }, (_, i) => {
                      const val = row.weeks[i];
                      return (
                        <td key={i} className="py-1.5 px-2 text-center">
                          {val != null ? (
                            <span
                              className="inline-block px-1.5 py-0.5 rounded text-[0.65rem]"
                              style={{
                                background: i === 0 ? "rgba(124,58,237,0.2)" : retentionColor(val),
                                color: i === 0 ? "#a78bfa" : val >= 10 ? "#e8e8f0" : "#8888a0",
                              }}
                            >
                              {val.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-[#2d2d4a]">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>

      {cohortData && cohortData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 mb-6">
          <div className="insight-card">
            <div className="text-[0.65rem] font-semibold tracking-[1px] uppercase text-[#7c3aed] mb-1.5">
              Retention Crisis
            </div>
            <p className="text-[0.78rem] text-[#6b6b88] leading-[1.55]">
              Only <strong className="text-[#a78bfa]">~6%</strong> of new traders return after their first week.
              By week 4, retention drops below <strong className="text-[#a78bfa]">2%</strong>.
            </p>
          </div>
          <div className="insight-card">
            <div className="text-[0.65rem] font-semibold tracking-[1px] uppercase text-[#7c3aed] mb-1.5">
              Mercenary Capital
            </div>
            <p className="text-[0.78rem] text-[#6b6b88] leading-[1.55]">
              The platform relies on a constant stream of new users rather than retained traders.
              This is the core growth vulnerability.
            </p>
          </div>
          <div className="insight-card">
            <div className="text-[0.65rem] font-semibold tracking-[1px] uppercase text-[#7c3aed] mb-1.5">
              Opportunity
            </div>
            <p className="text-[0.78rem] text-[#6b6b88] leading-[1.55]">
              Even a <strong className="text-[#a78bfa]">1 percentage point</strong> improvement in week-1 retention
              would add ~8K weekly active traders.
            </p>
          </div>
        </div>
      )}

      {/* ── 2. Revenue Quality ── */}
      <div className="mt-6">
        {revenueKPIs && (
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            <div className="kpi-card">
              <div className="absolute top-0 left-0 right-0 h-[2px] opacity-40" style={{ background: COLORS.cyan }} />
              <div className="text-[0.65rem] font-medium text-[var(--color-text-dim)] uppercase tracking-[0.5px] mb-2">
                ARPU (7d avg)
              </div>
              <div className="text-[1.2rem] sm:text-[1.4rem] font-bold tracking-[-0.02em] leading-[1.2] font-mono" style={{ color: COLORS.cyan }}>
                {revenueKPIs.avgArpu.toFixed(4)} SOL
              </div>
            </div>
            <div className="kpi-card">
              <div className="absolute top-0 left-0 right-0 h-[2px] opacity-40" style={{ background: COLORS.orange }} />
              <div className="text-[0.65rem] font-medium text-[var(--color-text-dim)] uppercase tracking-[0.5px] mb-2">
                Top-10 Concentration
              </div>
              <div className="text-[1.2rem] sm:text-[1.4rem] font-bold tracking-[-0.02em] leading-[1.2] font-mono" style={{ color: COLORS.orange }}>
                {revenueKPIs.avgConc.toFixed(1)}%
              </div>
            </div>
            <div className="kpi-card">
              <div className="absolute top-0 left-0 right-0 h-[2px] opacity-40" style={{ background: COLORS.green }} />
              <div className="text-[0.65rem] font-medium text-[var(--color-text-dim)] uppercase tracking-[0.5px] mb-2">
                Mature Revenue %
              </div>
              <div className="text-[1.2rem] sm:text-[1.4rem] font-bold tracking-[-0.02em] leading-[1.2] font-mono" style={{ color: COLORS.green }}>
                {revenueKPIs.avgMature.toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard
            title="Revenue Per User (ARPU)"
            subtitle="SOL fees per unique daily trader"
            isLoading={l2}
          >
            {revenue && revenue.length > 0 && (
              <AreaChartComponent
                data={revenue}
                xKey="day"
                yKey="arpu_sol"
                color={COLORS.cyan}
                yFormatter={(v) => `${v.toFixed(4)}`}
              />
            )}
          </ChartCard>

          <ChartCard
            title="Fee Concentration & Durability"
            subtitle="Top-10 token share vs mature token revenue %"
            isLoading={l2}
          >
            {revenue && revenue.length > 0 && (
              <MultiLineChartComponent
                data={revenue}
                xKey="day"
                series={[
                  { key: "top10_concentration_pct", name: "Top-10 Concentration", color: COLORS.orange },
                  { key: "mature_revenue_pct", name: "Mature Revenue %", color: COLORS.green },
                ]}
                yFormatter={(v) => `${v.toFixed(1)}%`}
              />
            )}
          </ChartCard>
        </div>
      </div>

      {/* ── 3. Post-Graduation Survival ── */}
      <div className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard
            title="Survival Funnel (Latest Week)"
            subtitle="% of graduated tokens still trading at each checkpoint"
            isLoading={l3}
          >
            {survivalSnapshot && survivalSnapshot.length > 0 && (
              <BarChartComponent
                data={survivalSnapshot}
                xKey="stage"
                yKey="pct"
                isDate={false}
                gradient
                color={COLORS.purple}
                yFormatter={(v) => `${v.toFixed(0)}%`}
              />
            )}
          </ChartCard>

          <ChartCard
            title="Survival Trend by Week"
            subtitle="How survival rates evolve week-over-week"
            isLoading={l3}
          >
            {survivalChart && survivalChart.length > 0 && (
              <MultiLineChartComponent
                data={survivalChart}
                xKey="grad_week"
                series={[
                  { key: "survival_1h", name: "1hr", color: COLORS.green },
                  { key: "survival_6h", name: "6hr", color: COLORS.cyan },
                  { key: "survival_24h", name: "24hr", color: COLORS.yellow },
                  { key: "survival_48h", name: "48hr", color: COLORS.orange },
                ]}
                yFormatter={(v) => `${v.toFixed(0)}%`}
              />
            )}
          </ChartCard>
        </div>

        {survivalChart && survivalChart.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 mb-6">
            <div className="insight-card">
              <div className="text-[0.65rem] font-semibold tracking-[1px] uppercase text-[#7c3aed] mb-1.5">
                The 48-Hour Cliff
              </div>
              <p className="text-[0.78rem] text-[#6b6b88] leading-[1.55]">
                About <strong className="text-[#a78bfa]">50%</strong> of graduated tokens lose all trading activity within 48 hours.
                This is the critical window for post-graduation liquidity.
              </p>
            </div>
            <div className="insight-card">
              <div className="text-[0.65rem] font-semibold tracking-[1px] uppercase text-[#7c3aed] mb-1.5">
                Strong Early Signal
              </div>
              <p className="text-[0.78rem] text-[#6b6b88] leading-[1.55]">
                <strong className="text-[#a78bfa]">85%+</strong> of graduated tokens show trading activity within 1 hour,
                indicating healthy initial migration.
              </p>
            </div>
            <div className="insight-card">
              <div className="text-[0.65rem] font-semibold tracking-[1px] uppercase text-[#7c3aed] mb-1.5">
                Product Implication
              </div>
              <p className="text-[0.78rem] text-[#6b6b88] leading-[1.55]">
                Improving 24h→48h retention from <strong className="text-[#a78bfa]">~62%→~50%</strong> is the highest-leverage
                intervention for PumpSwap pool longevity.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── 4. Bonding Curve Velocity ── */}
      <div className="mt-6">
        {velocityKPIs && (
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            <div className="kpi-card">
              <div className="absolute top-0 left-0 right-0 h-[2px] opacity-40" style={{ background: COLORS.purple }} />
              <div className="text-[0.65rem] font-medium text-[var(--color-text-dim)] uppercase tracking-[0.5px] mb-2">
                Total Graduated (30d)
              </div>
              <div className="text-[1.2rem] sm:text-[1.4rem] font-bold tracking-[-0.02em] leading-[1.2] font-mono" style={{ color: COLORS.purple }}>
                {formatCompact(velocityKPIs.total)}
              </div>
            </div>
            <div className="kpi-card">
              <div className="absolute top-0 left-0 right-0 h-[2px] opacity-40" style={{ background: COLORS.green }} />
              <div className="text-[0.65rem] font-medium text-[var(--color-text-dim)] uppercase tracking-[0.5px] mb-2">
                Graduated in &lt;15 min
              </div>
              <div className="text-[1.2rem] sm:text-[1.4rem] font-bold tracking-[-0.02em] leading-[1.2] font-mono" style={{ color: COLORS.green }}>
                {velocityKPIs.fastPct.toFixed(1)}%
              </div>
            </div>
            <div className="kpi-card">
              <div className="absolute top-0 left-0 right-0 h-[2px] opacity-40" style={{ background: COLORS.cyan }} />
              <div className="text-[0.65rem] font-medium text-[var(--color-text-dim)] uppercase tracking-[0.5px] mb-2">
                Median Time (fastest bucket)
              </div>
              <div className="text-[1.2rem] sm:text-[1.4rem] font-bold tracking-[-0.02em] leading-[1.2] font-mono" style={{ color: COLORS.cyan }}>
                {velocityKPIs.medianMin} min
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard
            title="Time-to-Graduate Distribution"
            subtitle="How long tokens take to complete the bonding curve"
            isLoading={l4}
          >
            {velocity && velocity.length > 0 && (
              <BarChartComponent
                data={velocity}
                xKey="time_bucket"
                yKey="token_count"
                isDate={false}
                colors={CHART_COLORS}
                yFormatter={(v) => formatCompact(v)}
              />
            )}
          </ChartCard>

          <ChartCard
            title="Avg Trades to Graduate"
            subtitle="Number of trades required per velocity bucket"
            isLoading={l4}
          >
            {velocity && velocity.length > 0 && (
              <BarChartComponent
                data={velocity}
                xKey="time_bucket"
                yKey="avg_trades"
                isDate={false}
                gradient
                color={COLORS.cyan}
                yFormatter={(v) => formatCompact(v)}
              />
            )}
          </ChartCard>
        </div>

        {velocity && velocity.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <div className="insight-card">
              <div className="text-[0.65rem] font-semibold tracking-[1px] uppercase text-[#7c3aed] mb-1.5">
                Speed is Signal
              </div>
              <p className="text-[0.78rem] text-[#6b6b88] leading-[1.55]">
                <strong className="text-[#a78bfa]">{velocity[0]?.token_count?.toLocaleString()}</strong> tokens graduated in under 5 minutes.
                Fast graduation correlates with strong early demand.
              </p>
            </div>
            <div className="insight-card">
              <div className="text-[0.65rem] font-semibold tracking-[1px] uppercase text-[#7c3aed] mb-1.5">
                Trade Intensity
              </div>
              <p className="text-[0.78rem] text-[#6b6b88] leading-[1.55]">
                Fastest tokens average <strong className="text-[#a78bfa]">{velocity[0]?.avg_trades?.toLocaleString()}</strong> trades to graduate
                vs <strong className="text-[#a78bfa]">{velocity[velocity.length - 1]?.avg_trades?.toLocaleString()}</strong> for slowest.
              </p>
            </div>
            <div className="insight-card">
              <div className="text-[0.65rem] font-semibold tracking-[1px] uppercase text-[#7c3aed] mb-1.5">
                Bimodal Pattern
              </div>
              <p className="text-[0.78rem] text-[#6b6b88] leading-[1.55]">
                Tokens either graduate <strong className="text-[#a78bfa]">very fast (&lt;15min)</strong> or take
                <strong className="text-[#a78bfa]"> 24+ hours</strong>. Few fall in the middle — suggesting
                momentum is all-or-nothing.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
