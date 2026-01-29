/**
 * dFlow API Types
 * Based on: https://pond.dflow.net/build/metadata-api/
 * 
 * Dev Endpoints:
 * - Trade API: https://dev-quote-api.dflow.net
 * - Metadata API: https://dev-prediction-markets-api.dflow.net
 */

// Single collateral account containing mint addresses
export interface DFlowCollateralAccount {
    marketLedger: string;
    yesMint: string;
    noMint: string;
    isInitialized: boolean;
    redemptionStatus?: string;
    scalarOutcomePct?: number;
}

// Market accounts - keyed by collateral mint address (e.g., USDC mint)
export type DFlowMarketAccounts = Record<string, DFlowCollateralAccount>;

// USDC mint address on Solana mainnet
export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

// Market data from dFlow Metadata API
export interface DFlowMarket {
    accounts: DFlowMarketAccounts;
    canCloseEarly: boolean;
    closeTime: number;
    eventTicker: string;
    expirationTime: number;
    marketType: string;
    noSubTitle?: string;
    openInterest: number;
    openTime: number;
    result?: string;
    rulesPrimary?: string;
    status: string;
    subtitle?: string;
    ticker: string;
    title: string;
    volume: number;
    yesSubTitle?: string;
    earlyCloseCondition?: string;
    noAsk?: string;
    noBid?: string;
    rulesSecondary?: string;
    yesAsk?: string;
    yesBid?: string;
}

// Settlement source for events
export interface DFlowSettlementSource {
    name: string;
    url: string;
}

// Event data from dFlow Metadata API
export interface DFlowEvent {
    seriesTicker: string;
    subtitle?: string;
    ticker: string;
    title: string;
    competition?: string;
    competitionScope?: string;
    imageUrl?: string;
    liquidity: number;
    markets: DFlowMarket[];
    openInterest: number;
    settlementSources?: DFlowSettlementSource[];
    strikeDate: number;
    strikePeriod?: string;
    volume: number;
    volume24h: number;
}

// API Response types
export interface DFlowMarketsResponse {
    markets: DFlowMarket[];
    cursor?: number;
}

export interface DFlowEventsResponse {
    events: DFlowEvent[];
    cursor?: number;
}

// Query parameters for markets endpoint
export interface DFlowMarketsQueryParams {
    limit?: number;
    cursor?: number;
    isInitialized?: boolean;
    status?: "initialized" | "active" | "inactive" | "closed" | "determined";
    sort?: "volume" | "volume24h" | "liquidity" | "openInterest" | "startDate";
}

// Query parameters for events endpoint
export interface DFlowEventsQueryParams {
    limit?: number;
    cursor?: number;
    withNestedMarkets?: boolean;
    seriesTickers?: string;
    isInitialized?: boolean;
    status?: "initialized" | "active" | "inactive" | "closed" | "determined";
    sort?: "volume" | "volume24h" | "liquidity" | "openInterest" | "startDate";
}
