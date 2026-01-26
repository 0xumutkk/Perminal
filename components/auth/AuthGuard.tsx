"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { ready, authenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) {
      router.replace("/");
    }
  }, [ready, authenticated, router]);

  // Show loading skeleton while checking auth
  if (!ready) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect happening, show minimal loading
  if (!authenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-slate-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
