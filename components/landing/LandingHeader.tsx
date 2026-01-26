"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Twitter, Send, MessageCircle } from "lucide-react";

export function LandingHeader() {
  const { login, authenticated } = useAuth();
  const router = useRouter();

  const handleGoToApp = () => {
    router.push("/markets");
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-800/50 bg-[#020617]/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Image
            src="/logo.svg"
            alt="Perminal"
            width={150}
            height={32}
            className="invert h-auto"
            priority
          />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Social Links */}
          <div className="hidden items-center gap-2 sm:flex">
            <a
              href="https://twitter.com/perminal"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="https://t.me/perminal"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
            >
              <Send className="h-5 w-5" />
            </a>
            <a
              href="https://discord.gg/perminal"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2">
            {authenticated ? (
              <button
                onClick={handleGoToApp}
                className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-slate-950 transition-colors hover:bg-emerald-400"
              >
                Go to App
              </button>
            ) : (
              <>
                <button
                  onClick={login}
                  className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-700"
                >
                  Login
                </button>
                <button
                  onClick={login}
                  className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-slate-950 transition-colors hover:bg-emerald-400"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
