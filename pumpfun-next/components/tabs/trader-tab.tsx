"use client";

import { useDuneQuery } from "@/hooks/use-dune-query";
import { ChartCard } from "@/components/chart-card";
import { SectionHeader } from "@/components/section-header";
import { DataTable } from "@/components/charts/data-table";
import { BarChartComponent } from "@/components/charts/bar-chart";
import { COLORS } from "@/lib/colors";
import { shortenAddress, formatCompact } from "@/lib/utils";
import type { TopTraderPnl, WhaleTracker } from "@/lib/types";

export function TraderTab() {
  const { data: pnl, isLoading: l1 } = useDuneQuery<TopTraderPnl[]>("top_traders_pnl");
  const { data: whales, isLoading: l2 } = useDuneQuery<WhaleTracker[]>("whale_tracker");

  return (
    <div>
      <SectionHeader
        title="Trader Intelligence"
        description="Wallet-level PnL analysis and whale tracking. With the trader cashback model and creator fee sharing, understanding who profits -- and who doesn't -- is essential."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Top Traders by PnL (7d)" isLoading={l1}>
          {pnl && pnl.length > 0 && (
            <DataTable
              data={pnl}
              columns={[
                { key: "trader", label: "Trader", format: "address" },
                { key: "pnl", label: "PnL (SOL)", format: "sol", align: "right" },
                { key: "roi", label: "ROI %", format: "percent", align: "right" },
                { key: "spent", label: "Spent", format: "sol", align: "right" },
                { key: "received", label: "Received", format: "sol", align: "right" },
                { key: "tokens", label: "Tokens", format: "number", align: "right" },
              ]}
            />
          )}
        </ChartCard>

        <ChartCard title="Whale Tracker (7d)" isLoading={l2}>
          {whales && whales.length > 0 && (
            <DataTable
              data={whales}
              columns={[
                { key: "trader", label: "Trader", format: "address" },
                { key: "volume", label: "Volume (SOL)", format: "sol", align: "right" },
                { key: "pnl", label: "PnL (SOL)", format: "sol", align: "right" },
                { key: "tokens", label: "Tokens", format: "number", align: "right" },
                { key: "trades", label: "Trades", format: "number", align: "right" },
              ]}
            />
          )}
        </ChartCard>
      </div>

      {pnl && pnl.length > 0 && (
        <div className="mt-4">
          <ChartCard title="PnL Distribution - Top 20 Traders">
            <BarChartComponent
              data={pnl.slice(0, 20).map((d) => ({
                trader: shortenAddress(d.trader),
                pnl: d.pnl,
              }))}
              xKey="trader"
              yKey="pnl"
              isDate={false}
              colorByValue
              yFormatter={(v) => formatCompact(v)}
            />
          </ChartCard>
        </div>
      )}
    </div>
  );
}
