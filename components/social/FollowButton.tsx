"use client";

import { useFollow } from "@/hooks/useFollow";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
    targetUserId: string;
    className?: string;
    size?: "sm" | "default" | "lg";
}

export function FollowButton({ targetUserId, className, size = "default" }: FollowButtonProps) {
    const { isFollowing, isLoading, follow, unfollow } = useFollow(targetUserId);

    const handleClick = async () => {
        if (isFollowing) {
            await unfollow();
        } else {
            await follow();
        }
    };

    return (
        <Button
            onClick={handleClick}
            disabled={isLoading}
            variant={isFollowing ? "outline" : "default"}
            size={size}
            className={cn(
                "min-w-[100px] transition-all",
                isFollowing
                    ? "border-slate-700 bg-transparent text-slate-300 hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400"
                    : "bg-emerald-600 text-white hover:bg-emerald-500",
                className
            )}
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : isFollowing ? (
                <>
                    <UserCheck className="mr-1.5 h-4 w-4" />
                    <span className="group-hover:hidden">Following</span>
                </>
            ) : (
                <>
                    <UserPlus className="mr-1.5 h-4 w-4" />
                    Follow
                </>
            )}
        </Button>
    );
}
