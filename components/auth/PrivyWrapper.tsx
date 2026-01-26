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
        // With walletChainType: "solana-only", this will only create Solana wallets
        // Per Privy documentation: createOnLogin works with walletChainType to determine chain
        embeddedWallets: {
          // Create wallet on login for all users
          // Since walletChainType is "solana-only", this will only create Solana wallets
          createOnLogin: "all-users",

          // Ensure wallet is ready before using
          noPromptOnSignature: false,
        },

        // Solana RPC configuration (required for embedded wallet operations)
        // Format: object with cluster identifiers as keys
        // Solana RPC configuration
        // Using solanaClusters as per PrivyClientConfig type definition
        solanaClusters: [
          {
            name: "mainnet-beta",
            rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
          },
        ],

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
