"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { EditProfileModal } from "@/components/social/EditProfileModal";
import { ProfileHeader } from "@/components/social/ProfileHeader";
import { useUserProfile, useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, AlertCircle, TrendingUp, BarChart3 } from "lucide-react";
import Link from "next/link";

// Mock trading activity for demonstration
const MOCK_ACTIVITY = [
    {
        id: "1",
        type: "trade",
        market: "Will Bitcoin hit $100k in 2024?",
        side: "YES",
        amount: 50,
        date: "2 hours ago",
    },
    {
        id: "2",
        type: "trade",
        market: "Will Taylor Swift release a new album?",
        side: "NO",
        amount: 25,
        date: "5 hours ago",
    },
    {
        id: "3",
        type: "trade",
        market: "Will GTA VI launch before March 2025?",
        side: "YES",
        amount: 100,
        date: "1 day ago",
    },
];

export default function ProfilePage() {
    const params = useParams();
    // Decode the username to handle special characters or spaces
    const rawUsername = params?.username as string;
    const username = rawUsername ? decodeURIComponent(rawUsername) : "";

    const { profile, isLoading, error } = useUserProfile(username);
    const { profile: currentUserProfile } = useProfile();
    const { authenticated } = useAuth();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const isOwnProfile = currentUserProfile?.username === username;

    if (isLoading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
                <AlertCircle className="h-12 w-12 text-slate-500" />
                <h2 className="text-xl font-semibold text-slate-200">User not found</h2>
                <p className="text-sm text-slate-500">
                    The user @{username} doesn't exist or has been deleted.
                </p>
                <Link
                    href="/explore"
                    className="mt-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
                >
                    Explore Users
                </Link>
            </div>
        );
    }

    return (
        <section className="flex flex-col gap-6 pb-20">
            {/* Profile Header */}
            <Card className="overflow-hidden p-0">
                <ProfileHeader
                    profile={profile}
                    isOwnProfile={isOwnProfile}
                    onEditProfile={() => setIsEditModalOpen(true)}
                />
            </Card>

            {/* Edit Profile Modal */}
            {isOwnProfile && profile && (
                <EditProfileModal
                    profile={profile}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-800">
                <button className="relative px-4 py-3 text-sm font-medium text-slate-100 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-500">
                    Trades
                </button>
                <button className="px-4 py-3 text-sm font-medium text-slate-500 transition-colors hover:text-slate-300">
                    Predictions
                </button>
                <button className="px-4 py-3 text-sm font-medium text-slate-500 transition-colors hover:text-slate-300">
                    Likes
                </button>
            </div>

            {/* Activity Feed */}
            <div className="flex flex-col gap-3">
                {MOCK_ACTIVITY.map((activity) => (
                    <Card key={activity.id} className="flex items-center gap-4 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800">
                            {activity.side === "YES" ? (
                                <TrendingUp className="h-5 w-5 text-emerald-400" />
                            ) : (
                                <BarChart3 className="h-5 w-5 text-rose-400" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-slate-200">
                                <span className="font-medium">
                                    {activity.side === "YES" ? "Bought YES" : "Bought NO"}
                                </span>{" "}
                                on{" "}
                                <span className="font-medium text-slate-100">
                                    {activity.market}
                                </span>
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">{activity.date}</p>
                        </div>
                        <div
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${activity.side === "YES"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-rose-500/10 text-rose-400"
                                }`}
                        >
                            ${activity.amount}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Empty state for when there's no activity */}
            {MOCK_ACTIVITY.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BarChart3 className="h-12 w-12 text-slate-600" />
                    <h3 className="mt-4 text-lg font-medium text-slate-300">No activity yet</h3>
                    <p className="mt-1 text-sm text-slate-500">
                        {isOwnProfile
                            ? "Start trading to see your activity here!"
                            : "This user hasn't made any trades yet."}
                    </p>
                </div>
            )}
        </section>
    );
}
