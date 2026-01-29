"use client";

import { useParams } from "next/navigation";
import { useMarket } from "@/hooks/useMarkets";
import { useTrade } from "@/hooks/useTrade";
import { useAuth } from "@/hooks/useAuth";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft, TrendingUp, Clock, DollarSign, Activity } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useState } from "react";

export default function MarketDetailPage() {
    const params = useParams();
    const marketId = params.id as string;
    const { data: market, isLoading: isMarketLoading } = useMarket(marketId);

    const { login, authenticated } = useAuth();
    const trade = useTrade();

    const [pendingSide, setPendingSide] = useState<"YES" | "NO" | null>(null);

    if (isMarketLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
            </div>
        );
    }

    if (!market) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                <h1 className="text-2xl font-bold text-slate-100">Market not found</h1>
                <p className="text-slate-400">The market you are looking for does not exist.</p>
                <Link href="/markets" className={buttonVariants({ variant: "outline" })}>
                    Back to Markets
                </Link>
            </div>
        );
    }

    const yesPercent = Math.round(market.yesPrice * 100);
    const noPercent = 100 - yesPercent;
    const formattedVolume = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
    }).format(market.volume);

    const formattedResolveDate = format(new Date(market.resolveDate), "MMM d, yyyy");

    // Trading logic (similar to MarketCard)
    const isTradingAvailable = !!market.yesMint && !!market.noMint;
    const DEFAULT_AMOUNT_USD = 1;

    const handleTrade = async (side: "YES" | "NO") => {
        if (!authenticated) {
            login();
            return;
        }

        if (!isTradingAvailable) return;

        setPendingSide(side);
        try {
            await trade.buy({
                marketId: market.id,
                outputMint: side === "YES" ? market.yesMint : market.noMint,
                amountUsdc: DEFAULT_AMOUNT_USD,
                side,
            });
        } catch (err) {
            console.error(err);
        } finally {
            setPendingSide(null);
        }
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 text-slate-200">


            {/* Header */}
            <div className="flex flex-col gap-6 md:flex-row">
                {/* Market Image */}
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-xl md:h-32 md:w-32">
                    {market.imageUrl ? (
                        <img
                            src={market.imageUrl}
                            alt={market.title}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
                            <span className="text-2xl font-bold text-slate-400">
                                {market.category.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                </div>

                {/* Market Info */}
                <div className="flex flex-1 flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-slate-700 bg-slate-800/50 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                            {market.category}
                        </Badge>
                        {market.ticker && (
                            <span className="text-xs font-mono text-slate-500">{market.ticker}</span>
                        )}
                    </div>

                    <h1 className="text-2xl font-bold leading-tight text-white md:text-3xl">
                        {market.title}
                    </h1>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
                        <div className="flex items-center gap-1.5">
                            <DollarSign className="h-4 w-4 text-emerald-500" />
                            <span className="font-medium text-slate-200">{formattedVolume}</span>
                            <span className="text-xs">Vol</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-slate-500" />
                            <span>Resolves {formattedResolveDate}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Left Column: Chart & Analysis */}
                <div className="space-y-6 md:col-span-2">
                    {/* Chart Placeholder */}
                    <Card className="flex h-[300px] flex-col items-center justify-center border-slate-800 bg-slate-950/50 p-6 shadow-sm">
                        <div className="rounded-full bg-slate-900 p-4">
                            <TrendingUp className="h-8 w-8 text-slate-600" />
                        </div>
                        <p className="mt-4 text-sm font-medium text-slate-500">Price History Chart</p>
                        <p className="text-xs text-slate-600">Coming soon</p>
                    </Card>

                    {/* Description/Rules */}
                    <Card className="border-slate-800 bg-slate-950/30 p-6">
                        <h3 className="mb-3 text-lg font-semibold text-slate-200">Market Rules</h3>
                        <p className="text-sm leading-relaxed text-slate-400">
                            This market resolves to "YES" if the specific event outcome occurs by the resolution date.
                            The market data is provided by dFlow prediction markets.
                            {market.description}
                        </p>
                    </Card>
                </div>

                {/* Right Column: Trading Interface */}
                <div className="space-y-4">
                    <Card className="sticky top-24 border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm">
                        <h3 className="mb-4 text-lg font-semibold text-white">Trade Position</h3>

                        {/* Probability Bars */}
                        <div className="mb-6 space-y-3">
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-emerald-400">{market.yesLabel || "YES"}</span>
                                    <span className="font-bold text-white">{yesPercent}%</span>
                                </div>
                                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                                    <div
                                        className="h-full bg-emerald-500 transition-all duration-500"
                                        style={{ width: `${yesPercent}%` }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-rose-400">{market.noLabel || "NO"}</span>
                                    <span className="font-bold text-white">{noPercent}%</span>
                                </div>
                                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                                    <div
                                        className="h-full bg-rose-500 transition-all duration-500"
                                        style={{ width: `${noPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Trading Actions */}
                        <div className="space-y-3">
                            <Button
                                variant="neonYes"
                                size="lg"
                                className="w-full justify-between"
                                onClick={() => handleTrade("YES")}
                                disabled={trade.isLoading || !isTradingAvailable}
                            >
                                <span>Buy {market.yesLabel || "YES"}</span>
                                {pendingSide === "YES" ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>{yesPercent}¢</span>}
                            </Button>

                            <Button
                                variant="neonNo"
                                size="lg"
                                className="w-full justify-between"
                                onClick={() => handleTrade("NO")}
                                disabled={trade.isLoading || !isTradingAvailable}
                            >
                                <span>Buy {market.noLabel || "NO"}</span>
                                {pendingSide === "NO" ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>{noPercent}¢</span>}
                            </Button>
                        </div>

                        {/* Error Message */}
                        {trade.error && (
                            <div className="mt-4 rounded-md border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
                                {trade.error}
                            </div>
                        )}

                        {!isTradingAvailable && (
                            <div className="mt-4 flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-400">
                                <Activity className="h-4 w-4" />
                                <span>Trading currently unavailable</span>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
