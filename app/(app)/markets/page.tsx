"use client";

import { MarketCard } from "@/components/market/market-card";
import { useMarkets } from "@/hooks/useMarkets";
import { MARKET_CATEGORIES, type Market } from "@/lib/mock-data";
import { useState } from "react";

export default function MarketsPage() {
  const [activeTab, setActiveTab] = useState("Trending");
  const [activeCategory, setActiveCategory] = useState("All");

  const { data, isLoading } = useMarkets({
    limit: 100,
    category: activeCategory === "All" ? undefined : activeCategory
  });

  const marketsList: Market[] = data?.markets ?? [];
  const isFallback = data?.fallback;

  return (
    <section className="flex flex-col gap-4">
      <div className="-mt-4 sticky top-0 z-10 flex flex-col border-b border-slate-800/50 bg-slate-950/80 pt-4 backdrop-blur-md">
        {/* Main Tabs */}
        <div className="flex items-center gap-6 pb-3">
          {["Trending", "For You", "Activity"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-medium transition-colors hover:text-emerald-400 ${activeTab === tab ? "text-emerald-500" : "text-slate-500"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 no-scrollbar">
          {["All", ...MARKET_CATEGORIES].map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors border ${activeCategory === category
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
            >
              {category}
            </button>
          ))}
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
