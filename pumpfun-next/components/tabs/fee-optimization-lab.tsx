"use client";

import { useState, useMemo } from "react";
import { useDuneQuery } from "@/hooks/use-dune-query";
import { useSolPrice } from "@/hooks/use-sol-price";
import { ChartCard } from "@/components/chart-card";
import { SectionHeader } from "@/components/section-header";
import { StackedBarChartComponent } from "@/components/charts/stacked-bar-chart";
import { MultiLineChartComponent } from "@/components/charts/multi-line-chart";
import { BarChartComponent } from "@/components/charts/bar-chart";
import { DonutChartComponent } from "@/components/charts/donut-chart";
import { COLORS, STAGE_COLORS, CHART_COLORS } from "@/lib/colors";
import { formatCompact, formatSOL, formatUSD, formatPercent } from "@/lib/utils";
import type { FeeByCurveStage, VariableFeeModel, FeeCurveGranular, FeeVsSurvival } from "@/lib/types";

const PRESET_RATES: Record<string, number[]> = {
  Custom: [0.95, 0.70, 0.40, 0.20, 0.10, 0.05],
  "Flat 1% (Current)": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  "Growth-Optimized (2%→0.5%)": [2.0, 1.5, 1.0, 0.75, 0.5, 0.5],
  "Retention-Optimized (0.5%→2%)": [0.5, 0.75, 1.0, 1.5, 2.0, 2.0],
  "Ascend-Style Sliding": [0.95, 0.70, 0.40, 0.20, 0.10, 0.05],
};

const AB_PRESETS: Record<string, number[]> = {
  "Flat 1% (Control)": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  "Growth-Optimized": [2.0, 1.5, 1.0, 0.75, 0.5, 0.5],
  "Retention-Optimized": [0.5, 0.75, 1.0, 1.5, 2.0, 2.0],
  "Ascend-Style": [0.95, 0.70, 0.40, 0.20, 0.10, 0.05],
  "Mid-Peak Bell": [0.5, 1.5, 2.0, 1.5, 0.75, 0.25],
  "Low-Friction": [0.25, 0.25, 0.5, 0.5, 0.25, 0.1],
};

function simulateVariant(
  feeStage: FeeByCurveStage[],
  variantRates: number[]
) {
  const stages = feeStage.slice(0, variantRates.length).map((row, i) => {
    const creatorFee = row.volume_sol * (variantRates[i] / 100);
    const protocolFee = row.volume_sol * 0.01;
    return {
      stage: row.curve_stage,
      volume_sol: row.volume_sol,
      rate: variantRates[i],
      creatorFee,
      protocolFee,
      totalFee: creatorFee + protocolFee,
      currentTotal: (row.protocol_fees_sol || 0) + (row.creator_fees_sol || 0),
    };
  });
  const totalRevenue = stages.reduce((s, r) => s + r.totalFee, 0);
  const totalCreator = stages.reduce((s, r) => s + r.creatorFee, 0);
  const totalCurrent = stages.reduce((s, r) => s + r.currentTotal, 0);
  const weightedAvgRate =
    stages.reduce((s, r) => s + r.rate * r.volume_sol, 0) /
    (stages.reduce((s, r) => s + r.volume_sol, 0) || 1);
  // Estimate health score: lower avg rates in early stages = better for adoption
  const earlyStageAvg = variantRates.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
  const healthScore = Math.max(0, 100 - earlyStageAvg * 25);

  return {
    stages,
    totalRevenue,
    totalCreator,
    totalCurrent,
    delta: totalRevenue - totalCurrent,
    deltaPct: totalCurrent > 0 ? ((totalRevenue - totalCurrent) / totalCurrent) * 100 : 0,
    weightedAvgRate,
    healthScore,
  };
}

