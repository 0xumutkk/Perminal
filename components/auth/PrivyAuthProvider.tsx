"use client";

/**
 * Privy Auth Provider - Enforces Solana Wallet Creation
 */

import { useMemo, useEffect, useState, useCallback, type ReactNode, useRef } from "react";
import { usePrivy, useSolanaWallets, useWallets, useCreateWallet } from "@privy-io/react-auth";
import { AuthContext, type AuthContextValue, type WalletInfo } from "@/hooks/useAuth";
import type { VersionedTransaction } from "@solana/web3.js";

export function PrivyAuthProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated, login, logout, user } = usePrivy();
  
  // Hook'lardan cüzdan listelerini al
  const { wallets: solanaWallets } = useSolanaWallets();
  const { wallets: allWallets } = useWallets();
  
  // Cüzdan oluşturma fonksiyonları
  // Öncelik: useSolanaWallets içindeki createWallet (eğer SDK destekliyorsa)
  // Fallback: useCreateWallet (genel oluşturucu)
  const { createWallet: createSolanaSpecific } = useSolanaWallets();
  const { createWallet: createGeneric } = useCreateWallet();
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
      const solanaFiltered = allWallets.filter((w) => w.chainType === "solana");
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
        (allWallets && allWallets.some(w => w.chainType === 'solana'));

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
      if (typeof wallet.getAddress === 'function') {
        wallet.getAddress().then((addr) => {
          if (isMounted && addr) {
            setWalletAddresses(prev => new Map(prev).set(walletId, addr));
          }
        }).catch(() => {}); // Sessiz hata
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

        // Transaction İmzalama Wrapper'ı
        const signTransaction = async (tx: unknown): Promise<VersionedTransaction> => {
          if ('signTransaction' in wallet && typeof (wallet as any).signTransaction === "function") {
            return await (wallet as any).signTransaction(tx as VersionedTransaction);
          }
          throw new Error("Wallet does not support transaction signing");
        };

        return { address, signTransaction } as WalletInfo;
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