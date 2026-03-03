"use client";

export function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <>
      <div className="flex items-center gap-2.5 text-[1.3rem] font-extrabold tracking-[-0.03em] text-[#e8e8f0] mb-0.5">
        {title}
        <span className="flex-1 h-px bg-gradient-to-r from-[rgba(124,58,237,0.3)] to-transparent" />
      </div>
      <p className="text-[0.85rem] text-[#55556a] mb-5">{description}</p>
    </>
  );
}
