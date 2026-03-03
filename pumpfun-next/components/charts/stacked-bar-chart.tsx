"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatDate } from "@/lib/utils";

const dateLabelFormatter = (label: unknown) => formatDate(String(label));

interface Series {
  key: string;
  name: string;
  color: string;
}

interface StackedBarChartProps {
  data: Record<string, any>[];
  xKey: string;
  series: Series[];
  height?: number;
  yFormatter?: (v: number) => string;
  isDate?: boolean;
  grouped?: boolean;
}

export function StackedBarChartComponent({
  data,
  xKey,
  series,
  height = 300,
  yFormatter,
  isDate = true,
  grouped = false,
}: StackedBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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
          labelFormatter={isDate ? dateLabelFormatter : undefined}
          formatter={(value: unknown, name: unknown) => [yFormatter ? yFormatter(Number(value)) : Number(value).toLocaleString(), String(name)]}
        />
        <Legend
          wrapperStyle={{ fontSize: 10, color: "#6b6b88" }}
        />
        {series.map((s) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.name}
            stackId={grouped ? undefined : "stack"}
            fill={s.color}
            opacity={0.75}
            radius={[2, 2, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
