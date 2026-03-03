"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { CHART_COLORS } from "@/lib/colors";

interface DonutChartProps {
  data: { name: string; value: number }[];
  height?: number;
  colors?: string[];
  valueFormatter?: (v: number) => string;
}

export function DonutChartComponent({
  data,
  height = 300,
  colors = CHART_COLORS,
  valueFormatter,
}: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="80%"
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          labelLine={{ stroke: "#55556a" }}
        >
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={colors[i % colors.length]}
              stroke="#06060b"
              strokeWidth={2}
            />
          ))}
        </Pie>
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
          formatter={(value: unknown) => [
            valueFormatter ? valueFormatter(Number(value)) : `${Number(value).toFixed(1)}%`,
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
