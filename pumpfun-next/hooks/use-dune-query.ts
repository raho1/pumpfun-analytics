"use client";

import useSWR from "swr";
import { QUERY_IDS } from "@/lib/queries";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useDuneQuery<T = Record<string, unknown>[]>(
  key: string
): { data: T | undefined; isLoading: boolean; error: Error | undefined } {
  const queryId = QUERY_IDS[key];
  const { data, error, isLoading } = useSWR<T>(
    queryId ? `/api/dune?id=${queryId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 300_000,
      dedupingInterval: 60_000,
    }
  );

  return { data, isLoading, error };
}
