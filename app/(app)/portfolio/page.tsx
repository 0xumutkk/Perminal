"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Wallet,
  Activity,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  LayoutGrid,
  List
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

// --- Mock Data ---

const STATS = {
  totalValue: 1250.00,
  pnl: 120.50,
  pnlPercent: 12.0,
  winRate: 65,
  activePositions: 3,
};

const MOCK_POSITIONS = [
  {
    id: "pos-1",
    marketTitle: "Will Bitcoin hit $100k in 2024?",
    side: "YES",
    entryPrice: 0.45,
    currentPrice: 0.52,
    amountInvested: 150,
    pnl: 23.33,
    image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "pos-2",
    marketTitle: "Will Taylor Swift release a new album in Q2?",
    side: "NO",
    entryPrice: 0.30,
    currentPrice: 0.25,
    amountInvested: 50,
    pnl: -8.33,
    image: "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "pos-3",
    marketTitle: "Will GTA VI launch before March 2025?",
    side: "YES",
    entryPrice: 0.70,
    currentPrice: 0.72,
    amountInvested: 300,
    pnl: 8.57, // (0.72 - 0.70) / 0.70 * 300
    image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=200&q=80",
  },
];

const MOCK_HISTORY = [
  {
    id: "trade-1",
    marketTitle: "Will Kanye West run for president in 2024?",
    side: "NO",
    entry: 0.15,
    amount: 50,
    date: "Oct 24, 2024",
    status: "WON",
    pnl: 42.50,
  },
  {
    id: "trade-2",
    marketTitle: "Will Solana flip Ethereum by 2025?",
    side: "YES",
    entry: 0.10,
    amount: 100,
    date: "Oct 20, 2024",
    status: "LOST",
    pnl: -100.00,
  },
  {
    id: "trade-3",
    marketTitle: "Will SpaceX reach Mars by 2030?",
    side: "YES",
    entry: 0.60,
    amount: 200,
    date: "Sep 15, 2024",
    status: "OPEN",
    pnl: 0,
  },
  {
    id: "trade-4",
    marketTitle: "Will TikTok be banned in the US in 2024?",
    side: "NO",
    entry: 0.55,
    amount: 75,
    date: "Sep 10, 2024",
    status: "WON",
    pnl: 61.36,
  },
];

// --- Components ---

function StatCard({
  title,
  value,
  subValue,
  icon: Icon,
  trend
}: {
  title: string;
  value: string;
  subValue?: string;
  icon: any;
  trend?: "up" | "down" | "neutral"
}) {
  return (
    <Card className="flex flex-col gap-1 p-5 transition-shadow hover:shadow-lg dark:hover:shadow-slate-900/50">
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-xs font-medium uppercase tracking-wider">{title}</span>
        <Icon className="h-4 w-4 opacity-70" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-50">{value}</span>
      </div>
      {subValue && (
        <div className="flex items-center gap-1 text-xs">
          <span className={cn(
            "font-medium",
            trend === "up" ? "text-emerald-400" :
              trend === "down" ? "text-rose-400" : "text-slate-400"
          )}>
            {subValue}
          </span>
        </div>
      )}
    </Card>
  );
}

function PortfolioTabs({
  activeTab,
  onTabChange
}: {
  activeTab: "positions" | "history";
  onTabChange: (tab: "positions" | "history") => void
}) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-slate-800/60 bg-slate-950/40 p-1">
      <button
        onClick={() => onTabChange("positions")}
        className={cn(
          "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
          activeTab === "positions"
            ? "bg-slate-800 text-slate-50 shadow-sm"
            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        Active Positions
      </button>
      <button
        onClick={() => onTabChange("history")}
        className={cn(
          "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
          activeTab === "history"
            ? "bg-slate-800 text-slate-50 shadow-sm"
            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
        )}
      >
        <Clock className="h-4 w-4" />
        Trade History
      </button>
    </div>
  );
}

