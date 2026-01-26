"use client";

export default function PortfolioPage() {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-slate-50">
          Portfolio
        </h1>
        <p className="text-xs text-slate-500">
          Track your open positions and PnL across all social prediction markets.
        </p>
      </div>
      <div className="mt-4 rounded-2xl border border-dashed border-slate-800/80 bg-slate-950/60 p-6 text-sm text-slate-500">
        Portfolio views will appear here once you start trading markets.
      </div>
    </section>
  );
}
