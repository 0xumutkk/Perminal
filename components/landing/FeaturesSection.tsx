"use client";

import { CandlestickChart, Users, Trophy, Wallet } from "lucide-react";

const features = [
  {
    icon: CandlestickChart,
    title: "Real Markets",
    description:
      "Trade on real prediction markets powered by Kalshi. Politics, sports, crypto, and more.",
    color: "emerald"
  },
  {
    icon: Users,
    title: "Social Trading",
    description:
      "Follow top predictors, share your calls, and compete with friends in real-time.",
    color: "cyan"
  },
  {
    icon: Trophy,
    title: "Leaderboard",
    description:
      "Climb the ranks and prove your edge. Top predictors earn rewards and recognition.",
    color: "amber"
  },
  {
    icon: Wallet,
    title: "Easy Wallet",
    description:
      "Sign in with email or social. Your embedded wallet is created automatically.",
    color: "indigo"
  }
];

const colorClasses = {
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    icon: "text-emerald-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(52,211,153,0.15)]"
  },
  cyan: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    icon: "text-cyan-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]"
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    icon: "text-amber-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(251,191,36,0.15)]"
  },
  indigo: {
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/30",
    icon: "text-indigo-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(129,140,248,0.15)]"
  }
};

export function FeaturesSection() {
  return (
    <section className="relative py-24 px-6">
      {/* Section Header */}
      <div className="mx-auto mb-16 max-w-3xl text-center">
        <h2 className="mb-4 text-3xl font-bold text-slate-50 sm:text-4xl">
          Everything you need to{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            predict and earn
          </span>
        </h2>
        <p className="text-lg text-slate-400">
          The most powerful social prediction market platform on Solana.
        </p>
      </div>

      {/* Features Grid */}
      <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const colors = colorClasses[feature.color as keyof typeof colorClasses];
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className={`group rounded-2xl border ${colors.border} ${colors.bg} p-6 transition-all ${colors.glow}`}
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg} ${colors.icon}`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-50">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-400">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
