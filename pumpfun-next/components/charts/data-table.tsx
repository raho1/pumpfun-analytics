"use client";

import { shortenAddress, formatCurrency } from "@/lib/utils";
import { useCurrency } from "@/lib/currency-context";

interface Column {
  key: string;
  label: string;
  format?: "number" | "sol" | "usd" | "percent" | "address";
  align?: "left" | "right" | "center";
}

interface DataTableProps {
  data: Record<string, any>[];
  columns: Column[];
  maxRows?: number;
}

export function DataTable({ data, columns, maxRows = 20 }: DataTableProps) {
  const { currency, convert, convertFromUSD } = useCurrency();
  const rows = data.slice(0, maxRows);

  function formatCell(value: unknown, format?: string): string {
    if (value === null || value === undefined) return "—";
    const num = Number(value);
    switch (format) {
      case "number":
        return isNaN(num) ? String(value) : num.toLocaleString();
      case "sol":
        return isNaN(num) ? String(value) : formatCurrency(convert(num), currency);
      case "usd":
        return isNaN(num) ? String(value) : formatCurrency(convertFromUSD(num), currency);
      case "percent":
        return isNaN(num) ? String(value) : `${num.toFixed(1)}%`;
      case "address":
        return shortenAddress(String(value));
      default:
        return String(value);
    }
  }

  return (
    <div className="overflow-auto max-h-[500px] rounded-xl border border-[rgba(255,255,255,0.04)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[rgba(255,255,255,0.06)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-3 py-2.5 text-[0.7rem] font-semibold text-[#55556a] uppercase tracking-wider sticky top-0 bg-[#0a0a12] ${
                  col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(124,58,237,0.04)] transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-3 py-2 text-[0.8rem] text-[#8888a0] font-mono ${
                    col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                  }`}
                >
                  {formatCell(row[col.key], col.format)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
