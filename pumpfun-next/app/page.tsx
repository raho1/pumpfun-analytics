"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
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
import { useSolPrice } from "@/hooks/use-sol-price";
import { formatCompact, formatPercent } from "@/lib/utils";
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
  const tabListRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ start: true, end: false });

  const handleTabScroll = useCallback(() => {
    const el = tabListRef.current;
    if (!el) return;
    setScrollState({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    handleTabScroll();
    const el = tabListRef.current;
    el?.addEventListener("scroll", handleTabScroll, { passive: true });
    return () => el?.removeEventListener("scroll", handleTabScroll);
  }, [handleTabScroll]);

  const { data: volume } = useDuneQuery<DailyVolume[]>("daily_volume");
  const { data: launches } = useDuneQuery<DailyLaunches[]>("daily_launches");
  const { data: gradRate } = useDuneQuery<GraduationRate[]>("graduation_rate");
  const { data: feeRevenue } = useDuneQuery<FeeRevenue[]>("fee_revenue");
  const { sol } = useSolPrice();

  const kpis = useMemo(() => {
    const avgLaunches = launches && launches.length > 0
      ? formatCompact(launches.reduce((s, r) => s + r.launches, 0) / launches.length)
      : "~30K";

    const avgVol = volume && volume.length > 0
      ? formatCompact(volume.reduce((s, r) => s + r.volume_sol, 0) / volume.length)
      : "~1.1M";

    const avgTraders = volume && volume.length > 0
      ? formatCompact(volume.reduce((s, r) => s + r.unique_traders, 0) / volume.length)
      : "~170K";

    const avgGrad = gradRate && gradRate.length > 0
      ? formatPercent(gradRate.reduce((s, r) => s + Number(r.grad_rate), 0) / gradRate.length)
      : "~1%";

    const avgFees = feeRevenue && feeRevenue.length > 0
      ? formatCompact(feeRevenue.reduce((s, r) => s + r.total_fees, 0) / feeRevenue.length)
      : "~13K";

    return [
      { value: avgLaunches, label: "Daily Launches" },
      { value: avgVol, label: "Daily Volume (SOL)" },
      { value: avgGrad, label: "Graduation Rate", accent: "#a78bfa" },
      { value: avgTraders, label: "Daily Traders" },
      { value: avgFees, label: "Daily Fees (SOL)" },
      {
        value: sol.price ? `$${sol.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—",
        label: "SOL Price",
        accent: "#06b6d4",
        delta: sol.change_24h || undefined,
      },
    ];
  }, [volume, launches, gradRate, feeRevenue, sol]);

  return (
    <main className="max-w-[1360px] mx-auto px-4 pb-8">
      <Hero />
      <KPIRow items={kpis} />

      {/* Tabs */}
      <div
        className="tab-list-wrapper mb-5"
        data-scroll-start={scrollState.start}
        data-scroll-end={scrollState.end}
      >
        <div className="tab-list" ref={tabListRef}>
          {TAB_GROUPS.map((group, gi) => (
            <div key={group.label} className="flex items-center gap-0.5">
              {gi > 0 && (
                <div className="w-px h-5 bg-[rgba(255,255,255,0.06)] mx-1 flex-shrink-0" />
              )}
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
          ))}
        </div>
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
