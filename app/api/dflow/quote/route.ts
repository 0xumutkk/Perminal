/**
 * DFlow Quote API Route
 * Proxies requests to DFlow Trade API to bypass CORS restrictions
 * Documentation: https://pond.dflow.net/introduction
 */

import { NextResponse } from "next/server";

const DFLOW_API_URL = "https://quote-api.dflow.net";
const DFLOW_API_KEY = process.env.DFLOW_API_KEY;

// Solana token mint addresses (local constant, not exported)
const TOKENS = {
  SOL: "So11111111111111111111111111111111111111112",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
} as const;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const inputMint = searchParams.get("inputMint") || TOKENS.USDC;
    const outputMint = searchParams.get("outputMint");
    const amount = searchParams.get("amount");
    const slippageBps = searchParams.get("slippageBps") || "50";
    const userPublicKey = searchParams.get("userPublicKey");

    // Validate required parameters
    if (!outputMint || !amount || !userPublicKey) {
      return NextResponse.json(
        { error: "Missing required parameters: outputMint, amount, userPublicKey" },
        { status: 400 }
      );
    }

    // Build DFlow API request
    const dflowParams = new URLSearchParams({
      inputMint,
      outputMint,
      amount,
      slippageBps,
      userPublicKey,
    });

    console.log(`[DFlow Quote] Requesting: ${DFLOW_API_URL}/order?${dflowParams}`);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Attach DFlow API key if configured and not the placeholder
    // Per https://pond.dflow.net/quickstart/trade-tokens, API key is optional
    if (DFLOW_API_KEY && DFLOW_API_KEY !== "YOUR_DFLOW_API_KEY") {
      headers["x-api-key"] = DFLOW_API_KEY;
    }

    const response = await fetch(`${DFLOW_API_URL}/order?${dflowParams}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DFlow Quote] Error ${response.status}:`, errorText);
      return NextResponse.json(
        { error: `DFlow API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[DFlow Quote] Success:`, {
      executionMode: data.executionMode,
      inputAmount: data.inAmount,
      outputAmount: data.outAmount,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[DFlow Quote] Exception:", error);
    return NextResponse.json(
      { error: "Failed to fetch DFlow quote", details: String(error) },
      { status: 500 }
    );
  }
}
