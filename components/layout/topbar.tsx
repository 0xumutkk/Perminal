"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  LogOut,
  Wallet,
  ChevronDown,
  Copy,
  Check,
  Bell,
  User,
  TrendingUp,
  BarChart3,
  Radio,
  ArrowLeftRight,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth, useWallets } from "@/hooks/useAuth";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/markets", label: "Markets", icon: TrendingUp },
  { href: "/portfolio", label: "Portfolio", icon: BarChart3 },
  { href: "/leaderboard", label: "Leaderboard", icon: Radio }
];

export function Topbar() {
  const { ready, authenticated, login, logout, user, fundWallet } = useAuth();
  const { activeWallet } = useWallets();
  const { formattedUsdc, isLoading: isBalanceLoading } = useWalletBalance();
  const pathname = usePathname();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get wallet address with error handling and debug logging
  const walletAddress = (() => {
    try {
      const addr = activeWallet?.address;
      if (!addr) {
        console.log("[Topbar] No wallet address:", {
          hasActiveWallet: !!activeWallet,
          activeWallet,
          wallets: activeWallet ? undefined : "N/A",
        });
      }
      return addr || null;
    } catch (error) {
      console.error("Error accessing wallet address:", error);
      return null;
    }
  })();

  // Format wallet address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Copy address to clipboard
  const copyAddress = useCallback(async () => {
    if (!walletAddress) {
      console.warn("No wallet address to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
      // Fallback: try using execCommand for older browsers
      try {
        const textArea = document.createElement("textarea");
        textArea.value = walletAddress;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
        console.error("Fallback copy also failed:", fallbackError);
      }
    }
  }, [walletAddress]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    if (isLoggingOut) {
      console.log("[Topbar] Logout already in progress, ignoring");
      return; // Prevent double-click
    }

    if (!logout || typeof logout !== "function") {
      console.error("[Topbar] Logout function is not available:", logout);
      alert("Logout function is not available. Please refresh the page.");
      return;
    }

    console.log("[Topbar] Starting logout process...");
    setShowDropdown(false);
    setIsLoggingOut(true);

    try {
      console.log("[Topbar] Calling logout function...");
      await logout();
      console.log("[Topbar] Logout successful, redirecting...");
      // Redirect to landing page after logout
      router.push("/");
    } catch (error) {
      console.error("[Topbar] Logout error:", error);
      // Still redirect even if logout fails
      router.push("/");
    } finally {
      setIsLoggingOut(false);
      console.log("[Topbar] Logout process completed");
    }
  }, [logout, router, isLoggingOut]);

  // Loading state
  if (!ready) {
    return (
      <header className="flex h-16 items-center justify-between border-b border-slate-900/80 bg-[#020617]/95 px-6 backdrop-blur">
        <div className="flex items-center gap-6">
          <Image
            src="/logo.svg"
            alt="Perminal"
            width={120}
            height={26}
            className="invert h-auto"
            priority
          />
        </div>
        <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-800" />
      </header>
    );
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-900/80 bg-[#020617]/95 px-6 backdrop-blur">
      {/* Left side: Logo + Navigation */}
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Image
          src="/logo.svg"
          alt="Perminal"
          width={120}
          height={26}
          className="invert h-auto"
          priority
        />

        {/* Navigation Links */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/50"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right side: Search + Wallet + Settings + Notifications + User */}
      <div className="flex items-center gap-3">
        {/* Search Icon */}
        <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-900/50 hover:text-slate-100">
          <Search className="h-5 w-5" />
        </button>

        {authenticated ? (
          <>
            {/* Wallet Balance */}
            <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/30 px-3 py-1.5">
              <Wallet className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">
                {isBalanceLoading ? "..." : formattedUsdc}
              </span>
            </div>

            {/* Notifications */}
            <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-900/50 hover:text-slate-100">
              <Bell className="h-5 w-5" />
            </button>

            {/* Deposit */}
            <button
              onClick={fundWallet}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-900/50 hover:text-slate-100"
            >
              Deposit
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-900/50 hover:text-slate-100"
              >
                <User className="h-5 w-5" />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-xl">
                  {/* User Info */}
                  {user?.email && (
                    <div className="mb-3 border-b border-slate-800 pb-3">
                      <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                        Logged in as
                      </p>
                      <p className="truncate text-sm font-medium text-slate-200">
                        {user.email.address}
                      </p>
                    </div>
                  )}

                  {/* Wallet Address */}
                  {walletAddress ? (
                    <div className="mb-3">
                      <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                        Wallet
                      </p>
                      <div className="flex items-center justify-between rounded-lg bg-slate-900/50 px-2 py-1.5">
                        <p className="font-mono text-xs text-slate-300">
                          {formatAddress(walletAddress)}
                        </p>
                        <button
                          onClick={copyAddress}
                          className="rounded p-1 hover:bg-slate-800 transition-colors"
                        >
                          {copied ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3 text-slate-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                        Wallet
                      </p>
                      <div className="flex items-center gap-2 rounded-lg bg-slate-900/50 px-2 py-1.5">
                        <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                        <p className="text-xs text-slate-400">
                          Creating embedded wallet...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Logout Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("[Topbar] Disconnect button clicked");
                      handleLogout();
                    }}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Disconnecting...
                      </>
                    ) : (
                      <>
                        <LogOut className="h-4 w-4" />
                        Disconnect
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Connect Button */
          <Button
            variant="default"
            size="sm"
            className="bg-emerald-500 text-xs hover:bg-emerald-400 text-slate-950"
            onClick={login}
          >
            <Wallet className="mr-2 h-4 w-4" />
            Connect
          </Button>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </header>
  );
}
