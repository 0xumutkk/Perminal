/**
 * DFlow Trade API Service
 * Documentation: https://pond.dflow.net/introduction
 *
 * Handles prediction market trading on Solana via DFlow's unified Trade API
 * Supports both sync and async execution modes
 * 
 * TODO: Confirm the dFlow Prediction Markets metadata API endpoint with dFlow team.
 * This service handles trading/swaps. For market listings with yesMint/noMint,
 * see app/api/markets/route.ts which fetches from DFLOW_MARKETS_API_URL.
 */

// Solana token mint addresses
export const TOKENS = {
  SOL: "So11111111111111111111111111111111111111112",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
} as const;

// USDC has 6 decimals
export const USDC_DECIMALS = 6;

export interface DFlowQuoteRequest {
  inputMint?: string; // Default: USDC
  outputMint: string; // Token to receive
  amount: string; // Amount in smallest unit (lamports for USDC = amount * 10^6)
  slippageBps?: string; // Default: 50 (0.5%)
  userPublicKey: string; // User's Solana wallet
}

export interface DFlowQuoteResponse {
  // Transaction data
  transaction: string; // Base64 encoded transaction to sign
  lastValidBlockHeight: number;

  // Execution mode
  executionMode: "sync" | "async";

  // Quote details
  inAmount: string;
  outAmount: string;
  priceImpactPct: string;

  // Route information
  routePlan: Array<{
    swapInfo: {
      ammKey: string;
      label: string;
      inputMint: string;
      outputMint: string;
      inAmount: string;
      outAmount: string;
      feeAmount: string;
      feeMint: string;
    };
    percent: number;
  }>;

  // For async orders
  orderId?: string;
}

export interface DFlowOrderStatus {
  status: "pending" | "processing" | "completed" | "failed";
  signature?: string;
  error?: string;
  inAmount?: string;
  outAmount?: string;
}

class DFlowService {
  /**
   * Get a swap quote from DFlow
   * Returns transaction to sign and quote details
   */
  async getQuote(params: {
    outputMint: string;
    amountUsdc: number;
    userPublicKey: string;
    slippageBps?: number;
  }): Promise<DFlowQuoteResponse> {
    // Convert USDC amount to smallest unit (6 decimals)
    const amountLamports = Math.floor(params.amountUsdc * Math.pow(10, USDC_DECIMALS));

    const searchParams = new URLSearchParams({
      inputMint: TOKENS.USDC,
      outputMint: params.outputMint,
      amount: amountLamports.toString(),
      slippageBps: (params.slippageBps || 50).toString(),
      userPublicKey: params.userPublicKey,
    });

    const response = await fetch(`/api/dflow/quote?${searchParams}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `DFlow quote failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get order status for async execution
   */
  async getOrderStatus(signature: string): Promise<DFlowOrderStatus> {
    const response = await fetch(`/api/dflow/status?signature=${signature}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `Status check failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Poll for async order completion
   * @param signature - Transaction signature
   * @param maxAttempts - Maximum polling attempts (default: 30)
   * @param intervalMs - Polling interval in ms (default: 2000)
   */
  async waitForCompletion(
    signature: string,
    maxAttempts = 30,
    intervalMs = 2000
  ): Promise<DFlowOrderStatus> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getOrderStatus(signature);

      if (status.status === "completed" || status.status === "failed") {
        return status;
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error("Order polling timeout");
  }

  /**
   * Format amount for display
   */
  formatUsdcAmount(lamports: string | number): string {
    const amount = typeof lamports === "string" ? parseInt(lamports) : lamports;
    return (amount / Math.pow(10, USDC_DECIMALS)).toFixed(2);
  }
}

export const dflowService = new DFlowService();
