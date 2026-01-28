"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, TrendingUp, Medal, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface LeaderboardProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  pnl: number;
  win_rate: number;
  trades_count: number;
  followers_count: number;
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<"all" | "month" | "week">("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!isSupabaseConfigured) {
        setError("Supabase not configured");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch profiles sorted by PnL
        // Note: In a real app, we might want a separate 'leaderboard' view or table
        // that aggregates stats periodically for performance
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url, pnl, win_rate, trades_count, followers_count")
          .order("pnl", { ascending: false })
          .limit(50);

        if (error) throw error;

        setData(profiles as LeaderboardProfile[]);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
        setError("Failed to load leaderboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [period]);

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case 1:
        return "text-slate-300 bg-slate-300/10 border-slate-300/20";
      case 2:
        return "text-amber-600 bg-amber-600/10 border-amber-600/20";
      default:
        return "text-slate-500 bg-slate-800/50 border-transparent";
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-4 w-4" />;
      case 1:
        return <Medal className="h-4 w-4" />;
      case 2:
        return <Medal className="h-4 w-4" />;
      default:
        return <span className="font-mono text-sm">{index + 1}</span>;
    }
  };

  return (
    <section className="flex flex-col gap-6 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">
            Leaderboard
          </h1>
          <p className="text-sm text-slate-400">
            Top performers ranked by realized PnL.
          </p>
        </div>

        {/* Period Filter */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/50 p-1">
          {(["week", "month", "all"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                period === p
                  ? "bg-slate-800 text-slate-50"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <Card className="overflow-hidden border-slate-800/60 bg-slate-950/40">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <TrendingUp className="h-8 w-8 animate-pulse text-slate-700" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-10 w-10 text-amber-500/70" />
            <h3 className="mt-4 text-lg font-medium text-slate-300">{error}</h3>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
              Run the seed script in Supabase to populate data.
            </p>
          </div>
        ) : data.length > 0 ? (
          <Table>
            <TableHeader className="bg-slate-900/50">
              <TableRow className="hover:bg-transparent border-slate-800">
                <TableHead className="w-[80px] text-center">Rank</TableHead>
                <TableHead>Trader</TableHead>
                <TableHead className="text-right">Win Rate</TableHead>
                <TableHead className="text-right">Trades</TableHead>
                <TableHead className="text-right">Total PnL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((profile, index) => (
                <TableRow
                  key={profile.id}
                  className="border-slate-800/50 hover:bg-slate-900/40 transition-colors"
                >
                  <TableCell className="text-center font-medium">
                    <div className={cn(
                      "mx-auto flex h-8 w-8 items-center justify-center rounded-lg border",
                      getRankStyle(index)
                    )}>
                      {getRankIcon(index)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/profile/${profile.username}`}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <div className="relative h-9 w-9 overflow-hidden rounded-full bg-slate-800">
                        {profile.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={profile.avatar_url}
                            alt={profile.username}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-600 to-emerald-900 text-xs font-bold text-white">
                            {(profile.display_name || profile.username).substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-100">
                          {profile.display_name || profile.username}
                        </span>
                        <span className="text-xs text-slate-500">
                          @{profile.username}
                        </span>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-slate-300">
                    {profile.win_rate}%
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-slate-400">
                    {profile.trades_count}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "font-mono font-medium",
                      profile.pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                    )}>
                      {profile.pnl >= 0 ? "+" : ""}${profile.pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-12 text-center text-slate-500">
            No data available yet.
          </div>
        )}
      </Card>
    </section>
  );
}