function PositionCard({ position }: { position: typeof MOCK_POSITIONS[0] }) {
  const pnlIsPositive = position.pnl >= 0;
  const pnlPercent = (position.pnl / position.amountInvested) * 100;

  return (
    <Card interactive className="flex flex-col gap-4 overflow-hidden group">
      <div className="flex items-start gap-4">
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-slate-700/50">
          <Image
            src={position.image}
            alt={position.marketTitle}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col justify-between">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-slate-100">
            {position.marketTitle}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <Badge
              variant={position.side === "YES" ? "success" : "default"} // Using default for NO for now or could add custom variant
              className={cn(
                "px-1.5 py-0 text-[10px]",
                position.side === "NO" && "border-rose-500/30 bg-rose-500/10 text-rose-400"
              )}
            >
              SIDE: {position.side}
            </Badge>
            <span className="text-[10px] text-slate-500">
              Entry: ${position.entryPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-900/40 p-3">
        <div>
          <p className="text-[10px] uppercase text-slate-500">Invested</p>
          <p className="font-mono text-sm text-slate-200">${position.amountInvested.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase text-slate-500">Unrealized PnL</p>
          <div className={cn("flex items-center justify-end font-mono text-sm", pnlIsPositive ? "text-emerald-400" : "text-rose-400")}>
            {pnlIsPositive ? "+" : ""}{position.pnl.toFixed(2)}
            <span className="ml-1 text-[10px] opacity-80">({pnlIsPositive ? "+" : ""}{pnlPercent.toFixed(1)}%)</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-slate-500">
          Current Price: <span className="text-slate-300">${position.currentPrice.toFixed(2)}</span>
        </div>
        <Button variant="outline" size="sm" className="h-7 text-xs">
          Manage
        </Button>
      </div>
    </Card>
  );
}

function HistoryTable({ data }: { data: typeof MOCK_HISTORY }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800/60 bg-slate-950/20">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Market</th>
              <th className="px-4 py-3 font-medium text-center">Side</th>
              <th className="px-4 py-3 font-medium text-right">Entry</th>
              <th className="px-4 py-3 font-medium text-right">Amount</th>
              <th className="px-4 py-3 font-medium text-right">PnL</th>
              <th className="px-4 py-3 font-medium text-right">Status</th>
              <th className="px-4 py-3 font-medium text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {data.map((trade) => {
              const isWin = trade.status === "WON";
              const isLost = trade.status === "LOST";
              const isOpen = trade.status === "OPEN";

              return (
                <tr key={trade.id} className="group hover:bg-slate-900/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="line-clamp-1 max-w-[200px] font-medium text-slate-300 group-hover:text-slate-100">
                      {trade.marketTitle}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="outline" className={cn(
                      "text-[10px] px-1.5 py-0.5",
                      trade.side === "YES"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-rose-500/30 bg-rose-500/10 text-rose-400"
                    )}>
                      {trade.side}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-400 font-mono">
                    ${trade.entry.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300 font-mono">
                    ${trade.amount.toFixed(0)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    <span className={cn(
                      trade.pnl > 0 ? "text-emerald-400" : trade.pnl < 0 ? "text-rose-400" : "text-slate-500"
                    )}>
                      {trade.pnl > 0 ? "+" : ""}{trade.pnl !== 0 ? `$${trade.pnl.toFixed(2)}` : "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                      isWin ? "text-emerald-400 bg-emerald-500/10" :
                        isLost ? "text-rose-400 bg-rose-500/10" :
                          "text-amber-400 bg-amber-500/10"
                    )}>
                      {isOpen && <Activity className="h-3 w-3" />}
                      {trade.status}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500 text-xs">
                    {trade.date}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SimplePnLChart() {
  // Simple CSS-only bar visualization for last 7 days
  const data = [40, 65, 55, 80, 72, 90, 100]; // Percentages of max height

  return (
    <div className="flex h-12 items-end justify-between gap-1">
      {data.map((h, i) => (
        <div
          key={i}
          className="w-1.5 rounded-t-sm bg-emerald-500/20 hover:bg-emerald-500/40 transition-colors"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState<"positions" | "history">("positions");

  return (
    <section className="flex flex-col gap-6 pb-20">

      {/* Header & Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-50">
          Portfolio
        </h1>
        <p className="text-sm text-slate-400">
          Track your performance and manage your positions.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Value"
          value={`$${STATS.totalValue.toFixed(2)}`}
          subValue="Includes cash & positions"
          icon={Wallet}
        />
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 p-5 shadow-[0_0_0_1px_rgba(15,23,42,0.6)]">
          <div className="flex flex-col gap-1 relative z-10">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium uppercase tracking-wider">Total PnL</span>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400">
                +${STATS.pnl.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-medium text-emerald-500 flex items-center gap-0.5">
                <ArrowUpRight className="h-3 w-3" />
                {STATS.pnlPercent}%
              </span>
              {/* Mini Chart */}
              <SimplePnLChart />
            </div>
          </div>
        </div>
        <StatCard
          title="Win Rate"
          value={`${STATS.winRate}%`}
          subValue="Based on 45 settled trades"
          icon={Activity}
          trend="up"
        />
        <StatCard
          title="Active Positions"
          value={STATS.activePositions.toString()}
          subValue="2 markets closing soon"
          icon={List}
          trend="neutral"
        />
      </div>

      {/* Content Area */}
      <div className="flex flex-col gap-4">

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <PortfolioTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search markets..."
              className="h-9 w-full min-w-[200px] rounded-lg border border-slate-800 bg-slate-950/50 pl-9 text-xs text-slate-200 focus:border-slate-700 focus:outline-none"
            />
          </div>
        </div>

        {/* Views */}
        {activeTab === "positions" ? (
          <>
            {MOCK_POSITIONS.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {MOCK_POSITIONS.map((pos) => (
                  <PositionCard key={pos.id} position={pos} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800/80 bg-slate-950/40 p-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900/80">
                  <LayoutGrid className="h-6 w-6 text-slate-500" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-200">No active positions</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-[250px]">
                  You don't have any open trades right now. Explore markets to start trading.
                </p>
                <Button variant="outline" className="mt-4" size="sm" asChild>
                  <Link href="/markets">Explore Markets</Link>
                </Button>
              </div>
            )}
          </>
        ) : (
          <HistoryTable data={MOCK_HISTORY} />
        )}
      </div>
    </section>
  );
}
