"use client";

import { Topbar } from "@/components/layout/topbar";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-slate-950 to-slate-950">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-6 py-4">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
