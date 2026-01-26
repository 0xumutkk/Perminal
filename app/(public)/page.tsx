"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { AppPreview } from "@/components/landing/AppPreview";
import { Footer } from "@/components/landing/Footer";
import { useAuth } from "@/hooks/useAuth";

export default function LandingPage() {
  const { ready, authenticated } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if user is authenticated
  useEffect(() => {
    if (ready && authenticated) {
      router.replace("/markets");
    }
  }, [ready, authenticated, router]);

  // Show loading state while checking auth or redirecting
  if (ready && authenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-slate-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      <LandingHeader />
      <HeroSection />
      <FeaturesSection />
      <AppPreview />
      <Footer />
    </div>
  );
}
