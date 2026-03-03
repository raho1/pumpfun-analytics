"use client";

export function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-5">
      <h3 className="text-[1.1rem] font-semibold tracking-[-0.02em] text-white mb-1">
        {title}
      </h3>
      <p className="text-[0.8rem] text-[#55556a] leading-[1.5] max-w-[720px]">{description}</p>
    </div>
  );
}
