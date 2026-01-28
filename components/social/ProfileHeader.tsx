"use client";

import Image from "next/image";
import { useState } from "react";
import { FollowButton } from "./FollowButton";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, MapPin, Link as LinkIcon, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/database.types";

interface ProfileHeaderProps {
    profile: Profile;
    isOwnProfile?: boolean;
    onEditProfile?: () => void;
}

export function ProfileHeader({ profile, isOwnProfile = false, onEditProfile }: ProfileHeaderProps) {
    const [imageError, setImageError] = useState(false);
    const { authenticated } = useAuth();

    const joinDate = profile.created_at
        ? new Date(profile.created_at).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        })
        : "N/A";

    return (
        <div className="relative">
            {/* Banner */}
            <div className="h-32 w-full rounded-t-2xl bg-gradient-to-r from-emerald-900/40 via-slate-900 to-slate-900 sm:h-40" />

            {/* Profile Content */}
            <div className="px-4 pb-4 sm:px-6">
                {/* Avatar & Actions Row */}
                <div className="flex items-end justify-between">
                    {/* Avatar */}
                    <div className="relative -mt-16 h-24 w-24 overflow-hidden rounded-full border-4 border-slate-950 bg-slate-800 sm:-mt-20 sm:h-32 sm:w-32">
                        {profile.avatar_url && !imageError ? (
                            <Image
                                src={profile.avatar_url}
                                alt={profile.display_name || profile.username}
                                fill
                                className="object-cover"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-600 to-emerald-800 text-3xl font-bold text-white sm:text-4xl">
                                {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="mb-4">
                        {isOwnProfile ? (
                            <button
                                onClick={onEditProfile}
                                className="rounded-full border border-slate-700 bg-transparent px-4 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800"
                            >
                                Edit Profile
                            </button>
                        ) : authenticated ? (
                            <FollowButton targetUserId={profile.id} />
                        ) : null}
                    </div>
                </div>

                {/* Name & Handle */}
                <div className="mt-3">
                    <h1 className="text-xl font-bold text-slate-50 sm:text-2xl">
                        {profile.display_name || profile.username}
                    </h1>
                    <p className="text-sm text-slate-500">@{profile.username}</p>
                </div>

                {/* Bio */}
                {profile.bio && (
                    <p className="mt-3 text-sm leading-relaxed text-slate-300">{profile.bio}</p>
                )}

                {/* Meta Info */}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Joined {joinDate}
                    </span>
                    {profile.wallet_address && (
                        <span className="flex items-center gap-1 font-mono text-xs">
                            <LinkIcon className="h-4 w-4" />
                            {profile.wallet_address.slice(0, 4)}...{profile.wallet_address.slice(-4)}
                        </span>
                    )}
                </div>

                {/* Stats */}
                <div className="mt-4 flex items-center gap-6">
                    <button className="group flex items-center gap-1.5 transition-colors hover:text-slate-200">
                        <span className="font-semibold text-slate-100">{profile.following_count}</span>
                        <span className="text-sm text-slate-500 group-hover:text-slate-400">Following</span>
                    </button>
                    <button className="group flex items-center gap-1.5 transition-colors hover:text-slate-200">
                        <span className="font-semibold text-slate-100">{profile.followers_count}</span>
                        <span className="text-sm text-slate-500 group-hover:text-slate-400">Followers</span>
                    </button>
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-emerald-400">{profile.trades_count}</span>
                        <span className="text-sm text-slate-500">Trades</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
