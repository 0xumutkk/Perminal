"use client";

/**
 * Privy Wrapper - Contains both PrivyProvider and PrivyAuthProvider
 * This file is lazy loaded only when Privy is properly configured
 */

import { type ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";
import { PrivyAuthProvider } from "./PrivyAuthProvider";

interface PrivyWrapperProps {
  children: ReactNode;
}

// Solana wallet connectors for external wallets (Phantom, Solflare, etc.)
const solanaConnectors = toSolanaWalletConnectors();

// Solana RPC URLs - use environment variables or fall back to public endpoints
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const SOLANA_WS_URL = process.env.NEXT_PUBLIC_SOLANA_WS_URL || "wss://api.mainnet-beta.solana.com";

export default function PrivyWrapper({ children }: PrivyWrapperProps) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        // Login methods
        loginMethods: ["email", "google", "twitter", "wallet"],

        // Appearance - dark theme matching app design
        appearance: {
          theme: "dark",
          accentColor: "#10b981", // emerald-500
          logo: "/logo-white.svg",
          showWalletLoginFirst: true,
          walletChainType: "solana-only",
        },

        // Embedded wallet configuration - SOLANA ONLY
        embeddedWallets: {
          ethereum: {
            createOnLogin: "off",
          },
          solana: {
            createOnLogin: "off",
          },
        },

        // Solana RPC configuration - REQUIRED for signAndSendTransaction
        solana: {
          rpcs: {
            "solana:mainnet": {
              rpc: createSolanaRpc(SOLANA_RPC_URL),
              rpcSubscriptions: createSolanaRpcSubscriptions(SOLANA_WS_URL),
            },
          },
        },

        // External Solana wallets (Phantom, Solflare, etc.)
        externalWallets: {
          solana: {
            connectors: solanaConnectors,
          },
        },

        // Legal
        legal: {
          termsAndConditionsUrl: "https://perminal.io/terms",
          privacyPolicyUrl: "https://perminal.io/privacy",
        },
      }}
    >
      <PrivyAuthProvider>{children}</PrivyAuthProvider>
    </PrivyProvider>
  );
}


