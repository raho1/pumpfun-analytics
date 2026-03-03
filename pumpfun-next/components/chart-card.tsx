"use client";

import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function ChartCard({ title, subtitle, children, isLoading, className }: ChartCardProps) {
  return (
    <div className={`chart-card ${className ?? ""}`}>
      <div className="mb-3">
        <h4 className="text-[0.75rem] font-medium text-[#7a7a94] uppercase tracking-[0.3px]">
          {title}
        </h4>
        {subtitle && (
          <p className="text-[0.7rem] text-[#44445a] mt-0.5">{subtitle}</p>
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
