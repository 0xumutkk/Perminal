"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FollowButton } from "./FollowButton";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/database.types";

interface UserCardProps {
    user: Profile;
    showFollowButton?: boolean;
    className?: string;
}

export function UserCard({ user, showFollowButton = true, className }: UserCardProps) {
    const [imageError, setImageError] = useState(false);
    const { authenticated, activeWallet, user: authUser } = useAuth();

    // Check if this is the current user
    const currentUserId = authUser?.email?.address
        ? btoa(authUser.email.address).replace(/[^a-zA-Z0-9]/g, "").slice(0, 36)
        : activeWallet?.address;
    const isOwnProfile = currentUserId === user.id;

    return (
        <Card
            interactive
            className={cn(
                "flex items-center gap-3 p-4 transition-all hover:border-slate-700",
                className
            )}
        >
            {/* Avatar */}
            <Link href={`/profile/${user.username}`} className="flex-shrink-0">
                <div className="relative h-12 w-12 overflow-hidden rounded-full bg-slate-800">
                    {user.avatar_url && !imageError ? (
                        <Image
                            src={user.avatar_url}
                            alt={user.display_name || user.username}
                            fill
                            className="object-cover transition-transform hover:scale-105"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-600 to-emerald-800 text-lg font-bold text-white">
                            {(user.display_name || user.username).charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
            </Link>

            {/* Info */}
            <div className="flex-1 overflow-hidden">
                <Link
                    href={`/profile/${user.username}`}
                    className="group flex flex-col"
                >
                    <span className="truncate font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                        {user.display_name || user.username}
                    </span>
                    <span className="truncate text-sm text-slate-500">@{user.username}</span>
                </Link>
                {user.bio && (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">{user.bio}</p>
                )}
            </div>

            {/* Follow Button */}
            {showFollowButton && authenticated && !isOwnProfile && (
                <FollowButton targetUserId={user.id} size="sm" />
            )}
        </Card>
    );
}

// Skeleton for loading state
export function UserCardSkeleton() {
    return (
        <Card className="flex animate-pulse items-center gap-3 p-4">
            <div className="h-12 w-12 rounded-full bg-slate-800" />
            <div className="flex-1 space-y-2">
                <div className="h-4 w-24 rounded bg-slate-800" />
                <div className="h-3 w-16 rounded bg-slate-800/60" />
            </div>
            <div className="h-8 w-20 rounded-lg bg-slate-800" />
        </Card>
    );
}
