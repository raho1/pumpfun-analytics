"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { useDuneQuery } from "@/hooks/use-dune-query";
import { SectionHeader } from "@/components/section-header";
import { ChartCard } from "@/components/chart-card";
import { COLORS } from "@/lib/colors";
import { formatCompact, formatPercent, formatDate, formatSOL } from "@/lib/utils";
import { buildForecast, exponentialMA, growthRate } from "@/lib/projections";
import type {
  DailyLaunches,
  DailyVolume,
  FeeRevenue,
  GraduationRate,
  CompetitorDexShare,
} from "@/lib/types";

const FORECAST_DAYS = 30;

const tooltipStyle = {
  background: "#141420",
  border: "1px solid #2d2d4a",
  borderRadius: 8,
  fontSize: 12,
  color: "#e8e8f0",
};

function KPI({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="text-[0.65rem] text-[#55556a] uppercase tracking-[0.3px] mb-1">
        {label}
      </div>
      <div
        className="text-[1.3rem] font-semibold tracking-[-0.02em]"
        style={{ color: accent ?? "#e8e8f0" }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-[0.6rem] text-[#44445a] mt-0.5">{sub}</div>
      )}
    </div>
  );
}

function ForecastChart({
  data,
  yKey,
  projKey,
  upperKey,
  lowerKey,
  trendKey,
  color,
  yFormatter,
  height = 320,
  lastHistDate,
}: {
  data: Record<string, any>[];
  yKey: string;
  projKey: string;
  upperKey: string;
  lowerKey: string;
  trendKey: string;
  color: string;
  yFormatter?: (v: number) => string;
  height?: number;
  lastHistDate: string;
}) {
  const gradientId = `forecast-${yKey}`;
  const bandId = `band-${yKey}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.12} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
          <linearGradient id={bandId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.06} />
            <stop offset="95%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="day"
          tickFormatter={formatDate}
          stroke="rgba(255,255,255,0.04)"
          tick={{ fill: "#55556a", fontSize: 11 }}
        />
        <YAxis
          tickFormatter={yFormatter}
          stroke="rgba(255,255,255,0.04)"
          tick={{ fill: "#55556a", fontSize: 11 }}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: "#8888a0" }}
          itemStyle={{ color: "#e8e8f0" }}
          labelFormatter={(label) => formatDate(String(label))}
          formatter={(value: unknown, name: unknown) => {
            if (name === upperKey || name === lowerKey) return [null, null];
            const formatted = yFormatter
              ? yFormatter(Number(value))
              : Number(value).toLocaleString();
            return [formatted, String(name)];
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 10, color: "#6b6b88" }}
          content={() => (
            <div className="flex items-center justify-center gap-4 text-[10px] text-[#6b6b88] mt-1">
              <span className="flex items-center gap-1">
                <span style={{ width: 14, height: 2, background: color, display: "inline-block" }} />
                Actual
              </span>
              <span className="flex items-center gap-1">
                <span style={{ width: 14, height: 0, borderTop: "2px dashed #55556a", display: "inline-block" }} />
                Trend
              </span>
              <span className="flex items-center gap-1">
                <span style={{ width: 14, height: 0, borderTop: `2px dashed ${COLORS.purple}`, display: "inline-block" }} />
                Forecast
              </span>
              <span className="flex items-center gap-1">
                <span style={{ width: 10, height: 10, background: `${COLORS.purple}22`, border: `1px solid ${COLORS.purple}44`, display: "inline-block" }} />
                Confidence
              </span>
            </div>
          )}
        />
        {/* Confidence band */}
        <Area
          type="monotone"
          dataKey={upperKey}
          stroke="none"
          fill="transparent"
          name={upperKey}
          legendType="none"
        />
        <Area
          type="monotone"
          dataKey={lowerKey}
          stroke="none"
          fill={`url(#${bandId})`}
          name={lowerKey}
          legendType="none"
        />
        {/* Actual values */}
        <Area
          type="monotone"
          dataKey={yKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          name="Actual"
          connectNulls={false}
        />
        {/* Trend line */}
        <Line
          type="monotone"
          dataKey={trendKey}
          stroke="#55556a"
          strokeWidth={1.5}
          strokeDasharray="6 3"
          dot={false}
          name="Trend"
          connectNulls
        />
        {/* Projected line */}
        <Line
          type="monotone"
          dataKey={projKey}
          stroke={COLORS.purple}
          strokeWidth={2}
          strokeDasharray="8 4"
          dot={false}
          name="Forecast"
          connectNulls={false}
        />
        {/* Vertical line at forecast start */}
        <ReferenceLine
          x={lastHistDate}
          stroke="rgba(124,58,237,0.3)"
          strokeDasharray="4 4"
          label={{
            value: "Forecast →",
            position: "insideTopRight",
            fill: "#7c3aed",
            fontSize: 10,
          }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function ProjectionsTab() {
  const { data: launchRaw, isLoading: loadLaunches } =
    useDuneQuery<DailyLaunches[]>("daily_launches");
  const { data: volRaw, isLoading: loadVol } =
    useDuneQuery<DailyVolume[]>("daily_volume");
  const { data: feeRaw, isLoading: loadFees } =
    useDuneQuery<FeeRevenue[]>("fee_revenue");
  const { data: gradRaw, isLoading: loadGrad } =
    useDuneQuery<GraduationRate[]>("graduation_rate");
  const { data: dexRaw, isLoading: loadDex } =
    useDuneQuery<CompetitorDexShare[]>("competitor_dex_share");

  // ── Launch projections ──
  const launchForecast = useMemo(() => {
    if (!launchRaw || launchRaw.length < 14) return null;
    const sorted = [...launchRaw].sort(
      (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime()
    );
    const dates = sorted.map((r) => r.day);
    const values = sorted.map((r) => Number(r.launches));
    return buildForecast(dates, values, FORECAST_DAYS);
  }, [launchRaw]);

  // ── Volume projections ──
  const volForecast = useMemo(() => {
    if (!volRaw || volRaw.length < 14) return null;
    const sorted = [...volRaw].sort(
      (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime()
    );
    const dates = sorted.map((r) => r.day);
    const values = sorted.map((r) => Number(r.volume_sol));
    return buildForecast(dates, values, FORECAST_DAYS);
  }, [volRaw]);

  // ── Revenue projections ──
  const feeForecast = useMemo(() => {
    if (!feeRaw || feeRaw.length < 14) return null;
    const sorted = [...feeRaw].sort(
      (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime()
    );
    const dates = sorted.map((r) => r.day);
    const values = sorted.map((r) => Number(r.total_fees));
    return buildForecast(dates, values, FORECAST_DAYS);
  }, [feeRaw]);

  // ── Trader growth ──
  const traderForecast = useMemo(() => {
    if (!volRaw || volRaw.length < 14) return null;
    const sorted = [...volRaw].sort(
      (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime()
    );
    const dates = sorted.map((r) => r.day);
    const values = sorted.map((r) => Number(r.unique_traders));
    return buildForecast(dates, values, FORECAST_DAYS);
  }, [volRaw]);

  // ── Graduation rate trend ──
  const gradForecast = useMemo(() => {
    if (!gradRaw || gradRaw.length < 14) return null;
    const sorted = [...gradRaw].sort(
      (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime()
    );
    const dates = sorted.map((r) => r.day);
    const values = sorted.map((r) => Number(r.grad_rate));
    return buildForecast(dates, values, FORECAST_DAYS);
  }, [gradRaw]);

  // ── PumpSwap market share trend ──
  const pumpswapShareForecast = useMemo(() => {
    if (!dexRaw || dexRaw.length < 7) return null;
    // Filter to PumpSwap rows only
    const psRows = dexRaw
      .filter((r) => r.dex === "PumpSwap")
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());
    if (psRows.length < 7) return null;
    const dates = psRows.map((r) => r.day);
    const values = psRows.map((r) => Number(r.market_share_pct));
    return buildForecast(dates, values, FORECAST_DAYS);
  }, [dexRaw]);

  // ── Build chart datasets ──
  function mergeForChart(
    forecast: ReturnType<typeof buildForecast> | null
  ): Record<string, any>[] {
    if (!forecast) return [];
    const hist = forecast.historical.map((h) => ({
      day: h.day,
      actual: h.actual,
      trend: h.trend,
      projected: null as number | null,
      upper: null as number | null,
      lower: null as number | null,
    }));
    // Bridge: last historical point connects to first projected
    if (hist.length > 0) {
      const lastH = hist[hist.length - 1];
      lastH.projected = lastH.actual;
      lastH.upper = lastH.actual;
      lastH.lower = lastH.actual;
    }
    const proj = forecast.projected.map((p) => ({
      day: p.day,
      actual: null as number | null,
      trend: p.value,
      projected: p.value,
      upper: p.upper,
      lower: p.lower,
    }));
    return [...hist, ...proj];
  }

  const launchData = useMemo(() => mergeForChart(launchForecast), [launchForecast]);
  const volData = useMemo(() => mergeForChart(volForecast), [volForecast]);
  const feeData = useMemo(() => mergeForChart(feeForecast), [feeForecast]);
  const traderData = useMemo(() => mergeForChart(traderForecast), [traderForecast]);
  const gradData = useMemo(() => mergeForChart(gradForecast), [gradForecast]);
  const psShareData = useMemo(
    () => mergeForChart(pumpswapShareForecast),
    [pumpswapShareForecast]
  );

  const lastHistDate = useMemo(() => {
    if (!launchForecast) return "";
    const h = launchForecast.historical;
    return h[h.length - 1]?.day ?? "";
  }, [launchForecast]);

  // ── Summary KPIs ──
  const summaryKpis = useMemo(() => {
    const proj30dLaunches =
      launchForecast?.projected.reduce((s, p) => s + p.value, 0) ?? 0;
    const proj30dVol =
      volForecast?.projected.reduce((s, p) => s + p.value, 0) ?? 0;
    const proj30dFees =
      feeForecast?.projected.reduce((s, p) => s + p.value, 0) ?? 0;
    const proj30dTraders =
      traderForecast
        ? traderForecast.projected.reduce((s, p) => s + p.value, 0) / FORECAST_DAYS
        : 0;
    const projGrad =
      gradForecast
        ? gradForecast.projected[gradForecast.projected.length - 1]?.value ?? 0
        : 0;
    const projPsShare =
      pumpswapShareForecast
        ? pumpswapShareForecast.projected[
            pumpswapShareForecast.projected.length - 1
          ]?.value ?? 0
        : 0;

    return {
      launches: proj30dLaunches,
      volume: proj30dVol,
      fees: proj30dFees,
      traders: proj30dTraders,
      gradRate: projGrad,
      psShare: projPsShare,
      launchGrowth: launchForecast?.growth,
      volGrowth: volForecast?.growth,
      feeGrowth: feeForecast?.growth,
      launchR2: launchForecast?.regression.r2 ?? 0,
      volR2: volForecast?.regression.r2 ?? 0,
      feeR2: feeForecast?.regression.r2 ?? 0,
    };
  }, [
    launchForecast,
    volForecast,
    feeForecast,
    traderForecast,
    gradForecast,
    pumpswapShareForecast,
  ]);

  const isLoading = loadLaunches || loadVol || loadFees || loadGrad || loadDex;

  function growthBadge(monthly: number | undefined) {
    if (monthly === undefined) return null;
    const color = monthly >= 0 ? COLORS.green : COLORS.red;
    const arrow = monthly >= 0 ? "↑" : "↓";
    return (
      <span style={{ color, fontSize: "0.65rem" }}>
        {arrow} {Math.abs(monthly).toFixed(1)}%/mo
      </span>
    );
  }

  return (
    <div>
      <SectionHeader
        title="Projections & Trend Analysis"
        description="30-day forward projections using linear regression on historical data. Confidence bands widen over the forecast horizon to reflect increasing uncertainty."
        methodology="Each metric is fit with ordinary least-squares linear regression on its full historical window. The trend line (dashed gray) shows the best-fit trajectory. Projections (dashed purple) extend 30 days forward. Confidence bands represent ±1.5σ of residual error, widening with √(1 + t/T) to capture growing uncertainty. R² values indicate how well the linear model fits the data — values below 0.3 suggest high volatility where trend-based projections should be interpreted cautiously."
        sourceLabel="Methodology"
        sourceUrl="https://en.wikipedia.org/wiki/Simple_linear_regression"
      />

      {/* Summary KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <KPI
          label="Proj. 30d Launches"
          value={formatCompact(summaryKpis.launches)}
          sub={growthBadge(summaryKpis.launchGrowth?.monthly)
            ? `${summaryKpis.launchGrowth?.monthly?.toFixed(1)}%/mo`
            : undefined}
          accent={COLORS.cyan}
        />
        <KPI
          label="Proj. 30d Volume"
          value={`${formatSOL(summaryKpis.volume)} SOL`}
          sub={`R² = ${summaryKpis.volR2.toFixed(2)}`}
          accent={COLORS.green}
        />
        <KPI
          label="Proj. 30d Fees"
          value={`${formatSOL(summaryKpis.fees)} SOL`}
          sub={`R² = ${summaryKpis.feeR2.toFixed(2)}`}
          accent={COLORS.purple}
        />
        <KPI
          label="Proj. Avg Traders/d"
          value={formatCompact(Math.round(summaryKpis.traders))}
          accent={COLORS.blue}
        />
        <KPI
          label="Proj. Grad Rate"
          value={formatPercent(summaryKpis.gradRate)}
          sub="30d endpoint"
          accent={COLORS.yellow}
        />
        <KPI
          label="PumpSwap Share"
          value={formatPercent(summaryKpis.psShare)}
          sub="30d projected"
          accent={COLORS.orange}
        />
      </div>

      {/* ── Launch growth ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard
          title="Daily Launches — 30d Forecast"
          subtitle="Token creation trajectory with confidence band"
          note={`R² = ${(launchForecast?.regression.r2 ?? 0).toFixed(3)} · Slope: ${(launchForecast?.regression.slope ?? 0).toFixed(1)} launches/day trend`}
          isLoading={isLoading}
        >
          {launchData.length > 0 && (
            <ForecastChart
              data={launchData}
              yKey="actual"
              projKey="projected"
              upperKey="upper"
              lowerKey="lower"
              trendKey="trend"
              color={COLORS.cyan}
              yFormatter={(v) => formatCompact(v)}
              lastHistDate={lastHistDate}
            />
          )}
        </ChartCard>

        <ChartCard
          title="Daily Volume (SOL) — 30d Forecast"
          subtitle="Trading volume trajectory with confidence band"
          note={`R² = ${(volForecast?.regression.r2 ?? 0).toFixed(3)} · Slope: ${formatSOL(Math.abs(volForecast?.regression.slope ?? 0))} SOL/day trend`}
          isLoading={isLoading}
        >
          {volData.length > 0 && (
            <ForecastChart
              data={volData}
              yKey="actual"
              projKey="projected"
              upperKey="upper"
              lowerKey="lower"
              trendKey="trend"
              color={COLORS.green}
              yFormatter={(v) => formatSOL(v)}
              lastHistDate={lastHistDate}
            />
          )}
        </ChartCard>
      </div>

      {/* ── Revenue & Traders ── */}
      <SectionHeader
        title="Revenue & User Growth"
        description="Fee revenue and unique trader projections help estimate protocol sustainability and growth potential."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard
          title="Daily Fee Revenue (SOL) — 30d Forecast"
          subtitle="Protocol + creator fees combined"
          note={`R² = ${(feeForecast?.regression.r2 ?? 0).toFixed(3)} · Projected 30d total: ${formatSOL(summaryKpis.fees)} SOL`}
          isLoading={isLoading}
        >
          {feeData.length > 0 && (
            <ForecastChart
              data={feeData}
              yKey="actual"
              projKey="projected"
              upperKey="upper"
              lowerKey="lower"
              trendKey="trend"
              color={COLORS.purple}
              yFormatter={(v) => formatSOL(v)}
              lastHistDate={lastHistDate}
            />
          )}
        </ChartCard>

        <ChartCard
          title="Daily Unique Traders — 30d Forecast"
          subtitle="Active unique wallets per day"
          note={`Trend: ${(traderForecast?.regression.slope ?? 0) >= 0 ? "+" : ""}${(traderForecast?.regression.slope ?? 0).toFixed(0)} traders/day`}
          isLoading={isLoading}
        >
          {traderData.length > 0 && (
            <ForecastChart
              data={traderData}
              yKey="actual"
              projKey="projected"
              upperKey="upper"
              lowerKey="lower"
              trendKey="trend"
              color={COLORS.blue}
              yFormatter={(v) => formatCompact(v)}
              lastHistDate={lastHistDate}
            />
          )}
        </ChartCard>
      </div>

      {/* ── Protocol Health Trends ── */}
      <SectionHeader
        title="Protocol Health & Market Position"
        description="Graduation rate and PumpSwap DEX market share trajectories. These metrics reflect protocol stickiness and competitive positioning."
        methodology="Graduation rate is computed as tokens completing the bonding curve ÷ tokens created per day. PumpSwap market share is its volume as a percentage of total Solana DEX volume (via dex_solana.trades spell). Both are fit with linear regression for forward projection."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard
          title="Graduation Rate (%) — 30d Forecast"
          subtitle="% of tokens that complete the bonding curve"
          note={`Current trend: ${(gradForecast?.regression.slope ?? 0) >= 0 ? "+" : ""}${(gradForecast?.regression.slope ?? 0).toFixed(4)}pp/day`}
          isLoading={isLoading}
        >
          {gradData.length > 0 && (
            <ForecastChart
              data={gradData}
              yKey="actual"
              projKey="projected"
              upperKey="upper"
              lowerKey="lower"
              trendKey="trend"
              color={COLORS.yellow}
              yFormatter={(v) => `${v.toFixed(1)}%`}
              lastHistDate={lastHistDate}
            />
          )}
        </ChartCard>

        <ChartCard
          title="PumpSwap DEX Market Share (%) — 30d Forecast"
          subtitle="Share of total Solana DEX volume"
          note={`${pumpswapShareForecast ? `Trend: ${(pumpswapShareForecast.regression.slope ?? 0) >= 0 ? "+" : ""}${(pumpswapShareForecast.regression.slope ?? 0).toFixed(3)}pp/day` : "Loading..."}`}
          isLoading={isLoading}
        >
          {psShareData.length > 0 && (
            <ForecastChart
              data={psShareData}
              yKey="actual"
              projKey="projected"
              upperKey="upper"
              lowerKey="lower"
              trendKey="trend"
              color={COLORS.orange}
              yFormatter={(v) => `${v.toFixed(1)}%`}
              lastHistDate={lastHistDate}
            />
          )}
        </ChartCard>
      </div>

      {/* ── Model Quality ── */}
      <div
        className="rounded-xl px-5 py-4 mb-4"
        style={{
          background: "rgba(124,58,237,0.04)",
          border: "1px solid rgba(124,58,237,0.12)",
        }}
      >
        <div className="text-[0.65rem] font-semibold uppercase tracking-[0.5px] text-[#a78bfa] mb-2">
          Model Quality Summary
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Launches", r2: launchForecast?.regression.r2 },
            { label: "Volume", r2: volForecast?.regression.r2 },
            { label: "Fees", r2: feeForecast?.regression.r2 },
            { label: "Traders", r2: traderForecast?.regression.r2 },
            { label: "Grad Rate", r2: gradForecast?.regression.r2 },
            { label: "PS Share", r2: pumpswapShareForecast?.regression.r2 },
          ].map((m) => {
            const r2 = m.r2 ?? 0;
            const quality =
              r2 >= 0.7 ? "Strong" : r2 >= 0.3 ? "Moderate" : "Weak";
            const color =
              r2 >= 0.7
                ? COLORS.green
                : r2 >= 0.3
                  ? COLORS.yellow
                  : COLORS.red;
            return (
              <div key={m.label}>
                <div className="text-[0.6rem] text-[#55556a] mb-0.5">
                  {m.label}
                </div>
                <div className="text-[0.85rem] font-medium" style={{ color }}>
                  R² = {r2.toFixed(3)}
                </div>
                <div className="text-[0.55rem]" style={{ color }}>
                  {quality} fit
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[0.65rem] text-[#44445a] mt-3 leading-[1.6] max-w-[720px]">
          R² measures how well a linear trend explains the data. Values above
          0.7 indicate a strong, predictable trend. Values below 0.3 suggest the
          metric is volatile and projections should be treated as directional
          only. Crypto markets are inherently unpredictable — these projections
          assume continuation of recent trends and do not account for market
          shocks, regulatory changes, or competitive dynamics.
        </p>
      </div>
    </div>
  );
}
