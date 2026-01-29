"use client";

/**
 * Privy Auth Provider - Enforces Solana Wallet Creation
 */

import { useMemo, useEffect, useState, useCallback, type ReactNode, useRef } from "react";
import { usePrivy, useWallets as useGlobalWallets, useCreateWallet as useGlobalCreateWallet } from "@privy-io/react-auth";
import { useFundWallet, useWallets as useSolanaWallets, useCreateWallet as useSolanaCreateWallet, useSignAndSendTransaction } from "@privy-io/react-auth/solana";
import { AuthContext, type AuthContextValue, type WalletInfo } from "@/hooks/useAuth";
import type { VersionedTransaction } from "@solana/web3.js";

export function PrivyAuthProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated, login, logout, user } = usePrivy();

  // Hook'lardan cüzdan listelerini al
  const { wallets: solanaWallets } = useSolanaWallets();
  const { wallets: allWallets } = useGlobalWallets();

  // Cüzdan oluşturma fonksiyonları
  // Öncelik: useSolanaCreateWallet içindeki createWallet (eğer SDK destekliyorsa)
  // Fallback: useGlobalCreateWallet (genel oluşturucu)
  const { createWallet: createSolanaSpecific } = useSolanaCreateWallet();
  const { createWallet: createGeneric } = useGlobalCreateWallet();
  const createWallet = createSolanaSpecific || createGeneric;

  // State yönetimi
  const [walletAddresses, setWalletAddresses] = useState<Map<string, string>>(new Map());

  // Creating durumunu Ref ile takip ediyoruz (State'den daha hızlı ve güvenlidir)
  const isCreatingRef = useRef(false);

  // 1. Cüzdanları Filtreleme Mantığı (Değişmedi, gayet iyi çalışıyor)
  const wallets = useMemo(() => {
    // Önce doğrudan Solana cüzdanlarını dene
    if (solanaWallets && solanaWallets.length > 0) {
      return solanaWallets;
    }

    // Yoksa genel listeden filtrele
    if (allWallets && allWallets.length > 0) {
      const solanaFiltered = allWallets.filter((w) => 'chainType' in w && w.chainType === "solana");
      if (solanaFiltered.length > 0) {
        return solanaFiltered;
      }
    }
    return [];
  }, [solanaWallets, allWallets]);

  // 2. MANUEL CÜZDAN OLUŞTURMA (Otomatik Tetikleyici)
  useEffect(() => {
    // Privy hazır değilse veya kullanıcı giriş yapmamışsa işlem yapma
    if (!ready || !authenticated || !user) return;

    // Halihazırda oluşturma işlemi sürüyorsa dur
    if (isCreatingRef.current) return;

    const enforceSolanaWallet = async () => {
      // KONTROL 1: Aktif cüzdan listesinde Solana var mı?
      const hasWalletInList =
        (solanaWallets && solanaWallets.length > 0) ||
        (allWallets && allWallets.some(w => 'chainType' in w && w.chainType === 'solana'));

      // KONTROL 2: Kullanıcı profilinde (linkedAccounts) Solana cüzdanı var mı?
      // (Cüzdan oluşturulmuş ama henüz listeye yüklenmemiş olabilir)
      const hasWalletInProfile = user.linkedAccounts.some(
        (acc) => acc.type === 'wallet' && acc.chainType === 'solana'
      );

      // Eğer cüzdan zaten varsa çık
      if (hasWalletInList || hasWalletInProfile) {
        return;
      }

      // Cüzdan yoksa ve oluşturucu fonksiyon mevcutsa OLUŞTUR
      if (createWallet) {
        console.log("[PrivyAuthProvider] Solana wallet missing. Triggering MANUAL creation...");
        isCreatingRef.current = true;

        try {
          // PrivyWrapper'da 'solana-only' olduğu için bu Solana üretecektir
          await createWallet();
          console.log("[PrivyAuthProvider] Wallet created successfully.");
        } catch (error: any) {
          // "Already has wallet" hatası normaldir (Race condition), yoksay.
          const msg = error?.message || String(error);
          if (!msg.includes("already has")) {
            console.error("[PrivyAuthProvider] Creation failed:", error);
          }
        } finally {
          isCreatingRef.current = false;
        }
      }
    };

    // Çok kısa bir gecikme ile çalıştır (Hook senkronizasyonu için)
    const timer = setTimeout(enforceSolanaWallet, 100);
    return () => clearTimeout(timer);

  }, [ready, authenticated, user, solanaWallets, allWallets, createWallet]);


  // 3. Adres Çözümleme (Address Polling)
  // Cüzdan objesi var ama adresi henüz gelmemişse (asenkron) yakalar
  useEffect(() => {
    if (!wallets || wallets.length === 0) return;

    let isMounted = true;

    wallets.forEach((wallet, index) => {
      const walletId = `wallet-${index}`;

      // Zaten adresimiz varsa geç
      if (walletAddresses.has(walletId)) return;

      // 1. Yöntem: Doğrudan property
      if (wallet.address) {
        setWalletAddresses(prev => new Map(prev).set(walletId, wallet.address));
        return;
      }

      // 2. Yöntem: getAddress() metodu (Asenkron deneme)
      if ('getAddress' in wallet && typeof (wallet as any).getAddress === 'function') {
        (wallet as any).getAddress().then((addr: string) => {
          if (isMounted && addr) {
            setWalletAddresses(prev => new Map(prev).set(walletId, addr));
          }
        }).catch(() => { }); // Sessiz hata
      }
    });

    return () => { isMounted = false; };
  }, [wallets, walletAddresses]);


  // 4. Context Değerlerini Hazırla
  const mappedWallets = useMemo<WalletInfo[]>(() => {
    return wallets
      .map((wallet, index) => {
        const walletId = `wallet-${index}`;

        // Adresi bulmaya çalış (State'den veya direkt objeden)
        const address = wallet.address || walletAddresses.get(walletId) || "";

        if (!address) return null;

        // Transaction İmzalama Wrapper'ı (sadece imza)
        const signTransaction = async (tx: unknown): Promise<VersionedTransaction> => {
          if ('signTransaction' in wallet && typeof (wallet as any).signTransaction === "function") {
            return await (wallet as any).signTransaction(tx as VersionedTransaction);
          }
          throw new Error("Wallet does not support transaction signing");
        };

        // Sign ve Send Wrapper'ı (Privy'nin native RPC kullanması için)
        const signAndSendTransaction = async (tx: unknown): Promise<{ signature: string }> => {
          if ('signAndSendTransaction' in wallet && typeof (wallet as any).signAndSendTransaction === "function") {
            const result = await (wallet as any).signAndSendTransaction(tx as VersionedTransaction);
            return { signature: result.signature || result };
          }
          throw new Error("Wallet does not support signAndSendTransaction");
        };

        return { address, signTransaction, signAndSendTransaction } as WalletInfo;
      })
      .filter((w): w is WalletInfo => w !== null);
  }, [wallets, walletAddresses]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setWalletAddresses(new Map()); // State temizle
    } catch (e) {
      console.error("Logout error:", e);
    }
  }, [logout]);

  // Fund wallet hook from Privy
  const { fundWallet: privyFundWallet } = useFundWallet();

  const handleFundWallet = useCallback(async () => {
    if (!mappedWallets[0]?.address) {
      console.error("[PrivyAuthProvider] No wallet address to fund");
      return;
    }

    try {
      await privyFundWallet({
        address: mappedWallets[0].address,
      });
    } catch (error) {
      console.error("[PrivyAuthProvider] Fund wallet error:", error);
    }
  }, [privyFundWallet, mappedWallets]);

  // Sign and send transaction hook from Privy
  const { signAndSendTransaction: privySignAndSend } = useSignAndSendTransaction();

  const handleSignAndSendTransaction = useCallback(async (transaction: Uint8Array): Promise<{ signature: string }> => {
    const wallet = wallets[0];
    if (!wallet) {
      throw new Error("No wallet connected");
    }

    console.log("[PrivyAuthProvider] Signing and sending transaction...");

    const result = await privySignAndSend({
      transaction,
      wallet: wallet as any, // Privy expects their wallet type
    });

    // Convert Uint8Array signature to base58 string
    const signatureBytes = result.signature;
    const signatureStr = typeof signatureBytes === 'string'
      ? signatureBytes
      : Buffer.from(signatureBytes).toString('base64');

    console.log("[PrivyAuthProvider] Transaction sent:", signatureStr);

    return { signature: signatureStr };
  }, [privySignAndSend, wallets]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      authenticated,
      user,
      wallets: mappedWallets,
      activeWallet: mappedWallets[0] || null,
      login,
      logout: handleLogout,
      fundWallet: handleFundWallet,
      signAndSendTransaction: handleSignAndSendTransaction,
    }),
    [ready, authenticated, user, mappedWallets, login, handleLogout, handleFundWallet, handleSignAndSendTransaction]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}