"use client";

interface KPIItem {
  value: string;
  label: string;
  delta?: number;
  accent?: string;
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
        </div>
      ))}
    </div>
  );
}
