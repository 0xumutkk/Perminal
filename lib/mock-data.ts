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
}

export const mockMarkets: Market[] = [
  {
    id: "btc-100k-2024",
    title: "Will Bitcoin trade above $100k at any point in 2024?",
    category: "Crypto",
    yesPrice: 0.37,
    volume: 1234567,
    liquidityScore: 9.1,
    resolveDate: "2024-12-31T23:59:59Z"
  },
  {
    id: "eth-etf-approved",
    title: "Will a spot ETH ETF be approved in the US by June 30, 2025?",
    category: "Crypto",
    yesPrice: 0.58,
    volume: 845322,
    liquidityScore: 8.4,
    resolveDate: "2025-06-30T23:59:59Z"
  },
  {
    id: "fed-cut-2025",
    title: "Will the Fed cut rates at least 3 times in 2025?",
    category: "Macro",
    yesPrice: 0.44,
    volume: 678991,
    liquidityScore: 7.9,
    resolveDate: "2025-12-31T23:59:59Z"
  },
  {
    id: "us-election-winner",
    title: "Will the Democratic candidate win the 2028 US presidential election?",
    category: "Politics",
    yesPrice: 0.52,
    volume: 1543322,
    liquidityScore: 9.3,
    resolveDate: "2028-11-07T23:59:59Z"
  },
  {
    id: "world-cup-2030",
    title: "Will Brazil win the 2030 FIFA World Cup?",
    category: "Sports",
    yesPrice: 0.29,
    volume: 342211,
    liquidityScore: 7.1,
    resolveDate: "2030-07-30T23:59:59Z"
  },
  {
    id: "apple-ar-share",
    title:
      "Will Apple announce that >20% of iPhone users activate their AR headset by 2027?",
    category: "Tech",
    yesPrice: 0.33,
    volume: 421113,
    liquidityScore: 8.0,
    resolveDate: "2027-12-31T23:59:59Z"
  }
];