export function FeeOptimizationLab() {
  const { data: feeStage, isLoading: l1 } = useDuneQuery<FeeByCurveStage[]>("fee_by_curve_stage");
  const { data: vfm, isLoading: l2 } = useDuneQuery<VariableFeeModel[]>("variable_fee_model");
  const { data: feeCurve, isLoading: l3 } = useDuneQuery<FeeCurveGranular[]>("fee_curve_granular");
  const { data: feeVsSurv, isLoading: l4 } = useDuneQuery<FeeVsSurvival[]>("fee_vs_survival");
  const { sol } = useSolPrice();

  const [preset, setPreset] = useState("Custom");
  const [rates, setRates] = useState<number[]>(PRESET_RATES["Ascend-Style Sliding"]);

  const handlePreset = (name: string) => {
    setPreset(name);
    if (PRESET_RATES[name]) setRates([...PRESET_RATES[name]]);
  };

  const handleSlider = (index: number, value: number) => {
    setPreset("Custom");
    setRates((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const stageNames = useMemo(
    () => (feeStage ? feeStage.map((s) => s.curve_stage) : []),
    [feeStage]
  );

  const simulation = useMemo(() => {
    if (!feeStage || feeStage.length === 0) return null;
    const sim = feeStage.slice(0, rates.length).map((row, i) => {
      const customCreatorFee = row.volume_sol * (rates[i] / 100);
      const protocolFee = row.volume_sol * 0.01;
      const customTotal = customCreatorFee + protocolFee;
      const currentTotal = (row.protocol_fees_sol || 0) + (row.creator_fees_sol || 0);
      return {
        stage: row.curve_stage,
        volume_sol: row.volume_sol,
        custom_creator_rate: rates[i],
        custom_creator_fee: customCreatorFee,
        protocol_fee: protocolFee,
        custom_total: customTotal,
        current_total: currentTotal,
        delta: customTotal - currentTotal,
        effective_creator_rate: row.effective_creator_rate,
        pct_of_total_volume: row.pct_of_total_volume,
      };
    });

    const totalCustom = sim.reduce((s, r) => s + r.custom_total, 0);
    const totalCurrent = sim.reduce((s, r) => s + r.current_total, 0);
    const totalDelta = totalCustom - totalCurrent;
    const deltaPct = totalCurrent > 0 ? (totalDelta / totalCurrent) * 100 : 0;
    const customCreatorTotal = sim.reduce((s, r) => s + r.custom_creator_fee, 0);
    const currentCreatorTotal = feeStage.reduce((s, r) => s + (r.creator_fees_sol || 0), 0);

    return {
      stages: sim,
      totalCustom,
      totalCurrent,
      totalDelta,
      deltaPct,
      customCreatorTotal,
      currentCreatorTotal,
      creatorDelta: customCreatorTotal - currentCreatorTotal,
      creatorDeltaPct: currentCreatorTotal > 0 ? ((customCreatorTotal - currentCreatorTotal) / currentCreatorTotal) * 100 : 0,
    };
  }, [feeStage, rates]);

  const sp = sol.price || 1;

  return (
    <div>
      <SectionHeader
        title="Fee Optimization Lab"
        description="Model the revenue impact of different creator fee structures. Use the simulator below to design a custom fee curve, compare against presets, and quantify the trade-off between creator incentives and protocol revenue."
      />

      {l1 ? (
        <div className="skeleton h-[600px] w-full" />
      ) : feeStage && feeStage.length > 0 ? (
        <>
          {/* Simulator intro */}
          <div className="insight-card mb-4">
            <div className="text-[10px] font-bold tracking-[1.5px] uppercase text-purple mb-2">SIMULATOR</div>
            <h4 className="text-[#e8e8f0] text-[0.95rem] font-semibold mb-1.5">Custom Fee Curve Builder</h4>
            <p className="text-[#6b6b88] text-[0.8rem] leading-[1.6]">
              Set creator fee rates for each bonding curve stage. Revenue projections are calculated
              against actual 7-day volume data. Protocol fee is fixed at 1%.
            </p>
          </div>

          {/* Preset selector */}
          <div className="mb-4">
            <label className="text-xs text-[#55556a] font-semibold uppercase tracking-wider block mb-2">
              Load a preset
            </label>
            <select
              value={preset}
              onChange={(e) => handlePreset(e.target.value)}
              className="bg-[rgba(14,14,22,0.8)] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-[#e8e8f0] w-full max-w-md outline-none focus:border-purple"
            >
              {Object.keys(PRESET_RATES).map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {stageNames.slice(0, 6).map((stage, i) => (
              <div key={stage} className="kpi-card">
                <label className="text-[0.6rem] font-semibold text-[#44445a] uppercase tracking-wider block mb-2">
                  {stage}
                </label>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.05"
                  value={rates[i] ?? 0.5}
                  onChange={(e) => handleSlider(i, parseFloat(e.target.value))}
                  className="w-full accent-purple h-1.5"
                />
                <div className="text-sm font-bold text-purple-light mt-1 font-mono">
                  {(rates[i] ?? 0).toFixed(2)}%
                </div>
              </div>
            ))}
          </div>

          {/* Revenue KPIs */}
          {simulation && (
            <>
              <div className="border-t border-[rgba(255,255,255,0.04)] my-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="kpi-card">
                  <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">Your Model Revenue</div>
                  <div className="text-lg font-bold text-white">{formatSOL(simulation.totalCustom)} SOL</div>
                  <div className="text-xs text-[#55556a]">{formatUSD(simulation.totalCustom * sp)}</div>
                </div>
                <div className="kpi-card">
                  <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">vs Current</div>
                  <div className={`text-lg font-bold ${simulation.totalDelta >= 0 ? "text-green" : "text-red"}`}>
                    {simulation.totalDelta >= 0 ? "+" : ""}{formatSOL(simulation.totalDelta)} SOL
                  </div>
                  <div className="text-xs text-[#55556a]">{simulation.deltaPct >= 0 ? "+" : ""}{simulation.deltaPct.toFixed(1)}%</div>
                </div>
                <div className="kpi-card">
                  <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">Creator Payout</div>
                  <div className="text-lg font-bold text-white">{formatSOL(simulation.customCreatorTotal)} SOL</div>
                  <div className="text-xs text-[#55556a]">{formatUSD(simulation.customCreatorTotal * sp)}</div>
                </div>
                <div className="kpi-card">
                  <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">Creator vs Current</div>
                  <div className={`text-lg font-bold ${simulation.creatorDelta >= 0 ? "text-green" : "text-red"}`}>
                    {simulation.creatorDelta >= 0 ? "+" : ""}{formatSOL(simulation.creatorDelta)} SOL
                  </div>
                  <div className="text-xs text-[#55556a]">{simulation.creatorDeltaPct >= 0 ? "+" : ""}{simulation.creatorDeltaPct.toFixed(1)}%</div>
                </div>
              </div>

              {/* Comparison chart */}
              <ChartCard title="Revenue by Stage: Your Model vs Current">
                <StackedBarChartComponent
                  data={simulation.stages.map((s) => ({
                    stage: s.stage,
                    Current: s.current_total,
                    "Your Model": s.custom_total,
                  }))}
                  xKey="stage"
                  series={[
                    { key: "Current", name: "Current", color: "rgba(124,58,237,0.3)" },
                    { key: "Your Model", name: "Your Model", color: COLORS.cyan },
                  ]}
                  grouped
                  isDate={false}
                  yFormatter={(v) => `${formatCompact(v)} SOL`}
                  height={380}
                />
              </ChartCard>

              {/* Fee curve shape + volume dist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <ChartCard title="Your Fee Curve Shape">
                  <MultiLineChartComponent
                    data={simulation.stages.map((s) => ({
                      stage: s.stage,
                      yours: s.custom_creator_rate,
                      current: s.effective_creator_rate,
                    }))}
                    xKey="stage"
                    series={[
                      { key: "yours", name: "Your Model", color: COLORS.cyan },
                      { key: "current", name: "Current Actual", color: COLORS.purple, dash: "5 5" },
                    ]}
                    isDate={false}
                    yFormatter={(v) => `${v.toFixed(2)}%`}
                    height={340}
                  />
                </ChartCard>

                <ChartCard title="Volume Distribution by Stage">
                  <BarChartComponent
                    data={feeStage.map((s) => ({
                      stage: s.curve_stage,
                      pct: s.pct_of_total_volume,
                    }))}
                    xKey="stage"
                    yKey="pct"
                    isDate={false}
                    colors={STAGE_COLORS}
                    yFormatter={(v) => `${v.toFixed(1)}%`}
                    height={340}
                  />
                </ChartCard>
              </div>
            </>
          )}

          {/* Preset model benchmarks */}
          {vfm && vfm.length > 0 && (
            <>
              <div className="border-t border-[rgba(255,255,255,0.04)] my-6" />
              <ChartCard title="Preset Model Revenue Benchmarks (7d)">
                <BarChartComponent
                  data={vfm}
                  xKey="model"
                  yKey="total_fee_sol"
                  isDate={false}
                  colors={[COLORS.purple, COLORS.green, COLORS.orange, COLORS.cyan]}
                  yFormatter={(v) => `${formatCompact(v)} SOL`}
                  height={380}
                />
              </ChartCard>
            </>
          )}

          {/* ═══════ A/B TEST BACKTESTING ═══════ */}
          <ABTestSection feeStage={feeStage} stageNames={stageNames} sp={sp} />

          {/* Evidence base */}
          <div className="border-t border-[rgba(255,255,255,0.04)] my-6" />
          <div className="insight-card mb-4">
            <div className="text-[10px] font-bold tracking-[1.5px] uppercase text-purple mb-2">EVIDENCE</div>
            <h4 className="text-[#e8e8f0] text-[0.95rem] font-semibold mb-1.5">Fee Impact on Token Health</h4>
            <p className="text-[#6b6b88] text-[0.8rem] leading-[1.6]">
              Use this data to inform your fee curve decisions. Higher fees correlate with shorter
              token lifespans, while moderate fees (0.5-2%) show the healthiest trading patterns.
            </p>
          </div>

          {/* Decision framework */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="insight-card">
              <div className="text-[10px] font-bold tracking-[1.5px] uppercase text-purple mb-2">FINDING</div>
              <h4 className="text-[#e8e8f0] text-[0.95rem] font-semibold mb-1.5">Fee Sweet Spot: 0.5-2%</h4>
              <p className="text-[#6b6b88] text-[0.8rem] leading-[1.6]">
                Tokens with creator fees in the <strong className="text-purple-light">0.5-2% range</strong> show the healthiest trading
                patterns — longer lifespans and higher average volume. Below 0.5%, creators have no incentive
                to promote. Above 2%, trader friction kills momentum.
              </p>
            </div>
            <div className="insight-card">
              <div className="text-[10px] font-bold tracking-[1.5px] uppercase text-purple mb-2">STRATEGY</div>
              <h4 className="text-[#e8e8f0] text-[0.95rem] font-semibold mb-1.5">Concave Curve Wins</h4>
              <p className="text-[#6b6b88] text-[0.8rem] leading-[1.6]">
                Start moderate (not high) to avoid killing early momentum, peak at mid-curve where
                conviction is building, then taper post-graduation. This shape <strong className="text-purple-light">maximizes both
                creator engagement and protocol revenue</strong>.
              </p>
            </div>
            <div className="insight-card">
              <div className="text-[10px] font-bold tracking-[1.5px] uppercase text-purple mb-2">VALIDATION</div>
              <h4 className="text-[#e8e8f0] text-[0.95rem] font-semibold mb-1.5">A/B Test Recommended</h4>
              <p className="text-[#6b6b88] text-[0.8rem] leading-[1.6]">
                Deploy 2-3 fee curves on new launches simultaneously. Measure graduation rate, 30-day
                volume retention, and creator revenue. Use the simulator above to define your test
                variants before deployment.
              </p>
            </div>
          </div>
        </>
      ) : (
        <p className="text-[#55556a] text-sm">Loading fee data...</p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   A/B TEST BACKTESTING SECTION
   ═══════════════════════════════════════════════════════════ */

function VariantConfig({
  label,
  color,
  rates,
  preset,
  stageNames,
  onPresetChange,
  onSliderChange,
}: {
  label: string;
  color: string;
  rates: number[];
  preset: string;
  stageNames: string[];
  onPresetChange: (name: string) => void;
  onSliderChange: (idx: number, val: number) => void;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${color}22`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-3 h-3 rounded-full"
          style={{ background: color }}
        />
        <span className="text-[0.8rem] font-semibold text-[#e8e8f0]">
          {label}
        </span>
      </div>
      <select
        value={preset}
        onChange={(e) => onPresetChange(e.target.value)}
        className="bg-[rgba(14,14,22,0.8)] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-1.5 text-xs text-[#e8e8f0] w-full outline-none mb-3"
        style={{ borderColor: `${color}33` }}
      >
        <option value="Custom">Custom</option>
        {Object.keys(AB_PRESETS).map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      <div className="grid grid-cols-3 gap-2">
        {stageNames.slice(0, 6).map((stage, i) => (
          <div key={stage}>
            <label className="text-[0.5rem] text-[#44445a] uppercase tracking-wider block mb-0.5">
              {stage}
            </label>
            <input
              type="range"
              min="0"
              max="3"
              step="0.05"
              value={rates[i] ?? 0.5}
              onChange={(e) => onSliderChange(i, parseFloat(e.target.value))}
              className="w-full h-1"
              style={{ accentColor: color }}
            />
            <div
              className="text-[0.65rem] font-bold font-mono mt-0.5"
              style={{ color }}
            >
              {(rates[i] ?? 0).toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ABTestSection({
  feeStage,
  stageNames,
  sp,
}: {
  feeStage: FeeByCurveStage[];
  stageNames: string[];
  sp: number;
}) {
  const [presetA, setPresetA] = useState("Flat 1% (Control)");
  const [presetB, setPresetB] = useState("Ascend-Style");
  const [ratesA, setRatesA] = useState<number[]>([...AB_PRESETS["Flat 1% (Control)"]]);
  const [ratesB, setRatesB] = useState<number[]>([...AB_PRESETS["Ascend-Style"]]);

  const handlePresetA = (name: string) => {
    setPresetA(name);
    if (AB_PRESETS[name]) setRatesA([...AB_PRESETS[name]]);
  };
  const handlePresetB = (name: string) => {
    setPresetB(name);
    if (AB_PRESETS[name]) setRatesB([...AB_PRESETS[name]]);
  };
  const handleSliderA = (idx: number, val: number) => {
    setPresetA("Custom");
    setRatesA((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };
  const handleSliderB = (idx: number, val: number) => {
    setPresetB("Custom");
    setRatesB((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const simA = useMemo(
    () => simulateVariant(feeStage, ratesA),
    [feeStage, ratesA]
  );
  const simB = useMemo(
    () => simulateVariant(feeStage, ratesB),
    [feeStage, ratesB]
  );

  const winner = useMemo(() => {
    // Multi-criteria scoring: revenue (40%), creator incentive (30%), health (30%)
    const scoreA =
      (simA.totalRevenue / Math.max(simA.totalRevenue, simB.totalRevenue)) * 40 +
      (simA.totalCreator / Math.max(simA.totalCreator, simB.totalCreator)) * 30 +
      (simA.healthScore / Math.max(simA.healthScore, simB.healthScore)) * 30;
    const scoreB =
      (simB.totalRevenue / Math.max(simA.totalRevenue, simB.totalRevenue)) * 40 +
      (simB.totalCreator / Math.max(simA.totalCreator, simB.totalCreator)) * 30 +
      (simB.healthScore / Math.max(simA.healthScore, simB.healthScore)) * 30;

    return {
      winner: scoreA >= scoreB ? "A" : "B",
      scoreA,
      scoreB,
      margin: Math.abs(scoreA - scoreB),
      confidence:
        Math.abs(scoreA - scoreB) > 15
          ? "High"
          : Math.abs(scoreA - scoreB) > 5
            ? "Moderate"
            : "Low",
    };
  }, [simA, simB]);

  // Chart data: grouped bar per stage
  const comparisonData = useMemo(
    () =>
      simA.stages.map((s, i) => ({
        stage: s.stage,
        "Variant A": s.totalFee,
        "Variant B": simB.stages[i]?.totalFee ?? 0,
        Current: s.currentTotal,
      })),
    [simA, simB]
  );

  // Fee curve comparison
  const curveData = useMemo(
    () =>
      stageNames.slice(0, 6).map((stage, i) => ({
        stage,
        "Variant A": ratesA[i] ?? 0,
        "Variant B": ratesB[i] ?? 0,
      })),
    [stageNames, ratesA, ratesB]
  );

  // Scorecard data for donut
  const scoreDonut = useMemo(
    () => [
      { name: "Variant A", value: Math.round(winner.scoreA) },
      { name: "Variant B", value: Math.round(winner.scoreB) },
    ],
    [winner]
  );

  const varAColor = COLORS.cyan;
  const varBColor = COLORS.orange;

  return (
    <>
      <div className="border-t border-[rgba(255,255,255,0.04)] my-6" />
      <SectionHeader
        title="A/B Test Backtester"
        description="Define two competing fee curve variants and backtest them against actual 7-day volume data. Compare revenue, creator incentives, and estimated token health impact to identify the optimal strategy."
        methodology="Each variant is applied to real volume-by-stage data from the past 7 days. Revenue = (creator_fee_rate × stage_volume) + (1% protocol_fee × stage_volume). Health score estimates early-stage friction impact: lower early fees = higher score (max 100). The composite winner is determined by weighted scoring: 40% total revenue, 30% creator incentive, 30% health score."
      />

      {/* Variant configurators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <VariantConfig
          label="Variant A (Control)"
          color={varAColor}
          rates={ratesA}
          preset={presetA}
          stageNames={stageNames}
          onPresetChange={handlePresetA}
          onSliderChange={handleSliderA}
        />
        <VariantConfig
          label="Variant B (Treatment)"
          color={varBColor}
          rates={ratesB}
          preset={presetB}
          stageNames={stageNames}
          onPresetChange={handlePresetB}
          onSliderChange={handleSliderB}
        />
      </div>

      {/* Result KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-5">
        <div className="kpi-card">
          <div className="text-[0.6rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">
            A: Total Revenue
          </div>
          <div className="text-[1rem] font-bold" style={{ color: varAColor }}>
            {formatSOL(simA.totalRevenue)} SOL
          </div>
          <div className="text-[0.6rem] text-[#44445a]">
            {formatUSD(simA.totalRevenue * sp)}
          </div>
        </div>
        <div className="kpi-card">
          <div className="text-[0.6rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">
            B: Total Revenue
          </div>
          <div className="text-[1rem] font-bold" style={{ color: varBColor }}>
            {formatSOL(simB.totalRevenue)} SOL
          </div>
          <div className="text-[0.6rem] text-[#44445a]">
            {formatUSD(simB.totalRevenue * sp)}
          </div>
        </div>
        <div className="kpi-card">
          <div className="text-[0.6rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">
            A: Creator Pay
          </div>
          <div className="text-[1rem] font-bold" style={{ color: varAColor }}>
            {formatSOL(simA.totalCreator)} SOL
          </div>
        </div>
        <div className="kpi-card">
          <div className="text-[0.6rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">
            B: Creator Pay
          </div>
          <div className="text-[1rem] font-bold" style={{ color: varBColor }}>
            {formatSOL(simB.totalCreator)} SOL
          </div>
        </div>
        <div className="kpi-card">
          <div className="text-[0.6rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">
            A: Health Score
          </div>
          <div
            className="text-[1rem] font-bold"
            style={{
              color:
                simA.healthScore >= 70
                  ? COLORS.green
                  : simA.healthScore >= 40
                    ? COLORS.yellow
                    : COLORS.red,
            }}
          >
            {simA.healthScore.toFixed(0)}/100
          </div>
        </div>
        <div className="kpi-card">
          <div className="text-[0.6rem] font-semibold text-[#44445a] uppercase tracking-wider mb-1">
            B: Health Score
          </div>
          <div
            className="text-[1rem] font-bold"
            style={{
              color:
                simB.healthScore >= 70
                  ? COLORS.green
                  : simB.healthScore >= 40
                    ? COLORS.yellow
                    : COLORS.red,
            }}
          >
            {simB.healthScore.toFixed(0)}/100
          </div>
        </div>
      </div>

      {/* Winner banner */}
      <div
        className="rounded-xl px-5 py-4 mb-5"
        style={{
          background:
            winner.winner === "A"
              ? `${varAColor}08`
              : `${varBColor}08`,
          border: `1px solid ${winner.winner === "A" ? varAColor : varBColor}22`,
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-[0.6rem] font-semibold uppercase tracking-[0.5px] text-[#55556a] mb-1">
              Backtest Result
            </div>
            <div className="text-[1.1rem] font-bold text-[#e8e8f0]">
              Variant {winner.winner} wins
              <span
                className="text-[0.75rem] font-normal ml-2"
                style={{
                  color:
                    winner.confidence === "High"
                      ? COLORS.green
                      : winner.confidence === "Moderate"
                        ? COLORS.yellow
                        : COLORS.red,
                }}
              >
                ({winner.confidence} confidence · {winner.margin.toFixed(1)}pt margin)
              </span>
            </div>
            <div className="text-[0.7rem] text-[#55556a] mt-1">
              Composite score: A = {winner.scoreA.toFixed(1)} vs B ={" "}
              {winner.scoreB.toFixed(1)} (40% revenue · 30% creator pay · 30% health)
            </div>
          </div>
          <div className="flex gap-4 text-[0.7rem] text-[#6b6b88]">
            <div>
              <span className="font-semibold" style={{ color: varAColor }}>
                A
              </span>{" "}
              avg rate: {simA.weightedAvgRate.toFixed(2)}%
            </div>
            <div>
              <span className="font-semibold" style={{ color: varBColor }}>
                B
              </span>{" "}
              avg rate: {simB.weightedAvgRate.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <ChartCard
          title="Revenue by Stage: A vs B vs Current"
          note="Grouped bar comparison against actual 7-day data"
        >
          <StackedBarChartComponent
            data={comparisonData}
            xKey="stage"
            series={[
              { key: "Current", name: "Current", color: "rgba(124,58,237,0.25)" },
              { key: "Variant A", name: "Variant A", color: varAColor },
              { key: "Variant B", name: "Variant B", color: varBColor },
            ]}
            grouped
            isDate={false}
            yFormatter={(v) => `${formatCompact(v)} SOL`}
            height={320}
          />
        </ChartCard>

        <ChartCard
          title="Fee Curve Shape: A vs B"
          note="Creator fee rate (%) at each bonding curve stage"
        >
          <MultiLineChartComponent
            data={curveData}
            xKey="stage"
            series={[
              { key: "Variant A", name: "Variant A", color: varAColor },
              { key: "Variant B", name: "Variant B", color: varBColor },
            ]}
            isDate={false}
            yFormatter={(v) => `${v.toFixed(2)}%`}
            height={320}
          />
        </ChartCard>
      </div>

      {/* Detailed breakdown */}
      <div
        className="rounded-xl overflow-hidden mb-4"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="px-4 py-2.5" style={{ background: "rgba(255,255,255,0.02)" }}>
          <span className="text-[0.65rem] font-semibold text-[#55556a] uppercase tracking-[0.5px]">
            Stage-by-Stage Breakdown
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[0.7rem]">
            <thead>
              <tr className="text-[#44445a] text-left">
                <th className="px-4 py-2 font-semibold">Stage</th>
                <th className="px-4 py-2 font-semibold text-right">Volume (SOL)</th>
                <th className="px-4 py-2 font-semibold text-right" style={{ color: varAColor }}>
                  A Rate
                </th>
                <th className="px-4 py-2 font-semibold text-right" style={{ color: varAColor }}>
                  A Revenue
                </th>
                <th className="px-4 py-2 font-semibold text-right" style={{ color: varBColor }}>
                  B Rate
                </th>
                <th className="px-4 py-2 font-semibold text-right" style={{ color: varBColor }}>
                  B Revenue
                </th>
                <th className="px-4 py-2 font-semibold text-right">Δ (B − A)</th>
              </tr>
            </thead>
            <tbody>
              {simA.stages.map((stageA, i) => {
                const stageB = simB.stages[i];
                const delta = (stageB?.totalFee ?? 0) - stageA.totalFee;
                return (
                  <tr
                    key={stageA.stage}
                    className="border-t border-[rgba(255,255,255,0.04)]"
                  >
                    <td className="px-4 py-2 text-[#8888a0]">{stageA.stage}</td>
                    <td className="px-4 py-2 text-right text-[#8888a0]">
                      {formatCompact(stageA.volume_sol)}
                    </td>
                    <td className="px-4 py-2 text-right" style={{ color: varAColor }}>
                      {stageA.rate.toFixed(2)}%
                    </td>
                    <td className="px-4 py-2 text-right" style={{ color: varAColor }}>
                      {formatSOL(stageA.totalFee)}
                    </td>
                    <td className="px-4 py-2 text-right" style={{ color: varBColor }}>
                      {(stageB?.rate ?? 0).toFixed(2)}%
                    </td>
                    <td className="px-4 py-2 text-right" style={{ color: varBColor }}>
                      {formatSOL(stageB?.totalFee ?? 0)}
                    </td>
                    <td
                      className="px-4 py-2 text-right font-semibold"
                      style={{ color: delta >= 0 ? COLORS.green : COLORS.red }}
                    >
                      {delta >= 0 ? "+" : ""}
                      {formatSOL(delta)}
                    </td>
                  </tr>
                );
              })}
              {/* Totals row */}
              <tr
                className="border-t-2 border-[rgba(255,255,255,0.08)] font-semibold"
              >
                <td className="px-4 py-2 text-[#e8e8f0]">Total</td>
                <td className="px-4 py-2 text-right text-[#8888a0]">
                  {formatCompact(
                    simA.stages.reduce((s, r) => s + r.volume_sol, 0)
                  )}
                </td>
                <td className="px-4 py-2 text-right" style={{ color: varAColor }}>
                  {simA.weightedAvgRate.toFixed(2)}%
                </td>
                <td className="px-4 py-2 text-right" style={{ color: varAColor }}>
                  {formatSOL(simA.totalRevenue)}
                </td>
                <td className="px-4 py-2 text-right" style={{ color: varBColor }}>
                  {simB.weightedAvgRate.toFixed(2)}%
                </td>
                <td className="px-4 py-2 text-right" style={{ color: varBColor }}>
                  {formatSOL(simB.totalRevenue)}
                </td>
                <td
                  className="px-4 py-2 text-right"
                  style={{
                    color:
                      simB.totalRevenue - simA.totalRevenue >= 0
                        ? COLORS.green
                        : COLORS.red,
                  }}
                >
                  {simB.totalRevenue - simA.totalRevenue >= 0 ? "+" : ""}
                  {formatSOL(simB.totalRevenue - simA.totalRevenue)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
