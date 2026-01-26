/**
 * Kalshi API Service
 * Documentation: https://docs.kalshi.com/sdks/overview
 * 
 * Fetches prediction market data from Kalshi API
 * Note: Direct browser calls blocked by CORS - use Next.js API routes in production
 */

import type { Market } from "@/lib/mock-data";

export interface KalshiMarket {
  ticker: string;
  title: string;
  subtitle?: string;
  category: string;
  yes_bid: number;
  yes_ask: number;
  no_bid: number;
  no_ask: number;
  volume: number;
  open_time: string;
  close_time: string;
  status: "open" | "closed" | "settled";
  result?: "yes" | "no";
}

export interface KalshiMarketsResponse {
  markets: KalshiMarket[];
  cursor?: string;
}

class KalshiService {
  private baseUrl: string;
  private apiKeyId: string | null;
  private apiSecret: string | null;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_KALSHI_API_URL ||
      "https://api.calendar.kalshi.com/trade-api/v2";
    this.apiKeyId = process.env.NEXT_PUBLIC_KALSHI_API_KEY_ID || null;
    this.apiSecret = process.env.NEXT_PUBLIC_KALSHI_API_SECRET || null;
  }

  private async signRequest(
    method: string,
    path: string,
    body?: string
  ): Promise<HeadersInit> {
    const headers: HeadersInit = {
      "Content-Type": "application/json"
    };

    if (this.apiKeyId && this.apiSecret) {
      const credentials = btoa(`${this.apiKeyId}:${this.apiSecret}`);
      headers["Authorization"] = `Basic ${credentials}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const headers = await this.signRequest(
      options.method || "GET",
      path,
      options.body as string
    );

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `Kalshi API error: ${response.statusText}`
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getMarkets(params?: {
    category?: string;
    limit?: number;
    cursor?: string;
  }): Promise<{ markets: Market[]; cursor?: string }> {
    try {
      const response = await this.request<KalshiMarketsResponse>(
        "/markets",
        { method: "GET" }
      );

      const markets: Market[] = response.markets
        .filter((m) => m.status === "open")
        .map((kalshiMarket) => ({
          id: kalshiMarket.ticker,
          title: kalshiMarket.title,
          description: kalshiMarket.subtitle,
          category: this.mapKalshiCategory(kalshiMarket.category),
          yesPrice: kalshiMarket.yes_bid / 100,
          volume: kalshiMarket.volume,
          liquidityScore: this.calculateLiquidityScore(kalshiMarket),
          resolveDate: kalshiMarket.close_time
        }));

      return { markets, cursor: response.cursor };
    } catch (error) {
      // Fallback to mock data if API fails (CORS, network error, etc.)
      const { mockMarkets } = await import("@/lib/mock-data");
      return { markets: mockMarkets };
    }
  }

  async getMarket(ticker: string): Promise<Market | null> {
    try {
      const response = await this.request<{ market: KalshiMarket }>(
        `/markets/${ticker}`
      );

      return {
        id: response.market.ticker,
        title: response.market.title,
        description: response.market.subtitle,
        category: this.mapKalshiCategory(response.market.category),
        yesPrice: response.market.yes_bid / 100,
        volume: response.market.volume,
        liquidityScore: this.calculateLiquidityScore(response.market),
        resolveDate: response.market.close_time
      };
    } catch (error) {
      return null;
    }
  }

  private mapKalshiCategory(kalshiCategory: string): Market["category"] {
    const categoryMap: Record<string, Market["category"]> = {
      crypto: "Crypto",
      politics: "Politics",
      economics: "Macro",
      sports: "Sports",
      tech: "Tech",
      culture: "Culture"
    };

    return categoryMap[kalshiCategory.toLowerCase()] || "Crypto";
  }

  private calculateLiquidityScore(market: KalshiMarket): number {
    const spread = market.yes_ask - market.yes_bid;
    const midPrice = (market.yes_bid + market.yes_ask) / 2;
    const spreadPercent = (spread / midPrice) * 100;

    const spreadScore = Math.max(0, 10 - spreadPercent * 2);
    const volumeScore = Math.min(10, Math.log10(market.volume + 1) * 2);

    return (spreadScore + volumeScore) / 2;
  }
}

export const kalshiService = new KalshiService();
