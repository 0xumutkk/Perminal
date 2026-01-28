"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { Profile, ProfileInsert, ProfileUpdate } from "@/lib/database.types";

interface UseProfileReturn {
    profile: Profile | null;
    isLoading: boolean;
    error: string | null;
    fetchProfile: (usernameOrId: string) => Promise<Profile | null>;
    updateProfile: (updates: ProfileUpdate) => Promise<boolean>;
    createProfile: (data: Omit<ProfileInsert, "id">) => Promise<Profile | null>;
}

export function useProfile(): UseProfileReturn {
    const { authenticated, activeWallet, user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Generate a unique user ID from Privy user or wallet
    const getUserId = useCallback(() => {
        if (user?.email?.address) {
            // Use email hash as ID
            return btoa(user.email.address).replace(/[^a-zA-Z0-9]/g, "").slice(0, 36);
        }
        if (activeWallet?.address) {
            // Use wallet address
            return activeWallet.address;
        }
        return null;
    }, [user, activeWallet]);

    // Fetch profile by username or ID
    const fetchProfile = useCallback(async (usernameOrId: string): Promise<Profile | null> => {
        setIsLoading(true);
        setError(null);

        try {
            // Try by username first
            let { data, error: fetchError } = await supabase
                .from("profiles")
                .select("*")
                .eq("username", usernameOrId)
                .single();

            // If not found, try by ID
            if (!data && !fetchError) {
                const result = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", usernameOrId)
                    .single();
                data = result.data;
                fetchError = result.error;
            }

            if (fetchError && fetchError.code !== "PGRST116") {
                throw fetchError;
            }

            setProfile(data);
            return data;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to fetch profile";
            setError(message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Create new profile
    const createProfile = useCallback(
        async (data: Omit<ProfileInsert, "id">): Promise<Profile | null> => {
            const userId = getUserId();
            if (!userId) {
                setError("Not authenticated");
                return null;
            }

            setIsLoading(true);
            setError(null);

            try {
                const { data: newProfile, error: createError } = await supabase
                    .from("profiles")
                    .insert({
                        id: userId,
                        wallet_address: activeWallet?.address || null,
                        ...data,
                    })
                    .select()
                    .single();

                if (createError) throw createError;

                setProfile(newProfile);
                return newProfile;
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to create profile";
                setError(message);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [getUserId, activeWallet]
    );

    // Update profile
    const updateProfile = useCallback(
        async (updates: ProfileUpdate): Promise<boolean> => {
            const userId = getUserId();
            if (!userId) {
                setError("Not authenticated");
                return false;
            }

            setIsLoading(true);
            setError(null);

            try {
                const { data: updatedProfile, error: updateError } = await supabase
                    .from("profiles")
                    .update({ ...updates, updated_at: new Date().toISOString() })
                    .eq("id", userId)
                    .select()
                    .single();

                if (updateError) throw updateError;

                setProfile(updatedProfile);
                return true;
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to update profile";
                setError(message);
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [getUserId]
    );

    // Auto-fetch or create current user's profile when authenticated
    useEffect(() => {
        if (authenticated) {
            const userId = getUserId();
            if (userId) {
                // Try to fetch existing profile, create if not found
                const initProfile = async () => {
                    setIsLoading(true);
                    try {
                        // First try to fetch by ID
                        const { data: existingProfile, error: fetchError } = await supabase
                            .from("profiles")
                            .select("*")
                            .eq("id", userId)
                            .single();

                        if (existingProfile) {
                            setProfile(existingProfile as Profile);
                            return;
                        }

                        // Profile doesn't exist, create one
                        if (fetchError?.code === "PGRST116" || !existingProfile) {
                            // Generate a unique username
                            const baseUsername = activeWallet?.address
                                ? `user_${activeWallet.address.slice(0, 8).toLowerCase()}`
                                : `user_${userId.slice(0, 8).toLowerCase()}`;

                            const { data: newProfile, error: createError } = await supabase
                                .from("profiles")
                                .insert({
                                    id: userId,
                                    username: baseUsername,
                                    display_name: null,
                                    wallet_address: activeWallet?.address || null,
                                    bio: null,
                                    avatar_url: null,
                                })
                                .select()
                                .single();

                            if (createError) {
                                // Username might be taken, try with random suffix
                                if (createError.code === "23505") {
                                    const randomSuffix = Math.random().toString(36).slice(2, 6);
                                    const { data: retryProfile } = await supabase
                                        .from("profiles")
                                        .insert({
                                            id: userId,
                                            username: `${baseUsername}_${randomSuffix}`,
                                            wallet_address: activeWallet?.address || null,
                                        })
                                        .select()
                                        .single();

                                    if (retryProfile) {
                                        setProfile(retryProfile as Profile);
                                    }
                                } else {
                                    console.error("[useProfile] Create error:", createError);
                                }
                            } else if (newProfile) {
                                setProfile(newProfile as Profile);
                                console.log("[useProfile] Created new profile:", newProfile);
                            }
                        }
                    } catch (err) {
                        console.error("[useProfile] Init error:", err);
                    } finally {
                        setIsLoading(false);
                    }
                };

                initProfile();
            }
        } else {
            setProfile(null);
        }
    }, [authenticated, getUserId, activeWallet]);

    return {
        profile,
        isLoading,
        error,
        fetchProfile,
        updateProfile,
        createProfile,
    };
}

// Hook to fetch any user's profile (for viewing other profiles)
export function useUserProfile(username: string | null) {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!username) {
            setProfile(null);
            return;
        }

        const fetchUserProfile = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const { data, error: fetchError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("username", username)
                    .single();

                if (fetchError && fetchError.code !== "PGRST116") {
                    throw fetchError;
                }

                setProfile(data);
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to fetch profile";
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, [username]);

    return { profile, isLoading, error };
}
