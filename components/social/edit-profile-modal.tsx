"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Twitter, Instagram, Mail, Globe } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ProfileEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    profile: any;
    username?: string; // Fallback for creation
    onSuccess: () => void;
}

export function ProfileEditModal({ open, onOpenChange, profile, username, onSuccess }: ProfileEditModalProps) {
    const { user } = useUser();
    const [bio, setBio] = useState(profile?.bio || "");
    const [location, setLocation] = useState(profile?.location_label || "");
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    // Social links
    const [socialX, setSocialX] = useState(profile?.social_x || "");
    const [socialInstagram, setSocialInstagram] = useState(profile?.social_instagram || "");
    const [socialTiktok, setSocialTiktok] = useState(profile?.social_tiktok || "");
    const [socialSnapchat, setSocialSnapchat] = useState(profile?.social_snapchat || "");
    const [socialSpotify, setSocialSpotify] = useState(profile?.social_spotify || "");
    const [socialEmail, setSocialEmail] = useState(profile?.social_email || "");
    const [socialWebsite, setSocialWebsite] = useState(profile?.social_website || "");

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);

        try {
            let coverUrl = profile?.cover_photo_url || null;

            // Upload Cover Photo (via Server API to bypass RLS)
            if (coverFile) {
                const formData = new FormData();
                formData.append("file", coverFile);

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadRes.ok) {
                    const err = await uploadRes.json();
                    throw new Error(err.error || "Failed to upload image");
                }

                const data = await uploadRes.json();
                coverUrl = data.url;
            }

            // Update Profile
            // TODO: Call API endpoint to update profile (we'll implement this next)
            // For now, let's assume we have a server action or API route.
            // We'll update the profile directly via Supabase client for now as per policy allows
            // But ideally this should be an API route to secure input.
            // However, RLS allows users to update their own profile, so client-side is safe-ish for this demo.

            // Update Profile via API (Client-side RLS with Clerk is tricky without JWT templates)
            // Update Profile via API (Client-side RLS with Clerk is tricky without JWT templates)
            const response = await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: user.id,
                    username: effectiveUsername,
                    bio,
                    location_label: location,
                    cover_photo_url: coverUrl,
                    avatar_url: profile?.avatar_url || user.imageUrl,
                    social_x: socialX || null,
                    social_instagram: socialInstagram || null,
                    social_tiktok: socialTiktok || null,
                    social_snapchat: socialSnapchat || null,
                    social_spotify: socialSpotify || null,
                    social_email: socialEmail || null,
                    social_website: socialWebsite || null,
                    updated_at: new Date().toISOString(),
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Failed to update profile");
            }

            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Failed to update profile", error);
            alert(`Failed to update profile: ${error.message || error}`);
        } finally {
            setSaving(false);
        }
    };

    // If no username provided (neither from profile nor props), we are in "Manual Creation Mode"
    const [customUsername, setCustomUsername] = useState("");
    const effectiveUsername = profile?.username || username || customUsername;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{profile ? "Edit Profile" : "Create Profile"}</DialogTitle>
                    <DialogDescription>
                        {profile ? "Update your public profile details." : "Set up your public profile to share your journey."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4 overflow-y-auto flex-1 px-1">{/* Username Input (Only if creating new and no preset username) */}
                    {!profile && !username && (
                        <div className="space-y-2">
                            <Label>Choose a Username</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">@</span>
                                <Input
                                    value={customUsername}
                                    onChange={(e) => setCustomUsername(e.target.value)}
                                    placeholder="username"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">This will be your unique handle.</p>
                        </div>
                    )}

                    {/* Cover Photo */}
                    <div className="space-y-2">
                        <Label>Cover Photo</Label>
                        <div className="flex items-center gap-4">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Recommended: 1500x350px</p>
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                        <Label>Bio</Label>
                        <Textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell your story..."
                            maxLength={280}
                        />
                        <p className="text-xs text-right text-muted-foreground">{bio.length}/280</p>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Eg. Tokyo, Japan"
                        />
                    </div>

                    {/* Social Connections Section */}
                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-semibold text-sm">Social Connections</h3>

                        {/* X/Twitter */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><Twitter size={14} /> X / Twitter</Label>
                            <Input
                                value={socialX}
                                onChange={(e) => setSocialX(e.target.value)}
                                placeholder="@username or https://x.com/username"
                            />
                        </div>

                        {/* Instagram */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><Instagram size={14} /> Instagram</Label>
                            <Input
                                value={socialInstagram}
                                onChange={(e) => setSocialInstagram(e.target.value)}
                                placeholder="@username or https://instagram.com/username"
                            />
                        </div>

                        {/* TikTok */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                                </svg>
                                TikTok
                            </Label>
                            <Input
                                value={socialTiktok}
                                onChange={(e) => setSocialTiktok(e.target.value)}
                                placeholder="@username or https://tiktok.com/@username"
                            />
                        </div>

                        {/* Spotify */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                </svg>
                                Spotify
                            </Label>
                            <Input
                                value={socialSpotify}
                                onChange={(e) => setSocialSpotify(e.target.value)}
                                placeholder="username or https://open.spotify.com/user/..."
                            />
                        </div>

                        {/* Snapchat */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.11.479-.11.301 0 .564.13.707.43.13.285.107.675-.12.975-.15.181-.553.478-1.316.77-.766.292-1.032.343-1.167.424-.27.165-.33.42-.359.62-.06.42-.061.69-.076 1.05-.029.18-.074.36-.134.54-.53 1.56-1.706 2.64-3.301 3.03-.164.045-.299.12-.434.21-.104.12-.209.27-.284.42-.12.3-.06.644.076.93.195.434.55.764 1.02 1.034.24.12.556.27.944.434.39.165.838.36 1.258.58.3.149.644.346.898.599.48.49.585 1.124.569 1.574-.016.36-.12.674-.345.898-.434.419-1.03.614-2.204.794-.48.074-.914.27-1.123.495-.211.224-.316.48-.316.74 0 .135.03.27.09.404.034.06.039.074.039.076.464.9.63 1.34.63 1.56 0 .27-.135.465-.239.57-.195.15-.45.224-.749.224-.18 0-.387-.03-.584-.074-.451-.102-.899-.24-1.347-.387-.42-.135-.869-.284-1.363-.284h-.06c-.494 0-.943.15-1.363.284-.448.149-.896.284-1.347.387-.197.045-.403.074-.584.074-.3 0-.554-.074-.749-.224-.105-.105-.24-.3-.24-.57 0-.221.166-.661.63-1.56 0-.002.005-.016.04-.076.06-.134.09-.269.09-.404 0-.26-.105-.516-.316-.74-.21-.224-.643-.42-1.123-.495-1.174-.18-1.77-.375-2.204-.794-.225-.224-.33-.538-.345-.898-.015-.45.09-1.084.57-1.574.253-.253.598-.45.898-.599.42-.22.868-.415 1.258-.58.388-.164.704-.314.944-.434.47-.27.825-.6 1.02-1.034.136-.286.196-.63.076-.93-.075-.15-.18-.3-.284-.42-.135-.09-.27-.165-.434-.21-1.595-.39-2.771-1.47-3.301-3.03-.06-.18-.105-.36-.134-.54-.015-.36-.016-.63-.076-1.05-.029-.2-.089-.455-.359-.62-.135-.081-.401-.132-1.167-.424-.763-.292-1.166-.589-1.316-.77-.227-.3-.25-.69-.12-.975.143-.3.406-.43.707-.43.135 0 .314.022.479.11.374.181.733.285 1.033.301.198 0 .326-.045.401-.09-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847 1.583-3.545 4.94-3.821 5.93-3.821z" />
                                </svg>
                                Snapchat
                            </Label>
                            <Input
                                value={socialSnapchat}
                                onChange={(e) => setSocialSnapchat(e.target.value)}
                                placeholder="username or https://snapchat.com/add/username"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><Mail size={14} /> Public Email</Label>
                            <Input
                                type="email"
                                value={socialEmail}
                                onChange={(e) => setSocialEmail(e.target.value)}
                                placeholder="contact@example.com"
                            />
                        </div>

                        {/* Website */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><Globe size={14} /> Website</Label>
                            <Input
                                value={socialWebsite}
                                onChange={(e) => setSocialWebsite(e.target.value)}
                                placeholder="https://yourwebsite.com"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
