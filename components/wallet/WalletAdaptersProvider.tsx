"use client";

import { useMemo } from "react";
import type { Adapter } from "@solana/wallet-adapter-base";

export function getWalletAdapters(): Adapter[] {
  if (typeof window === "undefined") return [];

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const {
      PhantomWalletAdapter,
      SolflareWalletAdapter
    } = require("@solana/wallet-adapter-wallets");

    return [new PhantomWalletAdapter(), new SolflareWalletAdapter()];
  } catch (error) {
    console.error("Failed to load wallet adapters:", error);
    return [];
  }
}
