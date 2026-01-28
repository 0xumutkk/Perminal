"use client";

import { useState, useEffect, useCallback } from "react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useWallets } from "@/hooks/useAuth";

// Solana RPC endpoint helper
const getRpcUrl = () => {
    if (typeof window !== "undefined") {
        return `${window.location.origin}/api/rpc`;
    }
    return ""; // Fallback for SSR, though hook runs on client
};

// USDC Token Mint on Solana Mainnet
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export interface WalletBalanceState {
    solBalance: number;
    usdcBalance: number;
    isLoading: boolean;
    error: string | null;
}

/**
 * Hook to fetch SOL and USDC balances for the connected wallet
 */
export function useWalletBalance() {
    const { activeWallet } = useWallets();
    const [state, setState] = useState<WalletBalanceState>({
        solBalance: 0,
        usdcBalance: 0,
        isLoading: false,
        error: null,
    });

    const fetchBalances = useCallback(async () => {
        if (!activeWallet?.address) {
            setState((s) => ({ ...s, solBalance: 0, usdcBalance: 0 }));
            return;
        }

        setState((s) => ({ ...s, isLoading: true, error: null }));

        try {
            const rpcUrl = getRpcUrl();
            if (!rpcUrl) return;
            const connection = new Connection(rpcUrl, "confirmed");
            const publicKey = new PublicKey(activeWallet.address);

            // Fetch SOL balance
            const solBalance = await connection.getBalance(publicKey);
            const solAmount = solBalance / LAMPORTS_PER_SOL;

            // Fetch USDC balance (SPL Token)
            let usdcAmount = 0;
            try {
                const usdcMint = new PublicKey(USDC_MINT);
                const tokenAccounts = await connection.getTokenAccountsByOwner(
                    publicKey,
                    { mint: usdcMint }
                );

                if (tokenAccounts.value.length > 0) {
                    // Get balance from the first token account
                    const accountInfo = await connection.getTokenAccountBalance(
                        tokenAccounts.value[0].pubkey
                    );
                    usdcAmount = accountInfo.value.uiAmount || 0;
                }
            } catch (tokenError) {
                // User might not have a USDC token account, which is fine
                console.log("[useWalletBalance] No USDC account found");
            }

            setState({
                solBalance: solAmount,
                usdcBalance: usdcAmount,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            console.error("[useWalletBalance] Error fetching balances:", error);
            setState((s) => ({
                ...s,
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to fetch balance",
            }));
        }
    }, [activeWallet?.address]);

    // Fetch balances on wallet change
    useEffect(() => {
        fetchBalances();
    }, [fetchBalances]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (!activeWallet?.address) return;

        const interval = setInterval(fetchBalances, 30000);
        return () => clearInterval(interval);
    }, [activeWallet?.address, fetchBalances]);

    return {
        ...state,
        refetch: fetchBalances,
        // Formatted display values
        formattedSol: state.solBalance.toFixed(4),
        formattedUsdc: `$${state.usdcBalance.toFixed(2)}`,
    };
}
