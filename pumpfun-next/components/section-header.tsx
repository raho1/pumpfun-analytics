"use client";

import { useState } from "react";

interface SectionHeaderProps {
  title: string;
  description: string;
  methodology?: string;
  sourceLabel?: string;
  sourceUrl?: string;
}

export function SectionHeader({ title, description, methodology, sourceLabel, sourceUrl }: SectionHeaderProps) {
  const [showMethodology, setShowMethodology] = useState(false);

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-[1.1rem] font-semibold tracking-[-0.02em] text-white">
          {title}
        </h3>
        {methodology && (
          <button
            onClick={() => setShowMethodology(!showMethodology)}
            className="text-[0.6rem] font-medium uppercase tracking-[0.5px] px-2 py-0.5 rounded-full border transition-all cursor-pointer"
            style={{
              color: showMethodology ? "#a78bfa" : "#55556a",
              borderColor: showMethodology ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.08)",
              background: showMethodology ? "rgba(124,58,237,0.08)" : "transparent",
            }}
          >
            {showMethodology ? "Hide" : "Method"}
          </button>
        )}
        {sourceLabel && sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.6rem] font-medium uppercase tracking-[0.5px] px-2 py-0.5 rounded-full border transition-all"
            style={{
              color: "#55556a",
              borderColor: "rgba(255,255,255,0.08)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#06b6d4";
              e.currentTarget.style.borderColor = "rgba(6,182,212,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#55556a";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            }}
          >
            {sourceLabel} ↗
          </a>
        )}
      </div>
      <p className="text-[0.8rem] text-[#55556a] leading-[1.5] max-w-[720px]">{description}</p>
      {methodology && showMethodology && (
        <div
          className="mt-2.5 px-3.5 py-3 rounded-lg text-[0.75rem] leading-[1.6] max-w-[720px]"
          style={{
            background: "rgba(124,58,237,0.04)",
            border: "1px solid rgba(124,58,237,0.12)",
            color: "#7a7a94",
          }}
        >
          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.5px] text-[#a78bfa] block mb-1">
            Methodology
          </span>
          {methodology}
        </div>
      )}
    </div>
  );
}
