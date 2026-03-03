"use client";

import useSWR from "swr";
import type { SolPrice } from "@/lib/types";

const fetcher = async (): Promise<SolPrice> => {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true"
  );
  const d = await res.json();
  const sol = d?.solana ?? {};
  return {
    price: sol.usd ?? 0,
    change_24h: sol.usd_24h_change ?? 0,
    vol_24h: sol.usd_24h_vol ?? 0,
    mcap: sol.usd_market_cap ?? 0,
  };
};

export function useSolPrice() {
  const { data, error, isLoading } = useSWR("sol-price", fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 60_000,
  });

  return {
    sol: data ?? { price: 0, change_24h: 0, vol_24h: 0, mcap: 0 },
    isLoading,
    error,
  };
}
