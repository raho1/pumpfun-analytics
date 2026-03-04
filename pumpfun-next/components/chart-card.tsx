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

export function ChartCard({ title, subtitle, note, children, isLoading, className }: ChartCardProps) {
  return (
    <div className={`chart-card ${className ?? ""}`}>
      <div className="mb-3">
        <h4 className="text-[0.75rem] font-medium text-[#7a7a94] uppercase tracking-[0.3px]">
          {title}
        </h4>
        {subtitle && (
          <p className="text-[0.7rem] text-[#44445a] mt-0.5">{subtitle}</p>
        )}
        {note && (
          <p className="text-[0.65rem] text-[#3d3d52] mt-1 italic leading-[1.5]">{note}</p>
        )}
      </div>
      {isLoading ? (
        <div className="skeleton h-[280px] w-full" />
      ) : (
        children
      )}
    </div>
  );
}
