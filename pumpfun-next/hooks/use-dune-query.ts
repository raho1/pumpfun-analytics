"use client";

import useSWR from "swr";
import { QUERY_IDS } from "@/lib/queries";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  // API route returns rows array on success, or { error: "..." } on failure.
  // Ensure we always return an array so .map() never blows up downstream.
  if (Array.isArray(json)) return json;
  return [];
};

export function useDuneQuery<T = Record<string, unknown>[]>(
  key: string
): { data: T | undefined; isLoading: boolean; error: Error | undefined } {
  const queryId = QUERY_IDS[key];
  const swrKey = queryId ? `/api/dune?id=${queryId}` : null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error, isLoading } = useSWR(
    swrKey,
    fetcher as any,
    {
      revalidateOnFocus: false,
      refreshInterval: 300_000,
      dedupingInterval: 60_000,
    }
  );

  return { data: data as T | undefined, isLoading, error };
}
