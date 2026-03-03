"use client";

import {
  ResponsiveContainer,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { COLORS } from "@/lib/colors";
import { formatDate } from "@/lib/utils";

const dateLabelFormatter = (label: unknown) => formatDate(String(label));

interface AreaChartProps {
  data: Record<string, any>[];
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
  yFormatter?: (v: number) => string;
  isDate?: boolean;
}

export function AreaChartComponent({
  data,
  xKey,
  yKey,
  color = COLORS.cyan,
  height = 300,
  yFormatter,
  isDate = true,
}: AreaChartProps) {
  const gradientId = `grad-${yKey}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.15} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey={xKey}
          tickFormatter={isDate ? formatDate : undefined}
          stroke="rgba(255,255,255,0.04)"
          tick={{ fill: "#55556a", fontSize: 11 }}
        />
        <YAxis
          tickFormatter={yFormatter}
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
          labelStyle={{ color: "#8888a0" }}
          itemStyle={{ color: "#e8e8f0" }}
          labelFormatter={isDate ? dateLabelFormatter : undefined}
          formatter={(value: unknown) => [yFormatter ? yFormatter(Number(value)) : Number(value).toLocaleString(), yKey]}
        />
        <Area
          type="monotone"
          dataKey={yKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
