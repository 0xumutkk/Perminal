"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp, Users, Trophy } from "lucide-react";

export function HeroSection() {
  const { login, authenticated } = useAuth();
  const router = useRouter();

  const handleLaunchApp = () => {
    router.push("/markets");
  };

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-16">
      {/* Grid Background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.3)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_40%,transparent_100%)]" />

      {/* Glow Effects */}
      <div className="pointer-events-none absolute left-1/4 top-1/3 h-96 w-96 rounded-full bg-emerald-500/10 blur-[128px]" />
      <div className="pointer-events-none absolute right-1/4 top-1/2 h-96 w-96 rounded-full bg-indigo-500/10 blur-[128px]" />

      <div className="relative z-10 flex max-w-4xl flex-col items-center text-center">
        {/* Badge */}
        <div className="mb-8 flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-sm font-medium text-emerald-300">
            Powered by Solana & Kalshi
          </span>
        </div>

        {/* Tagline */}
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-slate-50 sm:text-6xl md:text-7xl">
          Trade Social.{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            Earn Real.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mb-10 max-w-2xl text-lg text-slate-400 sm:text-xl">
          Join the fastest predictors on Solana. Trade real markets, compete with friends, and earn rewards for every{" "}
          <span className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-rose-300">
            <TrendingUp className="h-4 w-4" />
            Predict
          </span>
          ,{" "}
          <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-amber-300">
            <Users className="h-4 w-4" />
            Trade
          </span>
          , and{" "}
          <span className="inline-flex items-center gap-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-indigo-300">
            <Trophy className="h-4 w-4" />
            Win
          </span>{" "}
          you make.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          {authenticated ? (
            <button
              onClick={handleLaunchApp}
              className="group flex items-center gap-2 rounded-2xl bg-emerald-500 px-8 py-4 text-lg font-semibold text-slate-950 transition-all hover:bg-emerald-400 hover:shadow-[0_0_40px_rgba(52,211,153,0.3)]"
            >
              <span>Launch App</span>
              <svg
                className="h-5 w-5 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          ) : (
            <button
              onClick={login}
              className="group flex items-center gap-2 rounded-2xl bg-emerald-500 px-8 py-4 text-lg font-semibold text-slate-950 transition-all hover:bg-emerald-400 hover:shadow-[0_0_40px_rgba(52,211,153,0.3)]"
            >
              <span>Get Started</span>
              <svg
                className="h-5 w-5 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 border-t border-slate-800 pt-10">
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-50">50+</p>
            <p className="text-sm text-slate-500">Live Markets</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-50">$1M+</p>
            <p className="text-sm text-slate-500">Trading Volume</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-50">1K+</p>
            <p className="text-sm text-slate-500">Predictors</p>
          </div>
        </div>
      </div>
    </section>
  );
}
