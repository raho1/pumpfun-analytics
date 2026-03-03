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
            className="text-[1.4rem] font-bold tracking-[-0.02em] leading-[1.2] font-mono"
            style={{ color: item.accent ?? "#fff" }}
          >
            {item.value}
          </div>
          <div className="text-[0.65rem] font-medium text-[#55556a] uppercase tracking-[0.5px] mt-1.5">
            {item.label}
          </div>
          {item.delta != null && (
            <div
              className="text-[0.65rem] font-semibold mt-1 font-mono"
              style={{ color: item.delta >= 0 ? "#22c55e" : "#ef4444" }}
            >
              {item.delta >= 0 ? "+" : ""}{item.delta.toFixed(1)}%
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
