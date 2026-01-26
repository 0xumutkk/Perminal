"use client";

import { useQuery } from "@tanstack/react-query";
import type { Market } from "@/lib/mock-data";

interface MarketsResponse {
  markets: Market[];
  cursor?: string;
  total: number;
  fallback?: boolean;
}

async function fetchMarkets(params?: {
  category?: string;
  limit?: number;
  cursor?: string;
}): Promise<MarketsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.limit) {
    searchParams.set("limit", params.limit.toString());
  }
  if (params?.cursor) {
    searchParams.set("cursor", params.cursor);
  }

  const response = await fetch(`/api/markets?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch markets");
  }

  const data = await response.json();

  // Filter by category if specified (client-side filtering)
  if (params?.category && data.markets) {
    data.markets = data.markets.filter(
      (m: Market) => m.category === params.category
    );
  }

  return data;
}

export function useMarkets(params?: { category?: string; limit?: number }) {
  return useQuery<MarketsResponse>({
    queryKey: ["markets", params],
    queryFn: () => fetchMarkets(params),
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // 1 minute
    retry: 2,
  });
}

export function useMarket(ticker: string) {
  return useQuery<Market | null>({
    queryKey: ["market", ticker],
    queryFn: async () => {
      const response = await fetch(`/api/markets?tickers=${ticker}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.markets?.[0] || null;
    },
    enabled: !!ticker,
    staleTime: 30_000,
  });
}
