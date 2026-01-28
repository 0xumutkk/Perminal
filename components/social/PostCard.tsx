"use client";

import { FeedPost } from "@/hooks/useFeed";
import { Card } from "@/components/ui/card";
import { UserCard } from "@/components/social/UserCard";
import { MessageCircle, Repeat2, Heart, Share2, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useInteractions } from "@/hooks/useInteractions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PostCardProps {
    post: FeedPost;
}

export function PostCard({ post }: PostCardProps) {
    const { toggleLike, toggleRepost } = useInteractions();

    // Optimistic UI state
    const [liked, setLiked] = useState(post.user_has_liked);
    const [likesCount, setLikesCount] = useState(post.likes_count);
    const [reposted, setReposted] = useState(post.user_has_reposted);
    const [repostsCount, setRepostsCount] = useState(post.reposts_count);

    const handleLike = async () => {
        // Optimistic update
        const isNowLiked = !liked;
        setLiked(isNowLiked);
        setLikesCount(prev => isNowLiked ? prev + 1 : Math.max(0, prev - 1));

        await toggleLike(post.id);
    };

    const handleRepost = async () => {
        const isNowReposted = !reposted;
        setReposted(isNowReposted);
        setRepostsCount(prev => isNowReposted ? prev + 1 : Math.max(0, prev - 1));

        await toggleRepost(post.id);
    };

    const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

    return (
        <article className="border-b border-slate-800/50 hover:bg-slate-900/20 transition-colors p-4">
            {/* Repost Indicator (Future) */}
            {/* {post.is_repost && ( ... )} */}

            <div className="flex gap-3">
                {/* Avatar Column */}
                <div className="flex-shrink-0">
                    <Link href={`/profile/${post.author?.username}`}>
                        <div className="h-10 w-10 rounded-full bg-slate-800 overflow-hidden relative">
                            {post.author?.avatar_url ? (
                                <img
                                    src={post.author.avatar_url}
                                    alt={post.author.username}
                                    className="object-cover h-full w-full"
                                />
                            ) : (
                                <div className="h-full w-full bg-emerald-900/50 flex items-center justify-center text-emerald-400 font-bold">
                                    {(post.author?.username || "U").charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                    </Link>
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 truncate">
                            <Link href={`/profile/${post.author?.username}`} className="font-bold text-slate-100 hover:underline truncate">
                                {post.author?.display_name || post.author?.username}
                            </Link>
                            <span className="text-slate-500 text-sm truncate">@{post.author?.username}</span>
                            <span className="text-slate-500 text-sm">·</span>
                            <span className="text-slate-500 text-sm hover:underline cursor-pointer">{timeAgo}</span>
                        </div>
                        <button className="text-slate-500 hover:text-emerald-400 p-1 rounded-full hover:bg-emerald-500/10 transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Market Context */}
                    {post.market_slug && (
                        <div className="mb-2">
                            <Link href={`/markets/${post.market_slug}`} className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20 hover:bg-emerald-950/50 transition-colors">
                                Market: {post.market_question || "Prediction Market"}
                            </Link>
                        </div>
                    )}

                    {/* Body */}
                    <p className="text-slate-200 text-sm mb-3 whitespace-pre-wrap break-words leading-relaxed">
                        {post.content}
                    </p>

                    {/* Media (Future) */}
                    {/* {post.media_urls?.map(...) } */}

                    {/* Actions */}
                    <div className="flex items-center justify-between text-slate-500 max-w-md pt-1">
                        <button className="flex items-center gap-2 group hover:text-blue-400 transition-colors text-sm">
                            <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                                <MessageCircle className="h-4 w-4" />
                            </div>
                            <span>{post.comments_count || 0}</span>
                        </button>

                        <button
                            onClick={handleRepost}
                            className={cn(
                                "flex items-center gap-2 group transition-colors text-sm",
                                reposted ? "text-green-500" : "hover:text-green-500"
                            )}
                        >
                            <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                                <Repeat2 className="h-4 w-4" />
                            </div>
                            <span>{repostsCount || 0}</span>
                        </button>

                        <button
                            onClick={handleLike}
                            className={cn(
                                "flex items-center gap-2 group transition-colors text-sm",
                                liked ? "text-rose-500" : "hover:text-rose-500"
                            )}
                        >
                            <div className="p-2 rounded-full group-hover:bg-rose-500/10 transition-colors">
                                <Heart className={cn("h-4 w-4", liked && "fill-current")} />
                            </div>
                            <span>{likesCount || 0}</span>
                        </button>

                        <button className="flex items-center gap-2 group hover:text-blue-400 transition-colors text-sm">
                            <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                                <Share2 className="h-4 w-4" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}
