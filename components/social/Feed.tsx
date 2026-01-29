"use client";

import { useEffect, useRef, useCallback } from "react";
import { useFeed } from "@/hooks/useFeed";
import { PostCard } from "@/components/social/PostCard";
import { Loader2, MessageSquare } from "lucide-react";
import { useInView } from "react-intersection-observer";

interface FeedProps {
    userId?: string;
    marketId?: string;
}

export function Feed({ userId, marketId }: FeedProps) {
    const { posts, isLoading, error, fetchFeed } = useFeed(userId, marketId);
    const hasFetched = useRef(false);

    // TODO: Add pagination support to useFeed and here
    // For now, we just fetch once on mount

    useEffect(() => {
        if (!hasFetched.current) {
            fetchFeed();
            hasFetched.current = true;
        }
    }, [fetchFeed, userId, marketId]);

    if (isLoading && posts.length === 0) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-rose-400">
                <p>Failed to load feed</p>
                <button
                    onClick={() => fetchFeed()}
                    className="mt-2 text-sm underline hover:text-rose-300"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500">
                <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">
                    {marketId ? "No posts about this market yet" : "No posts yet"}
                </p>
                <p className="text-sm">
                    {marketId ? "Be the first to share your thoughts!" : "Be the first to share something!"}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-0 divide-y divide-slate-800/50">
            {posts.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}

            <div className="p-8 text-center text-sm text-slate-600">
                You've reached the end of the feed
            </div>
        </div>
    );
}
