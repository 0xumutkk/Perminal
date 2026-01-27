/**
 * Next.js API Route for dFlow Prediction Markets
 * Fetches tokenized Kalshi markets from dFlow API
 * 
 * dFlow tokenizes Kalshi markets on Solana, providing:
 * - Market metadata (title, description, prices)
 * - SPL Token mints (yesMint, noMint) for trading
 */

import { NextResponse } from "next/server";
import type { MarketCategory } from "@/lib/mock-data";

// dFlow Prediction Markets Metadata API (see https://pond.dflow.net/quickstart/user-prediction-positions)
// Base URL for metadata: https://prediction-markets-api.dflow.net
const DFLOW_MARKETS_API_BASE =
  process.env.DFLOW_MARKETS_API_URL || "https://prediction-markets-api.dflow.net";

// Category mapping based on market ticker patterns
function mapCategory(ticker: string, title: string): MarketCategory {
  const text = (ticker + title).toLowerCase();

  if (
    text.includes("btc") ||
    text.includes("eth") ||
    text.includes("crypto") ||
    text.includes("bitcoin")
  ) {
    return "Crypto";
  }
  if (
    text.includes("pres") ||
    text.includes("elect") ||
    text.includes("senate") ||
    text.includes("house") ||
    text.includes("trump") ||
    text.includes("biden") ||
    text.includes("congress")
  ) {
    return "Politics";
  }
  if (
    text.includes("fed") ||
    text.includes("rate") ||
    text.includes("cpi") ||
    text.includes("gdp") ||
    text.includes("jobs") ||
    text.includes("inflation") ||
    text.includes("econ")
  ) {
    return "Macro";
  }
  if (
    text.includes("nfl") ||
    text.includes("nba") ||
    text.includes("mlb") ||
    text.includes("sport") ||
    text.includes("game") ||
    text.includes("super")
  ) {
    return "Sports";
  }
  if (
    text.includes("tech") ||
    text.includes("ai") ||
    text.includes("apple") ||
    text.includes("google") ||
    text.includes("meta") ||
    text.includes("microsoft")
  ) {
    return "Tech";
  }

  return "Culture";
}

// dFlow market response type (adjust based on actual API response)
interface DFlowMarket {
  ticker: string;
  title: string;
  subtitle?: string;
  yes_mint: string; // SPL Token mint for YES outcome
  no_mint: string; // SPL Token mint for NO outcome
  last_price?: number;
  yes_price?: number;
  volume?: number;
  liquidity_score?: number;
  close_time?: string;
  status?: string;
}

interface DFlowMarketsResponse {
  markets: DFlowMarket[];
  cursor?: string;
}

// Transform dFlow market to our Market type
function transformMarket(dflowMarket: DFlowMarket) {
  const yesPrice = dflowMarket.yes_price ?? dflowMarket.last_price ?? 0.5;

  return {
    id: dflowMarket.ticker,
    title: dflowMarket.title,
    description: dflowMarket.subtitle || "",
    category: mapCategory(dflowMarket.ticker, dflowMarket.title),
    yesPrice: Math.round(yesPrice * 100) / 100,
    volume: dflowMarket.volume || 0,
    liquidityScore: dflowMarket.liquidity_score || 5.0,
    resolveDate: dflowMarket.close_time || "",
    // Critical: SPL Token mints for trading
    yesMint: dflowMarket.yes_mint,
    noMint: dflowMarket.no_mint,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50");

  try {
    // Build request headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add API key only if you actually have a real key configured.
    // Public dFlow setup works without auth; a bad/placeholder key will cause 4xx errors.
    if (
      process.env.DFLOW_API_KEY &&
      process.env.DFLOW_API_KEY !== "YOUR_DFLOW_API_KEY"
    ) {
      headers["Authorization"] = `Bearer ${process.env.DFLOW_API_KEY}`;
    }

    console.log("[Markets API] Fetching from dFlow:", DFLOW_MARKETS_API_BASE);

    // Fetch tokenized markets from dFlow "Get Markets" endpoint
    // GET /api/v1/markets?limit=...
    const response = await fetch(
      `${DFLOW_MARKETS_API_BASE}/api/v1/markets?limit=${limit}`,
      {
      headers,
      // Disable caching for fresh data
      cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Markets API] dFlow API error:", response.status, errorText);

      return NextResponse.json(
        {
          error: `dFlow API error: ${response.status}`,
          message: "Failed to fetch prediction markets from dFlow. Please check your API configuration.",
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data: DFlowMarketsResponse = await response.json();
    const dflowMarkets = data.markets || [];

    console.log("[Markets API] Received", dflowMarkets.length, "markets from dFlow");

    // Transform and filter markets (only those with valid mints)
    const markets = dflowMarkets
      .filter((m) => m.yes_mint && m.no_mint) // Only include markets with valid token mints
      .map(transformMarket)
      .sort((a, b) => b.volume - a.volume); // Sort by volume descending

    return NextResponse.json({
      markets,
      cursor: data.cursor,
      total: markets.length,
    });
  } catch (error) {
    console.error("[Markets API] Error fetching from dFlow:", error);

    // Return error - NO MOCK FALLBACK in production mode
    return NextResponse.json(
      {
        error: "Failed to fetch markets",
        message: error instanceof Error ? error.message : "Unknown error",
        hint:
          "Ensure DFLOW_MARKETS_API_URL (default https://prediction-markets-api.dflow.net) and DFLOW_API_KEY are configured in .env.local",
      },
      { status: 500 }
    );
  }
}
