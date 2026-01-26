"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function AppPreview() {
  const { login, authenticated } = useAuth();
  const router = useRouter();

  const handleLaunchApp = () => {
    router.push("/markets");
  };

  return (
    <section className="relative py-24 px-6">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-emerald-500/5 to-transparent" />

      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-50 sm:text-4xl">
            See it in action
          </h2>
          <p className="text-lg text-slate-400">
            A beautiful, intuitive interface designed for serious predictors.
          </p>
        </div>

        {/* App Mockup */}
        <div className="relative">
          {/* Browser Frame */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-slate-950/50">
            {/* Browser Bar */}
            <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/50 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="ml-4 flex-1 rounded-lg bg-slate-800/50 px-4 py-1.5 text-xs text-slate-500">
                app.perminal.io/markets
              </div>
            </div>

            {/* App Preview Content */}
            <div className="flex">
              {/* Sidebar Preview */}
              <div className="hidden w-56 border-r border-slate-800 bg-slate-950 p-4 sm:block">
                <div className="mb-6 h-8 w-32 rounded bg-slate-800/50" />
                <div className="space-y-2">
                  <div className="flex items-center gap-3 rounded-xl bg-slate-800/50 px-3 py-2">
                    <div className="h-5 w-5 rounded bg-emerald-500/30" />
                    <div className="h-4 w-16 rounded bg-slate-700" />
                  </div>
                  <div className="flex items-center gap-3 rounded-xl px-3 py-2">
                    <div className="h-5 w-5 rounded bg-slate-700/50" />
                    <div className="h-4 w-14 rounded bg-slate-800" />
                  </div>
                  <div className="flex items-center gap-3 rounded-xl px-3 py-2">
                    <div className="h-5 w-5 rounded bg-slate-700/50" />
                    <div className="h-4 w-20 rounded bg-slate-800" />
                  </div>
                </div>
              </div>

              {/* Main Content Preview */}
              <div className="flex-1 p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="mb-2 h-6 w-40 rounded bg-slate-700" />
                    <div className="h-4 w-56 rounded bg-slate-800" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <div className="h-4 w-24 rounded bg-slate-800" />
                  </div>
                </div>

                {/* Market Cards Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4"
                    >
                      <div className="mb-3 flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-700/50" />
                        <div className="flex-1">
                          <div className="mb-2 h-4 w-full rounded bg-slate-700" />
                          <div className="h-3 w-3/4 rounded bg-slate-800" />
                        </div>
                      </div>
                      <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                          style={{ width: `${30 + i * 10}%` }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-2 text-center text-xs text-emerald-400">
                          YES
                        </div>
                        <div className="flex-1 rounded-lg border border-rose-500/30 bg-rose-500/10 py-2 text-center text-xs text-rose-400">
                          NO
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating CTA */}
          <div className="mt-8 flex justify-center">
            {authenticated ? (
              <button
                onClick={handleLaunchApp}
                className="group flex items-center gap-2 rounded-2xl bg-emerald-500 px-8 py-4 text-lg font-semibold text-slate-950 transition-all hover:bg-emerald-400 hover:shadow-[0_0_40px_rgba(52,211,153,0.3)]"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
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
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
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
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
