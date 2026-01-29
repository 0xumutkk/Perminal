"use client";

import Image from "next/image";
import { useState } from "react";
import { FollowButton } from "./FollowButton";
import { useAuth } from "@/hooks/useAuth";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { Calendar, MapPin, Link as LinkIcon, Users, Wallet, Info } from "lucide-react";
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
    const { solBalance, usdcBalance, solPrice, formattedSol, formattedUsdc } = useWalletBalance();

    const solValueUsd = solBalance * solPrice;

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

                {/* Wallet Breakdown (Only for own profile) */}
                {isOwnProfile && (
                    <div className="mt-6 border-t border-slate-800/50 pt-5">
                        <div className="mb-3 flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-emerald-400" />
                            <h3 className="text-sm font-semibold text-slate-200">Wallet Details</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {/* SOL Card */}
                            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 backdrop-blur-sm transition-all hover:border-emerald-500/30 hover:bg-slate-900/60 group">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 shadow-xl ring-1 ring-white/10 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <Image
                                            src="/solana-logo-v2.png"
                                            alt="SOL"
                                            width={24}
                                            height={24}
                                            className="relative z-10 transition-transform group-hover:scale-110"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500">Solana</p>
                                        <p className="text-sm font-bold text-slate-200">{formattedSol} SOL</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium text-emerald-400 group-hover:text-emerald-300 transition-colors">
                                        ≈ ${solValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>

                            {/* USDC Card */}
                            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 backdrop-blur-sm transition-all hover:border-blue-500/30 hover:bg-slate-900/60 group">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 shadow-xl ring-1 ring-white/10 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <Image
                                            src="/usdc-logo-v2.png"
                                            alt="USDC"
                                            width={24}
                                            height={24}
                                            className="relative z-10 transition-transform group-hover:scale-110"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500">USD Coin</p>
                                        <p className="text-sm font-bold text-slate-200">{formattedUsdc} USDC</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium text-blue-400 group-hover:text-blue-300 transition-colors">
                                        ≈ ${usdcBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
