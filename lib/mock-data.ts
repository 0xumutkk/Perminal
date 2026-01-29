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
  yesLabel?: string; // Dynamic label for YES outcome (e.g. "Trump")
  noLabel?: string; // Dynamic label for NO outcome (e.g. "Harris")
  // Optional dFlow-specific fields
  ticker?: string;
  eventTicker?: string;
  status?: string;
  yesAsk?: string;
  yesBid?: string;
  noAsk?: string;
  noBid?: string;
  openInterest?: number;
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
