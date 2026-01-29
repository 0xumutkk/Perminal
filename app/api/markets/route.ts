/**
 * Markets API Route
 * Fetches prediction markets from dFlow Metadata API
 * Dev Endpoint: https://dev-prediction-markets-api.dflow.net
 */

import { NextResponse } from "next/server";
import type { DFlowMarketsResponse, DFlowMarket } from "@/lib/types/dflow.types";
import { USDC_MINT } from "@/lib/types/dflow.types";
import type { Market, MarketCategory } from "@/lib/mock-data";

const DFLOW_METADATA_API_URL = "https://dev-prediction-markets-api.dflow.net";
const DFLOW_API_KEY = process.env.DFLOW_API_KEY;

// Map dFlow event tickers to our categories
function mapToCategory(eventTicker: string): MarketCategory {
    const ticker = eventTicker.toUpperCase();

    if (ticker.includes("BTC") || ticker.includes("ETH") || ticker.includes("SOL") || ticker.includes("CRYPTO")) {
        return "Crypto";
    }
    if (ticker.includes("TRUMP") || ticker.includes("BIDEN") || ticker.includes("ELECTION") || ticker.includes("POL")) {
        return "Politics";
    }
    if (ticker.includes("GDP") || ticker.includes("CPI") || ticker.includes("FED") || ticker.includes("RATE")) {
        return "Macro";
    }
    if (ticker.includes("NFL") || ticker.includes("NBA") || ticker.includes("SUPER") || ticker.includes("SPORT") || ticker.includes("BOXING")) {
        return "Sports";
    }
    if (ticker.includes("AI") || ticker.includes("TECH") || ticker.includes("APPLE") || ticker.includes("META")) {
        return "Tech";
    }
    if (ticker.includes("OSCAR") || ticker.includes("GRAMMY") || ticker.includes("MOVIE")) {
        return "Culture";
    }

    return "Crypto"; // Default
}

// Extract yesMint and noMint from dFlow accounts structure
function extractMints(accounts: DFlowMarket["accounts"]): { yesMint: string; noMint: string } {
    // Try USDC collateral first (primary)
    const usdcAccount = accounts?.[USDC_MINT];
    if (usdcAccount?.yesMint && usdcAccount?.noMint && usdcAccount.isInitialized) {
        return {
            yesMint: usdcAccount.yesMint,
            noMint: usdcAccount.noMint,
        };
    }

    // Fallback: try any initialized collateral account
    for (const key of Object.keys(accounts || {})) {
        const account = accounts[key];
        if (account?.yesMint && account?.noMint && account.isInitialized) {
            return {
                yesMint: account.yesMint,
                noMint: account.noMint,
            };
        }
    }

    return { yesMint: "", noMint: "" };
}

// Transform dFlow market to our Market interface
function transformMarket(dflowMarket: DFlowMarket): Market {
    // Calculate yesPrice from yesBid/yesAsk (midpoint) or default to 0.5
    let yesPrice = 0.5;
    if (dflowMarket.yesAsk && dflowMarket.yesBid) {
        const ask = parseFloat(dflowMarket.yesAsk);
        const bid = parseFloat(dflowMarket.yesBid);
        if (!isNaN(ask) && !isNaN(bid)) {
            yesPrice = (ask + bid) / 2;
        }
    } else if (dflowMarket.yesAsk) {
        const ask = parseFloat(dflowMarket.yesAsk);
        if (!isNaN(ask)) yesPrice = ask;
    } else if (dflowMarket.yesBid) {
        const bid = parseFloat(dflowMarket.yesBid);
        if (!isNaN(bid)) yesPrice = bid;
    }

    // Ensure yesPrice is between 0 and 1
    yesPrice = Math.max(0, Math.min(1, yesPrice));

    // Extract mints from accounts structure
    const { yesMint, noMint } = extractMints(dflowMarket.accounts);

    return {
        id: dflowMarket.ticker,
        title: dflowMarket.title,
        description: dflowMarket.subtitle || dflowMarket.rulesPrimary,
        category: mapToCategory(dflowMarket.eventTicker),
        imageUrl: undefined, // dFlow markets API doesn't include images
        yesPrice,
        volume: dflowMarket.volume || 0,
        liquidityScore: dflowMarket.openInterest || 0,
        resolveDate: new Date(dflowMarket.expirationTime * 1000).toISOString(),
        yesMint,
        noMint,
        // Map dynamic labels
        yesLabel: dflowMarket.yesSubTitle,
        noLabel: dflowMarket.noSubTitle,
    };
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const limit = searchParams.get("limit") || "20";
        const cursor = searchParams.get("cursor");
        const status = searchParams.get("status") || "active";
        const tickers = searchParams.get("tickers");

        // Build dFlow API request params
        const dflowParams = new URLSearchParams({
            limit,
            status,
            isInitialized: "true", // Only get markets with valid accounts
        });

        if (cursor) {
            dflowParams.set("cursor", cursor);
        }

        console.log(`[Markets API] Fetching: ${DFLOW_METADATA_API_URL}/api/v1/markets?${dflowParams}`);

        const headers: HeadersInit = {
            "Content-Type": "application/json",
            Accept: "application/json",
        };

        // Attach dFlow API key if configured
        if (DFLOW_API_KEY && DFLOW_API_KEY !== "YOUR_DFLOW_API_KEY") {
            headers["x-api-key"] = DFLOW_API_KEY;
        }

        const response = await fetch(`${DFLOW_METADATA_API_URL}/api/v1/markets?${dflowParams}`, {
            method: "GET",
            headers,
            next: { revalidate: 30 }, // Cache for 30 seconds
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Markets API] Error ${response.status}:`, errorText);
            return NextResponse.json(
                { error: `dFlow API error: ${response.status}`, details: errorText },
                { status: response.status }
            );
        }

        const data: DFlowMarketsResponse = await response.json();
        console.log(`[Markets API] Received ${data.markets?.length || 0} markets`);

        // Transform dFlow markets to our format
        let markets: Market[] = (data.markets || []).map(transformMarket);

        // Filter by specific tickers if requested
        if (tickers) {
            const tickerList = tickers.split(",").map((t) => t.trim().toUpperCase());
            markets = markets.filter((m) => tickerList.includes(m.id.toUpperCase()));
        }

        return NextResponse.json({
            markets,
            cursor: data.cursor,
            total: markets.length,
        });
    } catch (error) {
        console.error("[Markets API] Exception:", error);
        return NextResponse.json(
            { error: "Failed to fetch markets", details: String(error) },
            { status: 500 }
        );
    }
}
