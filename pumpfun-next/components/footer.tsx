"use client";

export function Footer() {
  return (
    <div className="text-center py-10 border-t border-[rgba(255,255,255,0.04)] mt-12">
      <p className="text-[var(--color-text-dimmer)] text-[0.75rem] leading-[1.8]">
        Built by{" "}
        <a
          href="https://github.com/raho1"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-text-muted)] hover:text-[var(--color-purple-light)] transition-colors"
        >
          Ryan Holloway
        </a>
        <span className="text-[#33334a] mx-2">/</span>
        Powered by{" "}
        <a
          href="https://dune.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-text-muted)] hover:text-[var(--color-purple-light)] transition-colors"
        >
          Dune Analytics
        </a>
        <span className="text-[#33334a] mx-2">/</span>
        <a
          href="https://github.com/raho1/pumpfun-analytics"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] transition-colors"
        >
          Source
        </a>
      </p>
    </div>
  );
}
