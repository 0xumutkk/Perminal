"use client";

import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import type { Profile } from "@/lib/database.types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface EditProfileModalProps {
    profile: Profile;
    isOpen: boolean;
    onClose: () => void;
}

export function EditProfileModal({ profile, isOpen, onClose }: EditProfileModalProps) {
    const { updateProfile } = useProfile();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const success = await updateProfile({
                display_name: formData.display_name,
                bio: formData.bio,
                avatar_url: formData.avatar_url || null,
            });

            if (success) {
                onClose();
                // Ideally show success toast
            }
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="display_name">Display Name</Label>
                        <Input
                            id="display_name"
                            value={formData.display_name}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, display_name: e.target.value }))
                            }
                            placeholder="Vitalik Buterin"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="bio">Bio</Label>
                        <textarea
                            id="bio"
                            className="flex min-h-[80px] w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-slate-200"
                            value={formData.bio}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, bio: e.target.value }))
                            }
                            placeholder="Tell us about yourself..."
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="avatar_url">Avatar URL</Label>
                        <Input
                            id="avatar_url"
                            value={formData.avatar_url}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, avatar_url: e.target.value }))
                            }
                            placeholder="https://example.com/avatar.jpg"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
