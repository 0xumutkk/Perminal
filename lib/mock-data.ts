export type MarketCategory =
  | "Crypto"
  | "Politics"
  | "Macro"
  | "Sports"
  | "Tech"
  | "Culture";

export interface Market {
  id: string;
  title: string;
  description?: string;
  category: MarketCategory;
  imageUrl?: string;
  yesPrice: number; // 0-1
  volume: number; // in USD
  liquidityScore: number;
  resolveDate: string;
  // SPL Token mints for trading on Solana via dFlow
  yesMint: string; // YES outcome token mint address
  noMint: string; // NO outcome token mint address
}

// All market categories for filtering
export const MARKET_CATEGORIES: MarketCategory[] = [
  "Crypto",
  "Politics",
  "Macro",
  "Sports",
  "Tech",
  "Culture",
];
