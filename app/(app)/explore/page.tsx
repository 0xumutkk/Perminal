"use client";

import { useAuth } from "@/hooks/useAuth";
import { Loader2, TrendingUp, Compass, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { PlatformStats } from "@/components/social/PlatformStats"; // Stats component
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { UserCard } from "@/components/social/UserCard";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/database.types";
import { Feed } from "@/components/social/Feed";
import { CreatePost } from "@/components/social/CreatePost";
import { useFeed } from "@/hooks/useFeed";

export default function ExplorePage() {
    const { authenticated } = useAuth();
    const [activeTab, setActiveTab] = useState<"for-you" | "following" | "people">("for-you");
    const [users, setUsers] = useState<Profile[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const { fetchFeed } = useFeed(); // Used to refetch feed after posting

    // Fetch users for "People" tab
    useEffect(() => {
        if (activeTab === "people") {
            const fetchUsers = async () => {
                setIsLoadingUsers(true);
                try {
                    const { data } = await supabase
                        .from("profiles")
                        .select("*")
                        .order("followers_count", { ascending: false })
                        .limit(20);

                    if (data) setUsers(data);
                } catch (err) {
                    console.error("Error fetching users:", err);
                } finally {
                    setIsLoadingUsers(false);
                }
            };
            fetchUsers();
        }
    }, [activeTab]);

    return (
        <main className="min-h-screen bg-[#020617] pb-20">
            {/* Header / Stats */}
            <div className="border-b border-slate-900/80 bg-slate-950/50 backdrop-blur-xl">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="mb-2 text-3xl font-bold text-slate-100">Explore</h1>
                    <p className="text-slate-400">Discover top traders and market discussions</p>

                    <div className="mt-8">
                        <PlatformStats />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid gap-8 lg:grid-cols-4">
                    {/* Left Sidebar / Navigation (Desktop) */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-24 space-y-2">
                            <Button
                                variant={activeTab === "for-you" ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => setActiveTab("for-you")}
                            >
                                <Compass className="mr-2 h-4 w-4" />
                                For You
                            </Button>
                            <Button
                                variant={activeTab === "following" ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => setActiveTab("following")}
                                disabled={!authenticated} // Disable if not logged in
                            >
                                <Users className="mr-2 h-4 w-4" />
                                Following
                            </Button>
                            <Button
                                variant={activeTab === "people" ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => setActiveTab("people")}
                            >
                                <TrendingUp className="mr-2 h-4 w-4" />
                                People
                            </Button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-2">
                        {/* Mobile Tabs */}
                        <div className="flex gap-2 mb-6 lg:hidden overflow-x-auto pb-2">
                            <Button
                                size="sm"
                                variant={activeTab === "for-you" ? "secondary" : "outline"}
                                onClick={() => setActiveTab("for-you")}
                            >
                                For You
                            </Button>
                            <Button
                                size="sm"
                                variant={activeTab === "following" ? "secondary" : "outline"}
                                onClick={() => setActiveTab("following")}
                                disabled={!authenticated}
                            >
                                Following
                            </Button>
                            <Button
                                size="sm"
                                variant={activeTab === "people" ? "secondary" : "outline"}
                                onClick={() => setActiveTab("people")}
                            >
                                People
                            </Button>
                        </div>

                        {/* CREATE POST (Only for For You / Following tabs) */}
                        {authenticated && (activeTab === "for-you" || activeTab === "following") && (
                            <CreatePost onPostCreated={() => fetchFeed()} />
                        )}

                        {/* CONTENT */}
                        {activeTab === "for-you" && (
                            <Feed />
                        )}

                        {activeTab === "following" && (
                            <div className="text-center py-12 text-slate-500 bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
                                <p>Following feed coming soon...</p>
                                {/* Future: <Feed userId="following" /> */}
                            </div>
                        )}

                        {activeTab === "people" && (
                            <div className="space-y-4">
                                <div className="relative mb-6">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        placeholder="Search users..."
                                        className="pl-9 border-slate-800 bg-slate-900/50"
                                    />
                                </div>

                                {isLoadingUsers ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                                    </div>
                                ) : users.length > 0 ? (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {users.map((user) => (
                                            <UserCard key={user.id} user={user} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-slate-500 py-8">No users found.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar (Trending/Who to follow) */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-24">
                            {/* Placeholder for trending tags or markets */}
                            <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
                                <h3 className="font-bold text-slate-100 mb-4">Trending</h3>
                                <div className="space-y-3">
                                    {["#Bitcoin", "#Election2024", "#Solana", "#Tech"].map(tag => (
                                        <div key={tag} className="text-sm text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors">
                                            {tag}
                                            <p className="text-xs text-slate-600">12.5K posts</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
