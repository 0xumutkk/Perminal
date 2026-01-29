"use client";

import { useState, useCallback } from "react";
import { useAuth, useWallets } from "@/hooks/useAuth";
import { Connection, VersionedTransaction, Transaction } from "@solana/web3.js";
import { dflowService, type DFlowQuoteResponse } from "@/lib/services/dflow";

export type TradeSide = "YES" | "NO";

export interface TradeParams {
  marketId: string;
  outputMint: string; // Token mint to receive
  amountUsdc: number; // Amount in USDC
  side: TradeSide;
}

export interface TradeState {
  isLoading: boolean;
  isQuoting: boolean;
  isSigning: boolean;
  isConfirming: boolean;
  error: string | null;
  signature: string | null;
  quote: DFlowQuoteResponse | null;
}

const initialState: TradeState = {
  isLoading: false,
  isQuoting: false,
  isSigning: false,
  isConfirming: false,
  error: null,
  signature: null,
  quote: null,
};

// Solana RPC endpoint
const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  "https://api.mainnet-beta.solana.com";

export function useTrade() {
  const { ready, authenticated, signAndSendTransaction } = useAuth();
  const { activeWallet } = useWallets();
  const [state, setState] = useState<TradeState>(initialState);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);


  /**
   * Get a quote without executing
   */
  const getQuote = useCallback(
    async (params: Omit<TradeParams, "marketId">) => {
      if (!activeWallet?.address) {
        setState((s) => ({ ...s, error: "Wallet not connected" }));
        return null;
      }

      setState((s) => ({ ...s, isQuoting: true, error: null }));

      try {
        const quote = await dflowService.getQuote({
          outputMint: params.outputMint,
          amountUsdc: params.amountUsdc,
          userPublicKey: activeWallet.address,
          slippageBps: 100, // 1% slippage for prediction markets
        });

        setState((s) => ({ ...s, isQuoting: false, quote }));
        return quote;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Quote failed";
        setState((s) => ({ ...s, isQuoting: false, error: message }));
        return null;
      }
    },
    [activeWallet]
  );

  /**
   * Execute a trade (get quote, sign, and submit)
   */
  const buy = useCallback(
    async (params: TradeParams) => {
      // Validate ready state
      if (!ready) {
        setState((s) => ({ ...s, error: "Authentication not ready" }));
        return null;
      }

      // Validate wallet connection
      if (!authenticated || !activeWallet?.address) {
        setState((s) => ({ ...s, error: "Please connect your wallet first" }));
        return null;
      }

      setState({
        ...initialState,
        isLoading: true,
        isQuoting: true,
      });

      try {
        // Step 1: Get quote from DFlow
        console.log(
          `[Trade] Getting quote for ${params.amountUsdc} USDC -> ${params.side}`
        );

        const quote = await dflowService.getQuote({
          outputMint: params.outputMint,
          amountUsdc: params.amountUsdc,
          userPublicKey: activeWallet.address,
          slippageBps: 100,
        });

        setState((s) => ({
          ...s,
          isQuoting: false,
          isSigning: true,
          quote,
        }));

        console.log(`[Trade] Quote received:`, {
          executionMode: quote.executionMode,
          inAmount: dflowService.formatUsdcAmount(quote.inAmount),
          outAmount: quote.outAmount,
          priceImpact: quote.priceImpactPct,
        });

        // Step 2: Deserialize transaction
        console.log(`[Trade] Preparing transaction...`);

        const transactionBuffer = Buffer.from(quote.transaction, "base64");
        const transaction = VersionedTransaction.deserialize(transactionBuffer);

        // Serialize to Uint8Array for Privy's signAndSendTransaction
        const transactionBytes = transaction.serialize();

        // Step 3: Sign and send transaction using Privy hook (from context)
        console.log(`[Trade] Signing and sending via Privy...`);

        const result = await signAndSendTransaction(transactionBytes);
        const signature = result.signature;

        setState((s) => ({
          ...s,
          isSigning: false,
          isConfirming: true,
        }));

        console.log(`[Trade] Transaction sent: ${signature}`);

        // Step 4: Handle based on execution mode
        if (quote.executionMode === "async") {
          // For async, poll dFlow for completion
          console.log(`[Trade] Async mode - waiting for dFlow completion...`);

          const status = await dflowService.waitForCompletion(signature);

          if (status.status === "failed") {
            throw new Error(status.error || "Trade execution failed");
          }

          console.log(`[Trade] Async order completed:`, status);
        } else {
          // For sync mode, Privy's signAndSendTransaction already handles submission
          // Just need to confirm the transaction landed
          console.log(`[Trade] Sync mode - confirming transaction...`);

          const connection = new Connection(SOLANA_RPC_URL, "confirmed");
          const latestBlockhash = await connection.getLatestBlockhash();
          const confirmation = await connection.confirmTransaction(
            {
              signature,
              blockhash: latestBlockhash.blockhash,
              lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            },
            "confirmed"
          );

          if (confirmation.value.err) {
            throw new Error(
              `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
            );
          }

          console.log(`[Trade] Transaction confirmed!`);
        }

        setState({
          isLoading: false,
          isQuoting: false,
          isSigning: false,
          isConfirming: false,
          error: null,
          signature,
          quote,
        });

        return signature;
      } catch (error) {
        console.error(`[Trade] Error:`, error);

        // Parse error for user-friendly messages
        const rawMessage =
          error instanceof Error ? error.message : String(error);

        let message = "Trade failed. Please try again.";

        // Insufficient balance errors
        if (
          rawMessage.toLowerCase().includes("insufficient") ||
          rawMessage.toLowerCase().includes("not enough") ||
          rawMessage.toLowerCase().includes("balance") ||
          rawMessage.includes("0x1") // Solana insufficient funds error code
        ) {
          message = "Insufficient USDC balance. Please add funds to your wallet.";
        }
        // User rejected/cancelled
        else if (
          rawMessage.toLowerCase().includes("user rejected") ||
          rawMessage.toLowerCase().includes("user denied") ||
          rawMessage.toLowerCase().includes("cancelled") ||
          rawMessage.toLowerCase().includes("user exited")
        ) {
          message = "Transaction cancelled.";
        }
        // Wallet connection issues
        else if (
          rawMessage.toLowerCase().includes("connect") ||
          rawMessage.toLowerCase().includes("wallet")
        ) {
          message = "Wallet connection failed. Please try again.";
        }
        // Network/timeout errors
        else if (
          rawMessage.toLowerCase().includes("timeout") ||
          rawMessage.toLowerCase().includes("network")
        ) {
          message = "Network error. Please check your connection.";
        }
        // Slippage errors
        else if (rawMessage.toLowerCase().includes("slippage")) {
          message = "Price moved too much. Please try again.";
        }

        setState({
          ...initialState,
          error: message,
        });

        return null;
      }
    },
    [ready, authenticated, activeWallet]
  );

  return {
    // Actions
    buy,
    getQuote,
    reset,

    // State
    ...state,

    // Helpers
    isWalletConnected: authenticated && !!activeWallet?.address,
    walletAddress: activeWallet?.address,
  };
}
