"use client";

interface KPIItem {
  value: string;
  label: string;
  delta?: number;
  accent?: string;
  sparkData?: number[];
}

function Sparkline({ data, color = "rgba(124,58,237,0.5)" }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 36;
  const h = 14;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="mt-1.5 opacity-60">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KPIRow({ items }: { items: KPIItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 my-5">
      {items.map((item) => (
        <div key={item.label} className="kpi-card">
          <div
            className="absolute top-0 left-0 right-0 h-[2px] opacity-40"
            style={{ background: item.accent ?? "rgba(255,255,255,0.1)" }}
          />
          <div className="text-[0.65rem] font-medium text-[var(--color-text-dim)] uppercase tracking-[0.5px] mb-2">
            {item.label}
          </div>
          <div
            className="text-[1.2rem] sm:text-[1.4rem] font-bold tracking-[-0.02em] leading-[1.2] font-mono"
            style={{ color: item.accent ?? "#fff" }}
          >
            {item.value}
          </div>
          {item.delta != null && (
            <div
              className="text-[0.65rem] font-semibold mt-1.5 font-mono"
              style={{ color: item.delta >= 0 ? "#22c55e" : "#ef4444" }}
            >
              {item.delta >= 0 ? "\u2191" : "\u2193"} {Math.abs(item.delta).toFixed(1)}%
            </div>
          )}
          {item.sparkData && item.sparkData.length >= 2 && (
            <Sparkline data={item.sparkData} color={item.accent ?? "rgba(124,58,237,0.5)"} />
          )}
        </div>
      ))}
    </div>
  );
}
