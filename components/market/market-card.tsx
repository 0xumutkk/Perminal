"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Market } from "@/lib/mock-data";
import { useTrade, type TradeSide } from "@/hooks/useTrade";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, AlertTriangle } from "lucide-react";

export interface MarketCardProps {
  market: Market;
}

export function MarketCard({ market }: MarketCardProps) {
  const { login } = useAuth();
  const { buy, isLoading, error, isWalletConnected, reset } = useTrade();
  const [imageError, setImageError] = useState(false);
  const [pendingSide, setPendingSide] = useState<TradeSide | null>(null);

  const yesPercent = Math.round(market.yesPrice * 100);
  const noPercent = 100 - yesPercent;

  // Default trade amount (can be made configurable via modal later)
  const DEFAULT_AMOUNT_USD = 1;

  // Check if trading is available (requires valid SPL token mints)
  const isTradingAvailable = useMemo(() => {
    return Boolean(market.yesMint && market.noMint);
  }, [market.yesMint, market.noMint]);

  // Reset pendingSide when loading ends or error occurs
  useEffect(() => {
    if (!isLoading || error) {
      setPendingSide(null);
    }
  }, [isLoading, error]);

  const handleBuy = useCallback(
    async (side: TradeSide) => {
      // Ensure we have valid mints before trading
      if (!market.yesMint || !market.noMint) {
        console.error("[MarketCard] Cannot trade: missing token mints", {
          marketId: market.id,
          yesMint: market.yesMint,
          noMint: market.noMint,
        });
        return;
      }

      reset();
      setPendingSide(side);

      // Use the REAL SPL token mints from dFlow
      const outputMint = side === "YES" ? market.yesMint : market.noMint;

      try {
        console.log(`[MarketCard] Initiating ${side} trade:`, {
          marketId: market.id,
          outputMint,
          amountUsdc: DEFAULT_AMOUNT_USD,
        });

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
      {/* Header Section - Clickable to navigate */}
      <Link href={`/market/${market.id}`} className="block transition-opacity hover:opacity-80">
        <div className="flex gap-4">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-slate-800 bg-slate-900 shadow-inner">
            {market.imageUrl ? (
              <img
                src={market.imageUrl}
                alt={market.title}
                className="h-full w-full object-cover"
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
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-900/80">
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
        <div className="mt-1 flex items-center justify-between text-[11px] font-medium">
          <span className="text-emerald-400">{yesPercent}% {market.yesLabel || "YES"}</span>
          <span className="text-rose-400">{noPercent}% {market.noLabel || "NO"}</span>
        </div>
      </Link>

      {/* Error Message */}
      {error && (
        <div className="mt-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-400">
          {error}
        </div>
      )}

      {/* Trading Unavailable Warning */}
      {!isTradingAvailable && (
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          <span>Trading unavailable for this market</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button
          variant="neonYes"
          size="lg"
          className="h-9 bg-slate-950/40 text-xs hover:shadow-[0_0_18px_rgba(34,197,94,0.55)] disabled:opacity-50"
          onClick={isWalletConnected ? handleBuyYes : login}
          disabled={isLoading || !isTradingAvailable}
        >
          {isYesLoading ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Buying...
            </>
          ) : !isWalletConnected ? (
            "Connect Wallet"
          ) : !isTradingAvailable ? (
            "Unavailable"
          ) : (
            `Buy ${market.yesLabel || "YES"} ${yesPercent}¢`
          )}
        </Button>
        <Button
          variant="neonNo"
          size="lg"
          className="h-9 bg-slate-950/40 text-xs hover:shadow-[0_0_18px_rgba(248,113,113,0.55)] disabled:opacity-50"
          onClick={isWalletConnected ? handleBuyNo : login}
          disabled={isLoading || !isTradingAvailable}
        >
          {isNoLoading ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Buying...
            </>
          ) : !isWalletConnected ? (
            "Connect Wallet"
          ) : !isTradingAvailable ? (
            "Unavailable"
          ) : (
            `Buy ${market.noLabel || "NO"} ${noPercent}¢`
          )}
        </Button>
      </div>

      {/* Wallet not connected hint */}
      {!isWalletConnected && isTradingAvailable && (
        <p className="text-center text-[10px] text-slate-600">
          Connect your wallet to trade on this market
        </p>
      )}
    </Card>
  );
}
