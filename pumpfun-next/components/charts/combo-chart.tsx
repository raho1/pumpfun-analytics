"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatDate } from "@/lib/utils";

const dateLabelFormatter = (label: unknown) => formatDate(String(label));

interface ComboChartProps {
  data: Record<string, any>[];
  xKey: string;
  barKey: string;
  barName: string;
  barColor: string;
  lineKey: string;
  lineName: string;
  lineColor: string;
  height?: number;
  isDate?: boolean;
  barYFormatter?: (v: number) => string;
  lineYFormatter?: (v: number) => string;
}

export function ComboChartComponent({
  data,
  xKey,
  barKey,
  barName,
  barColor,
  lineKey,
  lineName,
  lineColor,
  height = 300,
  isDate = true,
  barYFormatter,
  lineYFormatter,
}: ComboChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey={xKey}
          tickFormatter={isDate ? formatDate : undefined}
          stroke="rgba(255,255,255,0.04)"
          tick={{ fill: "#55556a", fontSize: 11 }}
        />
        <YAxis
          yAxisId="left"
          tickFormatter={barYFormatter}
          stroke="rgba(255,255,255,0.04)"
          tick={{ fill: "#55556a", fontSize: 11 }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={lineYFormatter}
          stroke="rgba(255,255,255,0.04)"
          tick={{ fill: "#55556a", fontSize: 11 }}
        />
        <Tooltip
          contentStyle={{
            background: "#141420",
            border: "1px solid #2d2d4a",
            borderRadius: 8,
            fontSize: 12,
            color: "#e8e8f0",
          }}
          labelFormatter={isDate ? dateLabelFormatter : undefined}
        />
        <Legend wrapperStyle={{ fontSize: 10, color: "#6b6b88" }} />
        <Bar
          yAxisId="left"
          dataKey={barKey}
          name={barName}
          fill={barColor}
          opacity={0.4}
          radius={[4, 4, 0, 0]}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey={lineKey}
          name={lineName}
          stroke={lineColor}
          strokeWidth={2.5}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
