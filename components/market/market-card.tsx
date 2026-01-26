"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Market } from "@/lib/mock-data";
import { useTrade, type TradeSide } from "@/hooks/useTrade";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export interface MarketCardProps {
  market: Market & {
    // Extended fields from Kalshi API
    yesMint?: string;
    noMint?: string;
  };
}

export function MarketCard({ market }: MarketCardProps) {
  const { login } = useAuth();
  const { buy, isLoading, error, isWalletConnected, reset } = useTrade();
  const [imageError, setImageError] = useState(false);
  const [pendingSide, setPendingSide] = useState<TradeSide | null>(null);

  const yesPercent = Math.round(market.yesPrice * 100);
  const noPercent = 100 - yesPercent;

  // Default trade amount (can be made configurable via modal later)
  const DEFAULT_AMOUNT_USD = 10;

  const handleBuy = useCallback(
    async (side: TradeSide) => {
      reset();
      setPendingSide(side);

      // For demo: use a placeholder mint if not available
      // In production, these would come from DFlow's prediction market metadata API
      const outputMint =
        side === "YES"
          ? market.yesMint || "So11111111111111111111111111111111111111112" // SOL as placeholder
          : market.noMint || "So11111111111111111111111111111111111111112";

      try {
        await buy({
          marketId: market.id,
          outputMint,
          amountUsdc: DEFAULT_AMOUNT_USD,
          side,
        });
      } finally {
        setPendingSide(null);
      }
    },
    [buy, market.id, market.yesMint, market.noMint, reset]
  );

  const handleBuyYes = () => handleBuy("YES");
  const handleBuyNo = () => handleBuy("NO");

  // Format volume
  const formattedVolume =
    market.volume >= 1_000_000
      ? `$${(market.volume / 1_000_000).toFixed(1)}M Vol`
      : market.volume >= 1_000
        ? `$${(market.volume / 1_000).toFixed(0)}K Vol`
        : `$${market.volume} Vol`;

  // Format date
  const formattedResolveDate = market.resolveDate
    ? new Date(market.resolveDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "TBD";

  const isYesLoading = isLoading && pendingSide === "YES";
  const isNoLoading = isLoading && pendingSide === "NO";

  return (
    <Card interactive className="flex flex-col gap-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl border border-slate-800/80 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
          {!imageError ? (
            <Image
              src={
                market.imageUrl ??
                "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80"
              }
              alt={market.title}
              fill
              className="object-cover opacity-80"
              onError={() => setImageError(true)}
              sizes="40px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
              <span className="text-xs font-semibold text-slate-400">
                {market.category.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <p className="line-clamp-2 text-sm font-semibold text-slate-50">
            {market.title}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-slate-800 bg-slate-900/80 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400"
              >
                {market.category}
              </Badge>
              <span>{formattedVolume}</span>
            </div>
            <span className="text-slate-500">Resolves {formattedResolveDate}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-900/80">
        <div className="flex h-full w-full">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${yesPercent}%` }}
          />
          <div
            className="h-full bg-rose-500/90 transition-all duration-300"
            style={{ width: `${noPercent}%` }}
          />
        </div>
      </div>

      {/* Percentages */}
      <div className="flex items-center justify-between text-[11px] font-medium">
        <span className="text-emerald-400">{yesPercent}% YES</span>
        <span className="text-rose-400">{noPercent}% NO</span>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-400">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-1 grid grid-cols-2 gap-2">
        <Button
          variant="neonYes"
          size="lg"
          className="h-9 bg-slate-950/40 text-xs hover:shadow-[0_0_18px_rgba(34,197,94,0.55)] disabled:opacity-50"
          onClick={isWalletConnected ? handleBuyYes : login}
          disabled={isLoading}
        >
          {isYesLoading ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Buying...
            </>
          ) : !isWalletConnected ? (
            "Connect Wallet"
          ) : (
            `Buy YES ${yesPercent}¢`
          )}
        </Button>
        <Button
          variant="neonNo"
          size="lg"
          className="h-9 bg-slate-950/40 text-xs hover:shadow-[0_0_18px_rgba(248,113,113,0.55)] disabled:opacity-50"
          onClick={isWalletConnected ? handleBuyNo : login}
          disabled={isLoading}
        >
          {isNoLoading ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Buying...
            </>
          ) : !isWalletConnected ? (
            "Connect Wallet"
          ) : (
            `Buy NO ${noPercent}¢`
          )}
        </Button>
      </div>

      {/* Wallet not connected hint */}
      {!isWalletConnected && (
        <p className="text-center text-[10px] text-slate-600">
          Connect your wallet to trade on this market
        </p>
      )}
    </Card>
  );
}
