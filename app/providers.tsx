"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState, useEffect, Suspense, lazy } from "react";
import { isPrivyConfigured, FallbackAuthProvider } from "@/hooks/useAuth";

interface ProvidersProps {
  children: ReactNode;
}

// Lazy load Privy components only when needed
const PrivyWrapper = lazy(() => import("@/components/auth/PrivyWrapper"));

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  const [mounted, setMounted] = useState(false);
  const privyValid = isPrivyConfigured();

  useEffect(() => {
    setMounted(true);
    if (!privyValid) {
      console.warn(
        "NEXT_PUBLIC_PRIVY_APP_ID not set or invalid. Privy authentication disabled. " +
          "Get your App ID from https://dashboard.privy.io"
      );
    }
  }, [privyValid]);

  // Filter Privy analytics CORS errors in development
  useEffect(() => {
    // Only filter in development mode
    if (process.env.NODE_ENV !== 'development') return;

    // Store original console.error
    const originalError = console.error;
    const originalWarn = console.warn;

    // Override console.error to filter Privy analytics CORS errors
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      const errorString = JSON.stringify(args);
      
      // Check if this is a Privy-related benign error
      const isPrivyBenignError = 
        message.includes('analytics_events') ||
        message.includes('auth.privy.io/api/v1/analytics_events') ||
        (message.includes('Access-Control-Allow-Origin') && 
         (message.includes('privy.io') || errorString.includes('privy.io'))) ||
        (message.includes('422') && errorString.includes('privy.io')) ||
        (message.includes('Failed to load resource') && errorString.includes('analytics_events')) ||
        (message.includes('Permission policy') && message.includes('Fullscreen') && errorString.includes('auth.privy.io'));

      // Only log if it's NOT a Privy-related benign error
      if (!isPrivyBenignError) {
        originalError.apply(console, args);
      }
    };

    // Also filter console warnings for Privy analytics
    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      const warnString = JSON.stringify(args);
      
      const isPrivyAnalyticsWarning = 
        message.includes('analytics_events') ||
        (message.includes('CORS') && warnString.includes('privy.io'));

      if (!isPrivyAnalyticsWarning) {
        originalWarn.apply(console, args);
      }
    };

    // Cleanup: restore original methods on unmount
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // Wrap children with query client
  const withQueryClient = (content: ReactNode) => (
    <QueryClientProvider client={queryClient}>{content}</QueryClientProvider>
  );

  // During SSR or when Privy is not valid, render without Privy
  if (!mounted || !privyValid) {
    return withQueryClient(
      <FallbackAuthProvider>{children}</FallbackAuthProvider>
    );
  }

  // When Privy is configured, lazy load the Privy wrapper
  return withQueryClient(
    <Suspense fallback={<FallbackAuthProvider>{children}</FallbackAuthProvider>}>
      <PrivyWrapper>{children}</PrivyWrapper>
    </Suspense>
  );
}
