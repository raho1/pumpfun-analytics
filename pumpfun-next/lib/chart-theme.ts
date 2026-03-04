export const TOOLTIP_STYLE = {
  contentStyle: {
    background: "#141420",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    fontSize: 12,
    color: "#e8e8f0",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    padding: "10px 14px",
  },
  labelStyle: { color: "#8888a0", fontSize: 11, marginBottom: 4 },
  itemStyle: { color: "#e8e8f0", fontSize: 12 },
  cursor: { stroke: "rgba(255,255,255,0.08)" },
} as const;

export const AXIS_STYLE = {
  stroke: "rgba(255,255,255,0.04)",
  tick: { fill: "#55556a", fontSize: 11 },
} as const;

export const GRID_STYLE = {
  strokeDasharray: "3 3" as const,
  stroke: "rgba(255,255,255,0.04)",
} as const;
