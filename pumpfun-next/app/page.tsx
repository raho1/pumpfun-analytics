"use client";

import { useState, useMemo } from "react";
import { Hero } from "@/components/hero";
import { KPIRow } from "@/components/kpi-row";
import { Footer } from "@/components/footer";
import { AnalysisTab } from "@/components/tabs/analysis-tab";
import { OverviewTab } from "@/components/tabs/overview-tab";
import { TradingTab } from "@/components/tabs/trading-tab";
import { RevenueTab } from "@/components/tabs/revenue-tab";
import { FeeOptimizationLab } from "@/components/tabs/fee-optimization-lab";
import { ProtocolHealthTab } from "@/components/tabs/protocol-health-tab";
import { TraderTab } from "@/components/tabs/trader-tab";
import { MEVTab } from "@/components/tabs/mev-tab";
import { FeeAnalyticsTab } from "@/components/tabs/fee-analytics-tab";
import { PumpSwapTab } from "@/components/tabs/pumpswap-tab";
import { CompetitorsTab } from "@/components/tabs/competitors-tab";
import { ProjectionsTab } from "@/components/tabs/projections-tab";
import { DeepDivesTab } from "@/components/tabs/deep-dives-tab";
import { useDuneQuery } from "@/hooks/use-dune-query";
import { useCurrency } from "@/lib/currency-context";
import { formatCurrency, formatCompact, formatPercent } from "@/lib/utils";
import type { DailyVolume, DailyLaunches, GraduationRate, FeeRevenue } from "@/lib/types";

const TAB_GROUPS = [
  {
    label: "Protocol",
    tabs: [
      { key: "overview", label: "Core Activity" },
      { key: "pumpswap", label: "PumpSwap" },
      { key: "revenue", label: "Revenue" },
      { key: "health", label: "Health" },
    ],
  },
  {
    label: "Trading",
    tabs: [
      { key: "trading", label: "Trading" },
      { key: "traders", label: "Traders" },
      { key: "mev", label: "MEV" },
      { key: "fee-lab", label: "Fee Lab" },
    ],
  },
  {
    label: "Strategy",
    tabs: [
      { key: "competitors", label: "Competitors" },
      { key: "projections", label: "Projections" },
      { key: "deep-dives", label: "Deep Dives" },
      { key: "analysis", label: "Analysis" },
    ],
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");
  const { currency, convert, sol } = useCurrency();

  const { data: volume } = useDuneQuery<DailyVolume[]>("daily_volume");
  const { data: launches } = useDuneQuery<DailyLaunches[]>("daily_launches");
  const { data: gradRate } = useDuneQuery<GraduationRate[]>("graduation_rate");
  const { data: feeRevenue } = useDuneQuery<FeeRevenue[]>("fee_revenue");

  const kpis = useMemo(() => {
    // Helper: get the last complete day's value (skip today's partial = last element)
    const latest = <T,>(arr: T[] | undefined, fn: (r: T) => number): { value: number; spark: number[] } => {
      if (!arr || arr.length < 2) return { value: 0, spark: [] };
      const idx = arr.length >= 2 ? arr.length - 2 : 0; // yesterday = last complete day
      const spark = arr.slice(Math.max(0, arr.length - 8), arr.length - 1).map(fn);
      return { value: fn(arr[idx]), spark };
    };

    const vol = latest(volume, (r) => r.volume_sol);
    const lnch = latest(launches, (r) => r.launches);
    const grad = latest(gradRate, (r) => Number(r.grad_rate));
    const traders = latest(volume, (r) => r.unique_traders);
    const fees = latest(feeRevenue, (r) => r.total_fees);

    return [
      { value: lnch.value ? formatCompact(lnch.value) : "~30K", label: "Daily Launches", sparkData: lnch.spark },
      { value: vol.value ? formatCurrency(convert(vol.value), currency) : "~1.1M", label: "Daily Volume", sparkData: vol.spark.map(v => convert(v)) },
      { value: grad.value ? formatPercent(grad.value) : "~1%", label: "Graduation Rate", accent: "#a78bfa", sparkData: grad.spark },
      { value: traders.value ? formatCompact(traders.value) : "~170K", label: "Daily Traders", sparkData: traders.spark },
      { value: fees.value ? formatCurrency(convert(fees.value), currency) : "~13K", label: "Daily Fees", sparkData: fees.spark.map(v => convert(v)) },
      {
        value: sol.price ? `$${sol.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "\u2014",
        label: "SOL Price",
        accent: "#06b6d4",
        delta: sol.change_24h || undefined,
      },
    ];
  }, [volume, launches, gradRate, feeRevenue, sol, currency, convert]);

  return (
    <main className="max-w-[1360px] mx-auto px-4 pb-8">
      <Hero />
      <KPIRow items={kpis} />

      {/* Tab bar — sticky with group labels */}
      <div className="tab-bar">
        {TAB_GROUPS.map((group) => (
          <div key={group.label} className="tab-group">
            <span className="tab-group-label">{group.label}</span>
            <div className="tab-group-buttons">
              {group.tabs.map((tab) => (
                <button
                  key={tab.key}
                  className="tab-trigger"
                  data-active={activeTab === tab.key}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tab content */}
      <div key={activeTab} className="animate-fade-in">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "pumpswap" && <PumpSwapTab />}
        {activeTab === "trading" && <TradingTab />}
        {activeTab === "revenue" && <RevenueTab />}
        {activeTab === "fee-lab" && <FeeOptimizationLab />}
        {activeTab === "health" && <ProtocolHealthTab />}
        {activeTab === "traders" && <TraderTab />}
        {activeTab === "mev" && <MEVTab />}
        {activeTab === "competitors" && <CompetitorsTab />}
        {activeTab === "projections" && <ProjectionsTab />}
        {activeTab === "deep-dives" && <DeepDivesTab />}
        {activeTab === "analysis" && <AnalysisTab />}
      </div>

      <Footer />
    </main>
  );
}
