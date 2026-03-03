"use client";

interface KPIItem {
  icon: string;
  value: string;
  label: string;
  delta?: number;
  glow?: "purple" | "green" | "cyan";
}

export function KPIRow({ items }: { items: KPIItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 my-6">
      {items.map((item) => (
        <div key={item.label} className="kpi-card">
          <div className="text-lg mb-1.5 opacity-70">{item.icon}</div>
          <div
            className="text-[1.6rem] font-extrabold tracking-[-0.03em] leading-[1.2]"
            style={{
              color:
                item.glow === "purple"
                  ? "#a78bfa"
                  : item.glow === "green"
                  ? "#22c55e"
                  : item.glow === "cyan"
                  ? "#06b6d4"
                  : "#fff",
            }}
          >
            {item.value}
          </div>
          <div className="text-[0.65rem] font-semibold text-[#44445a] uppercase tracking-[0.8px] mt-1">
            {item.label}
          </div>
          {item.delta !== undefined && item.delta !== null && (
            <div
              className="text-[0.7rem] font-semibold mt-1 font-mono"
              style={{ color: item.delta >= 0 ? "#22c55e" : "#ef4444" }}
            >
              {item.delta >= 0 ? "+" : ""}
              {item.delta.toFixed(1)}%
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
