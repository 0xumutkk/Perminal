import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

    try {
        const body = await request.json();

        const response = await fetch(rpcUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `RPC Error: ${response.statusText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("RPC Proxy Error:", error);
        return NextResponse.json(
            { error: "Failed to process RPC request" },
            { status: 500 }
        );
    }
}
