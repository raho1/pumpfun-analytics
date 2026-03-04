"use client";

import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  note?: string;
  children: ReactNode;
  isLoading?: boolean;
  className?: string;
}

const SKELETON_HEIGHTS = [45, 72, 58, 85, 40, 68, 55, 78, 48, 62, 70, 52];

export function ChartCard({ title, subtitle, note, children, isLoading, className }: ChartCardProps) {
  return (
    <div className={`chart-card flex flex-col ${className ?? ""}`}>
      <div className="mb-4 pb-3 border-b border-[rgba(255,255,255,0.04)]">
        <h4 className="text-[0.75rem] font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.3px]">
          {title}
        </h4>
        {subtitle && (
          <p className="text-[0.7rem] text-[var(--color-text-dimmer)] mt-0.5">{subtitle}</p>
        )}
        {note && (
          <p className="text-[0.65rem] text-[var(--color-text-dimmer)] mt-1 italic leading-[1.5]">{note}</p>
        )}
      </div>
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="h-[260px] sm:h-[280px] w-full flex flex-col justify-end gap-1.5 px-2 pb-6">
            <div className="flex items-end gap-3 flex-1">
              <div className="w-8 flex flex-col justify-between h-full py-2">
                <div className="skeleton h-2 w-full rounded" />
                <div className="skeleton h-2 w-3/4 rounded" />
                <div className="skeleton h-2 w-full rounded" />
              </div>
              <div className="flex-1 flex items-end gap-1">
                {SKELETON_HEIGHTS.map((h, i) => (
                  <div
                    key={i}
                    className="skeleton flex-1 rounded-t"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-6 ml-11">
              <div className="skeleton h-2 w-8 rounded" />
              <div className="skeleton h-2 w-10 rounded" />
              <div className="skeleton h-2 w-8 rounded" />
              <div className="skeleton h-2 w-10 rounded" />
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
