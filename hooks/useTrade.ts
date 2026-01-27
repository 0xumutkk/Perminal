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
  const { ready, authenticated } = useAuth();
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

        // Step 2: Deserialize and sign transaction
        console.log(`[Trade] Signing transaction...`);

        const transactionBuffer = Buffer.from(quote.transaction, "base64");
        const transaction = VersionedTransaction.deserialize(transactionBuffer);

        // Sign with wallet - PrivyAuthProvider handles the wallet API differences
        let signedTransaction: VersionedTransaction | Transaction;
        try {
          signedTransaction = await activeWallet.signTransaction(
            transaction
          ) as VersionedTransaction | Transaction;
        } catch (signError) {
          console.error(`[Trade] Signing error:`, signError);
          throw new Error(
            `Failed to sign transaction: ${signError instanceof Error ? signError.message : "Unknown error"}`
          );
        }

        // Validate signed transaction
        if (!signedTransaction) {
          throw new Error("Transaction signing returned null or undefined");
        }

        setState((s) => ({
          ...s,
          isSigning: false,
          isConfirming: true,
        }));

        // Step 3: Send transaction to Solana
        console.log(`[Trade] Sending transaction...`);

        const connection = new Connection(SOLANA_RPC_URL, "confirmed");

        // Serialize the signed transaction with defensive type checking
        let serializedTx: Uint8Array;
        try {
          if (signedTransaction instanceof VersionedTransaction) {
            serializedTx = signedTransaction.serialize();
          } else if (signedTransaction instanceof Transaction) {
            // Handle legacy transactions safely
            serializedTx = signedTransaction.serialize({
              requireAllSignatures: false,
              verifySignatures: false,
            });
          } else {
            throw new Error("Signed transaction is neither VersionedTransaction nor Transaction");
          }
        } catch (serializeError) {
          console.error(`[Trade] Serialization error:`, serializeError);
          throw new Error(
            `Failed to serialize transaction: ${serializeError instanceof Error ? serializeError.message : "Unknown error"}`
          );
        }

        const signature = await connection.sendRawTransaction(
          serializedTx,
          {
            skipPreflight: false,
            maxRetries: 3,
          }
        );

        console.log(`[Trade] Transaction sent: ${signature}`);

        // Step 4: Handle based on execution mode
        if (quote.executionMode === "async") {
          // For async, poll for completion
          console.log(`[Trade] Async mode - waiting for completion...`);

          const status = await dflowService.waitForCompletion(signature);

          if (status.status === "failed") {
            throw new Error(status.error || "Trade execution failed");
          }

          console.log(`[Trade] Async order completed:`, status);
        } else {
          // For sync, confirm transaction
          console.log(`[Trade] Sync mode - confirming transaction...`);

          const latestBlockhash = await connection.getLatestBlockhash();
          const confirmation = await connection.confirmTransaction(
            {
              signature,
              blockhash: latestBlockhash.blockhash,
              lastValidBlockHeight: quote.lastValidBlockHeight,
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

        const message =
          error instanceof Error
            ? error.message
            : "Trade failed. Please try again.";

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
