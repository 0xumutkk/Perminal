/**
 * DFlow Order Status API Route
 * Checks the status of async orders
 * Documentation: https://pond.dflow.net/introduction
 */

import { NextResponse } from "next/server";

const DFLOW_API_URL = "https://quote-api.dflow.net";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const signature = searchParams.get("signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing required parameter: signature" },
        { status: 400 }
      );
    }

    console.log(`[DFlow Status] Checking order: ${signature}`);

    const response = await fetch(
      `${DFLOW_API_URL}/order-status?signature=${signature}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DFlow Status] Error ${response.status}:`, errorText);
      return NextResponse.json(
        { error: `DFlow API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[DFlow Status] Order status:`, data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[DFlow Status] Exception:", error);
    return NextResponse.json(
      { error: "Failed to fetch order status", details: String(error) },
      { status: 500 }
    );
  }
}
