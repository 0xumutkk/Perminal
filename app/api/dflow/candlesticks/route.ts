/**
 * Candlesticks API Route
 * Fetches historical price data from dFlow Metadata API
 * Dev Endpoint: https://dev-prediction-markets-api.dflow.net
 */

import { NextResponse } from "next/server";

const DFLOW_METADATA_API_URL = "https://dev-prediction-markets-api.dflow.net";
const DFLOW_API_KEY = process.env.DFLOW_API_KEY;

// Candlestick data structure from dFlow
export interface Candlestick {
    time: number; // Unix timestamp in seconds
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

export interface CandlesticksResponse {
    candlesticks: Candlestick[];
    ticker: string;
    interval: string;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const ticker = searchParams.get("ticker");
        const interval = searchParams.get("interval") || "1h"; // Default to 1 hour
        const limit = searchParams.get("limit") || "100";

        if (!ticker) {
            return NextResponse.json(
                { error: "Missing required parameter: ticker" },
                { status: 400 }
            );
        }

        // Build dFlow API request params
        const dflowParams = new URLSearchParams({
            interval,
            limit,
        });

        console.log(`[Candlesticks API] Fetching: ${DFLOW_METADATA_API_URL}/api/v1/markets/${ticker}/candlesticks?${dflowParams}`);

        const headers: HeadersInit = {
            "Content-Type": "application/json",
            Accept: "application/json",
        };

        // Attach dFlow API key if configured
        if (DFLOW_API_KEY && DFLOW_API_KEY !== "YOUR_DFLOW_API_KEY") {
            headers["x-api-key"] = DFLOW_API_KEY;
        }

        const response = await fetch(
            `${DFLOW_METADATA_API_URL}/api/v1/markets/${ticker}/candlesticks?${dflowParams}`,
            {
                headers,
                next: { revalidate: 300 }, // Cache for 5 minutes (price data changes slower)
            }
        );

        if (!response.ok) {
            console.error(`[Candlesticks API] dFlow API error: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.error(`[Candlesticks API] Error body: ${errorText}`);

            // Return empty data for markets without candlestick data
            if (response.status === 404) {
                return NextResponse.json({
                    candlesticks: [],
                    ticker,
                    interval,
                    error: "No candlestick data available for this market",
                });
            }

            throw new Error(`dFlow API returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`[Candlesticks API] Fetched ${data.candlesticks?.length || 0} candlesticks for ${ticker}`);

        return NextResponse.json({
            candlesticks: data.candlesticks || [],
            ticker,
            interval,
        });
    } catch (error) {
        console.error("[Candlesticks API] Fatal error:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch candlestick data",
                details: error instanceof Error ? error.message : "Unknown error",
                candlesticks: [], // Return empty array to prevent UI breaks
            },
            { status: 500 }
        );
    }
}
