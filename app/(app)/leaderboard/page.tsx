"use client";

export default function LeaderboardPage() {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-slate-50">
          Leaderboard
        </h1>
        <p className="text-xs text-slate-500">
          See the top performers across markets, ranked by realized edge and PnL.
        </p>
      </div>
      <div className="mt-4 rounded-2xl border border-dashed border-slate-800/80 bg-slate-950/60 p-6 text-sm text-slate-500">
        Leaderboard data will appear here once we plug into on-chain results.
      </div>
    </section>
  );
}
