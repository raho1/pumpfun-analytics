"use client";

import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  children: ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function ChartCard({ title, children, isLoading, className }: ChartCardProps) {
  return (
    <div className={`chart-card ${className ?? ""}`}>
      <h4 className="text-[0.8rem] font-semibold text-[#8888a0] uppercase tracking-[0.5px] mb-3">
        {title}
      </h4>
      {isLoading ? (
        <div className="space-y-3">
          <div className="skeleton h-[300px] w-full" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}
