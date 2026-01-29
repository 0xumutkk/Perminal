"use client";

/**
 * Auth Context that provides unified auth state
 * Works with or without Privy being configured
 */

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

export interface WalletInfo {
  address: string;
  signTransaction: (tx: unknown) => Promise<unknown>;
}

export interface AuthContextValue {
  ready: boolean;
  authenticated: boolean;
  user: { email?: { address: string } } | null;
  wallets: WalletInfo[];
  activeWallet: WalletInfo | null;
  login: () => void;
  logout: () => Promise<void>;
  fundWallet: () => Promise<void>;
  signAndSendTransaction: (tx: Uint8Array) => Promise<{ signature: string }>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

// Check if Privy is properly configured (same check as providers.tsx)
export function isPrivyConfigured(): boolean {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  if (!appId) return false;
  if (appId.length < 20) return false;
  if (appId.toLowerCase().includes("your")) return false;
  if (appId.toLowerCase().includes("placeholder")) return false;
  if (appId.toLowerCase().includes("example")) return false;
  if (appId === "your_privy_app_id") return false;
  return true;
}

/**
 * Fallback provider for when Privy is not configured
 */
export function FallbackAuthProvider({ children }: { children: ReactNode }) {
  const login = useCallback(() => {
    console.log(
      "Privy not configured. Set NEXT_PUBLIC_PRIVY_APP_ID in .env.local"
    );
    alert(
      "Wallet connection requires Privy configuration.\n\n" +
      "Please set NEXT_PUBLIC_PRIVY_APP_ID in your .env.local file.\n" +
      "Get your App ID from https://dashboard.privy.io"
    );
  }, []);

  const logout = useCallback(async () => {
    console.log("No session to logout");
  }, []);

  const fundWallet = useCallback(async () => {
    console.log("Privy not configured. Cannot fund wallet.");
  }, []);

  const signAndSendTransaction = useCallback(async () => {
    throw new Error("Privy not configured. Cannot send transaction.");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready: true,
      authenticated: false,
      user: null,
      wallets: [],
      activeWallet: null,
      login,
      logout,
      fundWallet,
      signAndSendTransaction,
    }),
    [login, logout, fundWallet, signAndSendTransaction]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

/**
 * Hook to access auth state
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    // Return a default value when outside provider (SSR or error case)
    return {
      ready: false,
      authenticated: false,
      user: null,
      wallets: [],
      activeWallet: null,
      login: () => {
        console.warn("useAuth called outside AuthContext");
      },
      logout: async () => {
        console.warn("useAuth called outside AuthContext");
      },
      fundWallet: async () => {
        console.warn("useAuth called outside AuthContext");
      },
      signAndSendTransaction: async () => {
        throw new Error("useAuth called outside AuthContext");
      },
    };
  }

  return context;
}

/**
 * Hook to access wallet state
 */
export function useWallets() {
  const { wallets, activeWallet } = useAuth();
  return { wallets, activeWallet };
}
