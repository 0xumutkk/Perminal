"use client";

import { useState } from "react";
import { useInteractions } from "@/hooks/useInteractions";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import Image from "next/image";

interface CreatePostProps {
    onPostCreated?: () => void;
    marketId?: string;
    marketSlug?: string;
    marketQuestion?: string;
}

export function CreatePost({
    onPostCreated,
    marketId,
    marketSlug,
    marketQuestion
}: CreatePostProps) {
    const { createPost, isSubmitting } = useInteractions();
    const { authenticated, user } = useAuth();
    const [content, setContent] = useState("");

    // Simple avatar placeholder if no user image
    const userInitial = user?.email?.address?.charAt(0).toUpperCase() || "U";

    const handleSubmit = async () => {
        if (!content.trim()) return;

        const result = await createPost(
            content,
            marketId,
            marketSlug,
            marketQuestion
        );

        if (result) {
            setContent("");
            if (onPostCreated) onPostCreated();
        }
    };

    if (!authenticated) {
        return null;
    }

    return (
        <Card className="p-4 mb-6 border-slate-800 bg-slate-900/50 backdrop-blur">
            <div className="flex gap-4">
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-emerald-900/50 flex items-center justify-center border border-emerald-500/20">
                    <span className="text-emerald-400 font-bold">{userInitial}</span>
                </div>

                <div className="flex-1 space-y-4">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={marketQuestion ? `Share your thoughts on: ${marketQuestion}...` : "What's happening?"}
                        className="w-full bg-transparent resize-none text-slate-100 placeholder:text-slate-500 focus:outline-none min-h-[80px]"
                        disabled={isSubmitting}
                    />

                    {marketQuestion && (
                        <div className="text-xs text-emerald-400/80 bg-emerald-950/30 px-2 py-1 rounded inline-block">
                            Replying to market: {marketQuestion}
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                        <div className="flex gap-2 text-slate-500">
                            {/* Future: Image/Media buttons could go here */}
                        </div>
                        <Button
                            onClick={handleSubmit}
                            disabled={!content.trim() || isSubmitting}
                            size="sm"
                            className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    Post <Send className="ml-2 h-3 w-3" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
