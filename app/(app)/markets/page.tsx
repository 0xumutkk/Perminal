"use client";

import { MarketCard } from "@/components/market/market-card";
import { useMarkets } from "@/hooks/useMarkets";
import type { Market } from "@/lib/mock-data";

export default function MarketsPage() {
  const { data, isLoading } = useMarkets({ limit: 50 });
  const marketsList: Market[] = data?.markets ?? [];
  const isFallback = data?.fallback;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-50">
            Trending Markets
          </h1>
          <p className="text-xs text-slate-500">
            {isFallback
              ? "Demo markets (API unavailable)"
              : `${marketsList.length} live markets from Kalshi`}
          </p>
        </div>
        <div className="hidden items-center gap-2 text-[11px] text-slate-500 sm:flex">
          <span
            className={`h-1.5 w-1.5 rounded-full ${isFallback
                ? "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]"
                : "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
              }`}
          />
          <span>{isFallback ? "Demo mode" : "Solana mainnet · Live"}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl border border-slate-900/80 bg-slate-950/80"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {marketsList.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      )}
    </section>
  );
}
