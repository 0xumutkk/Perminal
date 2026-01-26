"use client";

/**
 * Privy Auth Provider - only used when Privy is configured
 * This file imports Privy hooks, so it should only be rendered inside PrivyProvider
 */

import { useMemo, useEffect, useState, useCallback, type ReactNode } from "react";
import { usePrivy, useSolanaWallets, useWallets, useCreateWallet } from "@privy-io/react-auth";
import { AuthContext, type AuthContextValue, type WalletInfo } from "@/hooks/useAuth";
import type { VersionedTransaction } from "@solana/web3.js";

export function PrivyAuthProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets: solanaWallets } = useSolanaWallets();
  const { wallets: allWallets } = useWallets();
  // useCreateWallet - PrivyProvider config (walletChainType: "solana-only") should enforce Solana wallet creation
  const { createWallet: createSolanaWallet } = useCreateWallet();
  
  // State to track wallet addresses (for wallets that may not have address immediately)
  const [walletAddresses, setWalletAddresses] = useState<Map<string, string>>(new Map());
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);

  // Filter Solana wallets from all wallets (in case useSolanaWallets doesn't work)
  const wallets = useMemo(() => {
    // First try to use Solana wallets directly
    if (solanaWallets && solanaWallets.length > 0) {
      console.log("[PrivyAuthProvider] Using Solana wallets from useSolanaWallets:", solanaWallets.length);
      return solanaWallets;
    }

    // If no Solana wallets, try to filter from all wallets
    if (allWallets && allWallets.length > 0) {
      const solanaWalletsFiltered = allWallets.filter((wallet: any, index: number) => {
        // Check if wallet is a Solana wallet
        // For new wallets, address might not be set yet, so we check chainType
        const hasAddress = wallet.address && typeof wallet.address === "string" && wallet.address.length >= 32 && wallet.address.length <= 44;
        const walletId = `wallet-${index}`;
        const hasStoredAddress = walletAddresses.has(walletId);
        
        // STRICT: Only accept wallets with chainType === "solana"
        // This prevents Ethereum wallets from being included
        const isSolana = wallet.chainType === "solana";
        
        if (isSolana) {
          console.log("[PrivyAuthProvider] Found Solana wallet in allWallets:", {
            chainType: wallet.chainType,
            walletClientType: wallet.walletClientType,
            address: wallet.address,
            hasAddress,
            hasStoredAddress,
            walletId,
            keys: Object.keys(wallet),
          });
        }
        return isSolana;
      });

      if (solanaWalletsFiltered.length > 0) {
        console.log("[PrivyAuthProvider] Filtered Solana wallets from allWallets:", solanaWalletsFiltered.length);
        return solanaWalletsFiltered;
      }
    }

    console.warn("[PrivyAuthProvider] No Solana wallets found. allWallets:", allWallets?.length || 0, "solanaWallets:", solanaWallets?.length || 0);
    return [];
  }, [solanaWallets, allWallets, walletAddresses]);

  // Auto-create Solana wallet if user is authenticated but has no Solana wallets
  useEffect(() => {
    if (!ready || !authenticated || isCreatingWallet) {
      return;
    }

    // Wait a bit for Privy's automatic wallet creation to complete
    const checkAndCreateWallet = async () => {
      // Wait 3 seconds for automatic wallet creation
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Check if user has Solana wallets
      const hasSolanaWallets = (solanaWallets && solanaWallets.length > 0) || 
        (allWallets && allWallets.some((w: any) => w.chainType === "solana"));
      
      // Log all wallet chain types for debugging
      if (allWallets && allWallets.length > 0) {
        console.log("[PrivyAuthProvider] Checking wallet chain types:", 
          allWallets.map((w: any, i: number) => ({
            index: i,
            chainType: w.chainType,
            walletClientType: w.walletClientType,
            address: w.address || "NO ADDRESS",
          }))
        );
      }
      
      if (!hasSolanaWallets && createSolanaWallet) {
        console.log("[PrivyAuthProvider] No Solana wallets found after 3 seconds. Attempting to create Solana wallet...");
        console.log("[PrivyAuthProvider] Current wallets:", {
          allWalletsCount: allWallets?.length || 0,
          solanaWalletsCount: solanaWallets?.length || 0,
          walletChainTypes: allWallets?.map((w: any) => w.chainType) || [],
        });
        
        setIsCreatingWallet(true);
        
        try {
          await createSolanaWallet();
          console.log("[PrivyAuthProvider] Solana wallet created successfully");
        } catch (error: any) {
          // If user already has a wallet (Ethereum), Privy may not allow creating another
          // This is expected for users who already have Ethereum wallets
          const errorMessage = error?.message || String(error);
          if (errorMessage.includes("already has an embedded wallet")) {
            console.warn("[PrivyAuthProvider] User already has an embedded wallet (likely Ethereum).");
            console.warn("[PrivyAuthProvider] CRITICAL: Check Privy Dashboard settings:");
            console.warn("[PrivyAuthProvider] 1. Go to https://dashboard.privy.io");
            console.warn("[PrivyAuthProvider] 2. Navigate to App Settings > Embedded Wallets");
            console.warn("[PrivyAuthProvider] 3. Ensure 'Solana' is ENABLED");
            console.warn("[PrivyAuthProvider] 4. Ensure 'Ethereum' is DISABLED (or both enabled if multi-chain needed)");
            console.warn("[PrivyAuthProvider] 5. For existing users with Ethereum wallets, they may need to:");
            console.warn("[PrivyAuthProvider]    - Use a new email/account, OR");
            console.warn("[PrivyAuthProvider]    - Delete existing wallet from Privy Dashboard");
          } else {
            console.error("[PrivyAuthProvider] Failed to create Solana wallet:", error);
          }
        } finally {
          setIsCreatingWallet(false);
        }
      } else if (hasSolanaWallets) {
        console.log("[PrivyAuthProvider] Solana wallet(s) already exist, skipping creation");
      }
    };

    checkAndCreateWallet();
  }, [ready, authenticated, allWallets, solanaWallets, createSolanaWallet, isCreatingWallet]);

  // Monitor wallet creation status for debugging
  useEffect(() => {
    if (!authenticated || !ready) {
      return;
    }

    // Log wallet creation status every 3 seconds for debugging
    const intervalId = setInterval(() => {
      console.log("[PrivyAuthProvider] Wallet creation status:", {
        authenticated,
        ready,
        allWalletsCount: allWallets?.length || 0,
        solanaWalletsCount: solanaWallets?.length || 0,
        filteredWalletsCount: wallets?.length || 0,
        hasAnyWallets: !!(allWallets && allWallets.length > 0) || !!(solanaWallets && solanaWallets.length > 0),
        walletAddressesCount: walletAddresses.size,
        isCreatingWallet,
      });

      // Log all wallet chain types
      if (allWallets && allWallets.length > 0) {
        allWallets.forEach((wallet: any, index: number) => {
          console.log(`[PrivyAuthProvider] Wallet ${index} chain type:`, wallet.chainType, "address:", wallet.address || "NO ADDRESS");
        });
      }
    }, 3000);

    // Cleanup after 60 seconds
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
    }, 60000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [authenticated, ready, allWallets, solanaWallets, wallets, walletAddresses, isCreatingWallet]);

  // Poll for wallet addresses when wallets exist but addresses aren't available yet
  useEffect(() => {
    if (!authenticated || !ready || !wallets || wallets.length === 0) {
      return;
    }

    let isMounted = true;
    const addressPromises: Promise<void>[] = [];

    wallets.forEach((wallet: any, index: number) => {
      const walletId = `wallet-${index}`;
      
      // If we already have the address, skip
      if (walletAddresses.has(walletId)) {
        return;
      }

      // If wallet already has address, store it
      if (wallet.address && typeof wallet.address === "string" && wallet.address.length > 0) {
        if (isMounted) {
          console.log(`[PrivyAuthProvider] Storing address for wallet ${index}:`, wallet.address);
          setWalletAddresses((prev) => {
            const updated = new Map(prev);
            updated.set(walletId, wallet.address);
            return updated;
          });
        }
        return;
      }

      // Try to get address asynchronously
      const addressPromise = (async () => {
        try {
          // Method 1: Try getAddress method if available
          if (typeof wallet.getAddress === "function") {
            console.log(`[PrivyAuthProvider] Attempting to get address for wallet ${index} via getAddress()...`);
            const address = await wallet.getAddress();
            if (address && typeof address === "string" && address.length > 0 && isMounted) {
              console.log(`[PrivyAuthProvider] Successfully got address for wallet ${index}:`, address);
              setWalletAddresses((prev) => {
                const updated = new Map(prev);
                updated.set(walletId, address);
                return updated;
              });
              return;
            }
          }

          // Method 2: Wait a bit and check if address is set (for wallets that are still initializing)
          // Also try getAddress() periodically in case it becomes available
          for (let attempt = 0; attempt < 30; attempt++) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            
            if (!isMounted) return;
            
            // Try getAddress() again (it might become available)
            if (typeof wallet.getAddress === "function") {
              try {
                const address = await wallet.getAddress();
                if (address && typeof address === "string" && address.length > 0) {
                  console.log(`[PrivyAuthProvider] Address became available via getAddress() for wallet ${index} after ${attempt + 1} attempts:`, address);
                  setWalletAddresses((prev) => {
                    const updated = new Map(prev);
                    updated.set(walletId, address);
                    return updated;
                  });
                  return;
                }
              } catch (error) {
                // getAddress() might fail initially, that's ok
              }
            }
            
            // Check if address property is now available
            if (wallet.address && typeof wallet.address === "string" && wallet.address.length > 0) {
              console.log(`[PrivyAuthProvider] Address became available for wallet ${index} after ${attempt + 1} attempts:`, wallet.address);
              setWalletAddresses((prev) => {
                const updated = new Map(prev);
                updated.set(walletId, wallet.address);
                return updated;
              });
              return;
            }
          }
          
          console.warn(`[PrivyAuthProvider] Could not get address for wallet ${index} after 30 attempts (15 seconds)`);
        } catch (error) {
          console.error(`[PrivyAuthProvider] Error getting address for wallet ${index}:`, error);
        }
      })();

      addressPromises.push(addressPromise);
    });

    return () => {
      isMounted = false;
    };
  }, [authenticated, ready, wallets, walletAddresses]);


  // Debug: Log wallet creation status
  useEffect(() => {
    if (authenticated && ready) {
      console.log("[PrivyAuthProvider] Auth state:", {
        authenticated,
        ready,
        solanaWalletsCount: solanaWallets?.length || 0,
        allWalletsCount: allWallets?.length || 0,
        filteredWalletsCount: wallets?.length || 0,
        hasWallets: !!(wallets && wallets.length > 0),
      });

      if (allWallets && allWallets.length > 0) {
        console.log("[PrivyAuthProvider] All wallets details:");
        allWallets.forEach((wallet: any, index: number) => {
          console.log(`[PrivyAuthProvider] Wallet ${index} (allWallets):`, {
            chainType: wallet.chainType,
            walletClientType: wallet.walletClientType,
            address: wallet.address,
            hasAddress: !!wallet.address,
            addressType: typeof wallet.address,
            addressLength: wallet.address?.length || 0,
            walletType: wallet.constructor?.name,
            allKeys: Object.keys(wallet),
          });
        });
      }

      if (wallets && wallets.length > 0) {
        wallets.forEach((wallet, index) => {
          console.log(`[PrivyAuthProvider] Wallet ${index} (filtered Solana):`, {
            address: wallet.address,
            hasAddress: !!wallet.address,
            addressType: typeof wallet.address,
            addressLength: wallet.address?.length || 0,
            walletType: wallet.constructor?.name,
            allKeys: Object.keys(wallet),
          });
        });
      } else {
        console.warn("[PrivyAuthProvider] User is authenticated but no Solana wallets found. All wallets:", allWallets?.length || 0);
      }
    }
  }, [authenticated, ready, wallets, solanaWallets, allWallets]);

  // Map Privy wallets to WalletInfo format
  const mappedWallets = useMemo<WalletInfo[]>(() => {
    if (!wallets || wallets.length === 0) {
      console.log("[PrivyAuthProvider] No wallets available");
      return [];
    }

    console.log("[PrivyAuthProvider] Wallets:", wallets);
    console.log("[PrivyAuthProvider] First wallet structure:", wallets[0]);

    return wallets
      .map((wallet, index) => {
        const walletId = `wallet-${index}`;
        
        // Debug: Log wallet structure
        console.log(`[PrivyAuthProvider] Wallet ${index}:`, {
          wallet,
          hasAddress: 'address' in wallet,
          address: wallet.address,
          storedAddress: walletAddresses.get(walletId),
          walletType: wallet.constructor?.name,
          keys: Object.keys(wallet),
        });

        // Privy Solana wallets might have different structure
        // Try multiple ways to get the address
        let address = "";
        
        // Method 1: Direct address property (most common for Privy Solana wallets)
        if (typeof wallet.address === "string" && wallet.address.length > 0) {
          address = wallet.address;
        }
        // Method 2: Check stored address from state (for wallets that had address set later)
        else if (walletAddresses.has(walletId)) {
          address = walletAddresses.get(walletId) || "";
        }
        // Method 3: Try publicKey property (only for Solana wallets)
        else if ('publicKey' in wallet && (wallet as any).publicKey) {
          const pubKey = (wallet as any).publicKey;
          address = typeof pubKey === "string" ? pubKey : pubKey.toString();
        }

        console.log(`[PrivyAuthProvider] Wallet ${index} resolved address:`, address || "NOT FOUND");

        if (!address) {
          console.warn(`[PrivyAuthProvider] Could not extract address from wallet ${index} - wallet may still be initializing. Wallet structure:`, {
            hasAddress: 'address' in wallet,
            hasPublicKey: 'publicKey' in wallet,
            storedAddress: walletAddresses.get(walletId),
            walletType: wallet.constructor?.name,
            keys: Object.keys(wallet),
          });
          return null; // Return null for wallets without addresses
        }

        // Create a wrapper for signTransaction that handles Privy's wallet API
        const signTransaction = async (tx: unknown): Promise<VersionedTransaction> => {
          if (!wallet) {
            throw new Error("Wallet not available");
          }

          // Privy Solana wallets support signTransaction method
          if ('signTransaction' in wallet && typeof (wallet as any).signTransaction === "function") {
            const signed = await (wallet as any).signTransaction(tx as VersionedTransaction);
            return signed as VersionedTransaction;
          }

          throw new Error("Wallet does not support transaction signing");
        };

        return {
          address,
          signTransaction,
        } as WalletInfo;
      })
      .filter((wallet): wallet is WalletInfo => wallet !== null); // Filter out wallets without addresses
  }, [wallets, walletAddresses]);

  // Wrap logout to handle errors and ensure it's async
  const handleLogout = useCallback(async () => {
    try {
      console.log("[PrivyAuthProvider] Logging out...");
      await logout();
      console.log("[PrivyAuthProvider] Logout successful");
    } catch (error) {
      console.error("[PrivyAuthProvider] Logout error:", error);
      // Even if logout fails, we should clear local state
      // Privy's logout might throw if already logged out, which is fine
      throw error;
    }
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      authenticated,
      user,
      wallets: mappedWallets,
      activeWallet: mappedWallets[0] || null,
      login,
      logout: handleLogout,
    }),
    [ready, authenticated, user, mappedWallets, login, handleLogout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
