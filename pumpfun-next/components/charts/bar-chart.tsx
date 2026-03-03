"use client";

import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { COLORS } from "@/lib/colors";
import { formatDate } from "@/lib/utils";

const dateLabelFormatter = (label: unknown) => formatDate(String(label));

interface BarChartProps {
  data: Record<string, any>[];
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
  yFormatter?: (v: number) => string;
  isDate?: boolean;
  gradient?: boolean;
  horizontal?: boolean;
  colorByValue?: boolean;
  colors?: string[];
}

export function BarChartComponent({
  data,
  xKey,
  yKey,
  color = COLORS.purple,
  height = 300,
  yFormatter,
  isDate = true,
  gradient = false,
  horizontal = false,
  colorByValue = false,
  colors,
}: BarChartProps) {
  const maxVal = Math.max(...data.map((d) => Math.abs(Number(d[yKey]) || 0)));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        {horizontal ? (
          <>
            <XAxis type="number" tickFormatter={yFormatter} stroke="rgba(255,255,255,0.04)" tick={{ fill: "#55556a", fontSize: 11 }} />
            <YAxis type="category" dataKey={xKey} stroke="rgba(255,255,255,0.04)" tick={{ fill: "#55556a", fontSize: 11 }} width={100} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tickFormatter={isDate ? formatDate : undefined} stroke="rgba(255,255,255,0.04)" tick={{ fill: "#55556a", fontSize: 11 }} />
            <YAxis tickFormatter={yFormatter} stroke="rgba(255,255,255,0.04)" tick={{ fill: "#55556a", fontSize: 11 }} />
          </>
        )}
        <Tooltip
          contentStyle={{
            background: "#141420",
            border: "1px solid #2d2d4a",
            borderRadius: 8,
            fontSize: 12,
            color: "#e8e8f0",
          }}
          labelFormatter={isDate && !horizontal ? dateLabelFormatter : undefined}
          formatter={(value: unknown) => [yFormatter ? yFormatter(Number(value)) : Number(value).toLocaleString(), yKey]}
        />
        <Bar dataKey={yKey} radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => {
            let fill = color;
            if (colors && colors[i]) fill = colors[i];
            else if (colorByValue) {
              const val = Number(entry[yKey]) || 0;
              fill = val >= 0 ? COLORS.green : COLORS.red;
            } else if (gradient) {
              const val = Math.abs(Number(entry[yKey]) || 0);
              const opacity = 0.3 + 0.7 * (val / (maxVal || 1));
              fill = color.replace(")", `,${opacity})`).replace("rgb", "rgba");
              if (!color.startsWith("rgb")) {
                fill = color;
              }
            }
            return <Cell key={i} fill={fill} />;
          })}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
