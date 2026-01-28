import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("placeholder") &&
    !supabaseUrl.includes("YOUR_")
);

if (!isSupabaseConfigured) {
    console.warn(
        "[Supabase] Not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
}

// Create client (will use placeholder values if not configured)
export const supabase: SupabaseClient = createClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseAnonKey || "placeholder-key"
);

// Re-export types for convenience
export type { Profile, ProfileInsert, ProfileUpdate, Follow, FollowInsert } from "@/lib/database.types";
