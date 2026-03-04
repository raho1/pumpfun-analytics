export function formatSOL(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
  return val.toFixed(0);
}

export function formatUSD(val: number): string {
  if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`;
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
  return `$${val.toFixed(0)}`;
}

export function formatCompact(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
  return val.toLocaleString();
}

export function formatPercent(val: number, decimals = 1): string {
  return `${val.toFixed(decimals)}%`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function shortenAddress(addr: string): string {
  if (!addr || addr.length <= 10) return addr || "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export type CurrencyType = "SOL" | "USD" | "PUMP";

export function formatCurrency(val: number, currency: CurrencyType): string {
  if (currency === "USD") {
    if (val >= 1_000_000_000_000) return `$${(val / 1_000_000_000_000).toFixed(1)}T`;
    if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`;
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
    if (val >= 1) return `$${val.toFixed(0)}`;
    return `$${val.toFixed(2)}`;
  }
  if (currency === "PUMP") {
    if (val >= 1_000_000_000_000) return `${(val / 1_000_000_000_000).toFixed(1)}T PUMP`;
    if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}B PUMP`;
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M PUMP`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K PUMP`;
    return `${val.toLocaleString(undefined, { maximumFractionDigits: 0 })} PUMP`;
  }
  // SOL
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}B SOL`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M SOL`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K SOL`;
  if (val >= 1) return `${val.toFixed(1)} SOL`;
  return `${val.toFixed(4)} SOL`;
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Sanity-check a numeric value against a reasonable ceiling.
 * Catches broken uint256 conversions (e.g. missing /1e9 on lamports).
 * Returns 0 for values above the ceiling — they'd distort charts.
 */
export function sanitizeValue(val: number, ceiling = 1e12): number {
  if (!isFinite(val) || val > ceiling || val < -ceiling) return 0;
  return val;
}
