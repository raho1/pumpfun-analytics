"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { usePrices, type PumpPrice } from "@/hooks/use-prices";
import type { SolPrice } from "@/lib/types";

export type CurrencyType = "SOL" | "USD" | "PUMP";

interface CurrencyContextValue {
  currency: CurrencyType;
  setCurrency: (c: CurrencyType) => void;
  solPrice: number;
  pumpPrice: number;
  sol: SolPrice;
  pump: PumpPrice;
  /** Convert a SOL-denominated value to the active currency */
  convert: (solVal: number) => number;
  /** Convert a USD-denominated value to the active currency */
  convertFromUSD: (usdVal: number) => number;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const STORAGE_KEY = "pf-currency";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyType>("SOL");
  const { sol, pump } = usePrices();

  // Hydrate from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as CurrencyType | null;
    if (saved && ["SOL", "USD", "PUMP"].includes(saved)) {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = useCallback((c: CurrencyType) => {
    setCurrencyState(c);
    localStorage.setItem(STORAGE_KEY, c);
  }, []);

  const convert = useCallback(
    (solVal: number): number => {
      if (currency === "SOL") return solVal;
      if (currency === "USD") return solVal * (sol.price || 0);
      // PUMP: SOL → USD → PUMP
      if (pump.price > 0) return (solVal * (sol.price || 0)) / pump.price;
      return 0;
    },
    [currency, sol.price, pump.price]
  );

  const convertFromUSD = useCallback(
    (usdVal: number): number => {
      if (currency === "USD") return usdVal;
      if (currency === "SOL") return sol.price > 0 ? usdVal / sol.price : 0;
      // PUMP: USD → PUMP
      if (pump.price > 0) return usdVal / pump.price;
      return 0;
    },
    [currency, sol.price, pump.price]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        solPrice: sol.price,
        pumpPrice: pump.price,
        sol,
        pump,
        convert,
        convertFromUSD,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
