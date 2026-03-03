"use client";

import { useState, useMemo } from "react";
import { useDuneQuery } from "@/hooks/use-dune-query";
import { useSolPrice } from "@/hooks/use-sol-price";
import { ChartCard } from "@/components/chart-card";
import { SectionHeader } from "@/components/section-header";
import { StackedBarChartComponent } from "@/components/charts/stacked-bar-chart";
import { MultiLineChartComponent } from "@/components/charts/multi-line-chart";
import { BarChartComponent } from "@/components/charts/bar-chart";
import { COLORS, STAGE_COLORS, CHART_COLORS } from "@/lib/colors";
import { formatCompact, formatSOL, formatUSD } from "@/lib/utils";
import type { FeeByCurveStage, VariableFeeModel, FeeCurveGranular, FeeVsSurvival } from "@/lib/types";

const PRESET_RATES: Record<string, number[]> = {
  Custom: [0.95, 0.70, 0.40, 0.20, 0.10, 0.05],
  "Flat 1% (Current)": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  "Growth-Optimized (2%→0.5%)": [2.0, 1.5, 1.0, 0.75, 0.5, 0.5],
  "Retention-Optimized (0.5%→2%)": [0.5, 0.75, 1.0, 1.5, 2.0, 2.0],
  "Ascend-Style Sliding": [0.95, 0.70, 0.40, 0.20, 0.10, 0.05],
};

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
