/**
 * Next.js API Route for Kalshi Markets
 * Proxies requests to Kalshi API to bypass CORS restrictions
 */

import { NextResponse } from "next/server";
import { Configuration, MarketApi, GetMarketsStatusEnum } from "kalshi-typescript";
import type { Market as KalshiMarket } from "kalshi-typescript/dist/models";

// Create Kalshi API configuration
const config = new Configuration({
  basePath: "https://api.elections.kalshi.com/trade-api/v2",
});

const marketApi = new MarketApi(config);

// Category mapping based on series ticker patterns
function mapCategory(
  seriesTicker: string,
  eventTicker: string
): "Crypto" | "Politics" | "Macro" | "Sports" | "Tech" | "Culture" {
  const ticker = (seriesTicker + eventTicker).toLowerCase();

  if (
    ticker.includes("btc") ||
    ticker.includes("eth") ||
    ticker.includes("crypto") ||
    ticker.includes("bitcoin")
  ) {
    return "Crypto";
  }
  if (
    ticker.includes("pres") ||
    ticker.includes("elect") ||
    ticker.includes("senate") ||
    ticker.includes("house") ||
    ticker.includes("trump") ||
    ticker.includes("biden") ||
    ticker.includes("congress")
  ) {
    return "Politics";
  }
  if (
    ticker.includes("fed") ||
    ticker.includes("rate") ||
    ticker.includes("cpi") ||
    ticker.includes("gdp") ||
    ticker.includes("jobs") ||
    ticker.includes("inflation") ||
    ticker.includes("econ")
  ) {
    return "Macro";
  }
  if (
    ticker.includes("nfl") ||
    ticker.includes("nba") ||
    ticker.includes("mlb") ||
    ticker.includes("sport") ||
    ticker.includes("game") ||
    ticker.includes("super")
  ) {
    return "Sports";
  }
  if (
    ticker.includes("tech") ||
    ticker.includes("ai") ||
    ticker.includes("apple") ||
    ticker.includes("google") ||
    ticker.includes("meta") ||
    ticker.includes("microsoft")
  ) {
    return "Tech";
  }

  return "Culture";
}

// Format volume for display
function formatVolume(volume: number): string {
  if (volume >= 1_000_000) {
    return `$${(volume / 1_000_000).toFixed(1)}M`;
  }
  if (volume >= 1_000) {
    return `$${(volume / 1_000).toFixed(1)}K`;
  }
  return `$${volume}`;
}

// Transform Kalshi market to our Market type
function transformMarket(kalshiMarket: KalshiMarket) {
  // Parse dollar values (they come as strings like "0.3700")
  const yesBid = parseFloat(kalshiMarket.yes_bid_dollars || "0");
  const yesAsk = parseFloat(kalshiMarket.yes_ask_dollars || "0");
  const noBid = parseFloat(kalshiMarket.no_bid_dollars || "0");
  const noAsk = parseFloat(kalshiMarket.no_ask_dollars || "0");

  // Use midpoint price or last price
  const yesPrice =
    yesBid > 0 && yesAsk > 0
      ? (yesBid + yesAsk) / 2
      : parseFloat(kalshiMarket.last_price_dollars || "0.5");

  // Calculate liquidity score (0-10)
  const spread = yesAsk - yesBid;
  const spreadScore = Math.max(0, 10 - spread * 20);
  const volumeScore = Math.min(10, Math.log10(kalshiMarket.volume + 1) * 2);
  const liquidityScore = (spreadScore + volumeScore) / 2;

  return {
    id: kalshiMarket.ticker,
    title: kalshiMarket.title || kalshiMarket.yes_sub_title || kalshiMarket.ticker,
    description: kalshiMarket.subtitle || kalshiMarket.rules_primary || "",
    category: mapCategory(kalshiMarket.event_ticker || "", kalshiMarket.ticker),
    yesPrice: Math.round(yesPrice * 100) / 100, // 0.00 to 1.00
    volume: kalshiMarket.volume,
    volumeFormatted: formatVolume(kalshiMarket.volume),
    liquidityScore: Math.round(liquidityScore * 10) / 10,
    resolveDate: kalshiMarket.close_time || kalshiMarket.expected_expiration_time || "",
    status: kalshiMarket.status,
    eventTicker: kalshiMarket.event_ticker,
    // Additional fields
    yesBid,
    yesAsk,
    noBid,
    noAsk,
    openInterest: kalshiMarket.open_interest,
    volume24h: kalshiMarket.volume_24h,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const cursor = searchParams.get("cursor") || undefined;
    const status = searchParams.get("status") as GetMarketsStatusEnum | undefined;

    // Fetch markets from Kalshi
    const response = await marketApi.getMarkets(
      limit,
      cursor,
      undefined, // eventTicker
      undefined, // seriesTicker
      undefined, // minCreatedTs
      undefined, // maxCreatedTs
      undefined, // maxCloseTs
      undefined, // minCloseTs
      undefined, // minSettledTs
      undefined, // maxSettledTs
      status || GetMarketsStatusEnum.Open,
      undefined, // tickers
      "exclude" // mveFilter - exclude multivariate events for simpler display
    );

    const kalshiMarkets = response.data.markets || [];

    // Transform markets to our format
    const markets = kalshiMarkets
      .filter((m) => m.status === "active" || m.status === "inactive")
      .map(transformMarket)
      .sort((a, b) => b.volume - a.volume); // Sort by volume descending

    return NextResponse.json({
      markets,
      cursor: response.data.cursor,
      total: markets.length,
    });
  } catch (error) {
    console.error("Kalshi API error:", error);

    // Return fallback mock data on error
    const { mockMarkets } = await import("@/lib/mock-data");
    return NextResponse.json({
      markets: mockMarkets,
      cursor: undefined,
      total: mockMarkets.length,
      fallback: true,
    });
  }
}
