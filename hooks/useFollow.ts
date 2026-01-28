"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

interface UseFollowReturn {
    isFollowing: boolean;
    isLoading: boolean;
    followersCount: number;
    followingCount: number;
    follow: () => Promise<boolean>;
    unfollow: () => Promise<boolean>;
    checkFollowStatus: () => Promise<void>;
}

export function useFollow(targetUserId: string | null): UseFollowReturn {
    const { authenticated, activeWallet, user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    // Get current user ID
    const getCurrentUserId = useCallback(() => {
        if (user?.email?.address) {
            return btoa(user.email.address).replace(/[^a-zA-Z0-9]/g, "").slice(0, 36);
        }
        if (activeWallet?.address) {
            return activeWallet.address;
        }
        return null;
    }, [user, activeWallet]);

    // Check if current user follows target user
    const checkFollowStatus = useCallback(async () => {
        const currentUserId = getCurrentUserId();
        if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
            setIsFollowing(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from("follows")
                .select("id")
                .eq("follower_id", currentUserId)
                .eq("following_id", targetUserId)
                .eq("following_id", targetUserId)
                .maybeSingle();

            if (error && error.code !== "PGRST116") {
                console.error("Follow check error:", error);
            }

            setIsFollowing(!!data);
        } catch (err) {
            console.error("Failed to check follow status:", err);
        }
    }, [getCurrentUserId, targetUserId]);

    // Fetch follower/following counts for target user
    const fetchCounts = useCallback(async () => {
        if (!targetUserId) return;

        try {
            // Fetch from profiles table (cached counts)
            const { data: profile } = await supabase
                .from("profiles")
                .select("followers_count, following_count")
                .eq("id", targetUserId)
                .eq("id", targetUserId)
                .maybeSingle();

            if (profile) {
                const profileData = profile as { followers_count: number; following_count: number };
                setFollowersCount(profileData.followers_count || 0);
                setFollowingCount(profileData.following_count || 0);
            }
        } catch (err) {
            console.error("Failed to fetch counts:", err);
        }
    }, [targetUserId]);

    // Follow user
    const follow = useCallback(async (): Promise<boolean> => {
        const currentUserId = getCurrentUserId();
        if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
            return false;
        }

        setIsLoading(true);

        try {
            // Insert follow relationship
            const { error: followError } = await supabase.from("follows").insert({
                follower_id: currentUserId,
                following_id: targetUserId,
            });

            if (followError) {
                // Already following (unique constraint)
                if (followError.code === "23505") {
                    setIsFollowing(true);
                    return true;
                }
                throw followError;
            }

            // Update counts in profiles (trigger would be better but this works)
            await supabase.rpc("increment_followers", { user_id: targetUserId });
            await supabase.rpc("increment_following", { user_id: currentUserId });

            setIsFollowing(true);
            setFollowersCount((prev) => prev + 1);
            return true;
        } catch (err) {
            console.error("Follow error:", err);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [getCurrentUserId, targetUserId]);

    // Unfollow user
    const unfollow = useCallback(async (): Promise<boolean> => {
        const currentUserId = getCurrentUserId();
        if (!currentUserId || !targetUserId) {
            return false;
        }

        setIsLoading(true);

        try {
            const { error: unfollowError } = await supabase
                .from("follows")
                .delete()
                .eq("follower_id", currentUserId)
                .eq("following_id", targetUserId);

            if (unfollowError) throw unfollowError;

            // Update counts
            await supabase.rpc("decrement_followers", { user_id: targetUserId });
            await supabase.rpc("decrement_following", { user_id: currentUserId });

            setIsFollowing(false);
            setFollowersCount((prev) => Math.max(0, prev - 1));
            return true;
        } catch (err) {
            console.error("Unfollow error:", err);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [getCurrentUserId, targetUserId]);

    // Check follow status and counts on mount
    useEffect(() => {
        if (targetUserId) {
            checkFollowStatus();
            fetchCounts();
        }
    }, [targetUserId, checkFollowStatus, fetchCounts]);

    // Re-check when auth changes
    useEffect(() => {
        if (authenticated && targetUserId) {
            checkFollowStatus();
        }
    }, [authenticated, targetUserId, checkFollowStatus]);

    return {
        isFollowing,
        isLoading,
        followersCount,
        followingCount,
        follow,
        unfollow,
        checkFollowStatus,
    };
}

// Hook to get list of followers/following
export function useFollowList(userId: string | null, type: "followers" | "following") {
    const [users, setUsers] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!userId) {
            setUsers([]);
            return;
        }

        const fetchList = async () => {
            setIsLoading(true);

            try {
                if (type === "followers") {
                    const { data } = await supabase
                        .from("follows")
                        .select("follower_id")
                        .eq("following_id", userId);

                    setUsers(data?.map((f) => f.follower_id) || []);
                } else {
                    const { data } = await supabase
                        .from("follows")
                        .select("following_id")
                        .eq("follower_id", userId);

                    setUsers(data?.map((f) => f.following_id) || []);
                }
            } catch (err) {
                console.error("Failed to fetch follow list:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchList();
    }, [userId, type]);

    return { users, isLoading };
}
