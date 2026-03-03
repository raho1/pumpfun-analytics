"use client";

export function Footer() {
  return (
    <div className="text-center py-8 border-t border-[rgba(255,255,255,0.04)] mt-10">
      <p className="text-[#44445a] text-[0.75rem]">
        Built by <span className="text-[#7a7a94]">Ryan Holloway</span>{" "}
        <span className="text-[#33334a] mx-1">/</span>{" "}
        Powered by{" "}
        <a href="https://dune.com" target="_blank" className="text-[#7a7a94] hover:text-[#a78bfa] transition-colors">
          Dune Analytics
        </a>
      </p>
    </div>
  );
}
