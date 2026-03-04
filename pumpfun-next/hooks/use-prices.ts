"use client";

import useSWR from "swr";
import type { SolPrice } from "@/lib/types";

export interface PumpPrice {
  price: number;
  change_24h: number;
  mcap: number;
}

export interface Prices {
  sol: SolPrice;
  pump: PumpPrice;
}

const DEFAULT_SOL: SolPrice = { price: 0, change_24h: 0, vol_24h: 0, mcap: 0 };
const DEFAULT_PUMP: PumpPrice = { price: 0, change_24h: 0, mcap: 0 };

const fetcher = async (): Promise<Prices> => {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=solana,pump-fun&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true"
  );
  const d = await res.json();
  const sol = d?.solana ?? {};
  const pump = d?.["pump-fun"] ?? {};
  return {
    sol: {
      price: sol.usd ?? 0,
      change_24h: sol.usd_24h_change ?? 0,
      vol_24h: sol.usd_24h_vol ?? 0,
      mcap: sol.usd_market_cap ?? 0,
    },
    pump: {
      price: pump.usd ?? 0,
      change_24h: pump.usd_24h_change ?? 0,
      mcap: pump.usd_market_cap ?? 0,
    },
  };
};

export function usePrices() {
  const { data, error, isLoading } = useSWR("prices", fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 60_000,
  });

  return {
    sol: data?.sol ?? DEFAULT_SOL,
    pump: data?.pump ?? DEFAULT_PUMP,
    isLoading,
    error,
  };
}

/** @deprecated Use usePrices() instead */
export function useSolPrice() {
  const { sol, isLoading, error } = usePrices();
  return { sol, isLoading, error };
}
