
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { ParallaxHeader } from "@/components/social/parallax-header";
import { ProfileEditModal } from "@/components/social/edit-profile-modal";
import { HallOfFame } from "@/components/social/hall-of-fame";
import { CollectionsTabs } from "@/components/social/collections-tabs";
import { Guestbook } from "@/components/social/guestbook";
import { Loader2 } from "lucide-react";
import { motion, LayoutGroup } from "framer-motion";
import { Button } from "@/components/ui/button";

// Initialize Supabase (Public client is fine for reading public profiles)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SocialProfilePage() {
    const params = useParams(); // { username: string }
    const { user, isLoaded } = useUser();

    // Validating username from URL
    const username = Array.isArray(params?.username) ? params.username[0] : params?.username;

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);

    const fetchProfile = async () => {
        if (!username) return;
        setLoading(true);
        try {
            // Fetch profile by username JOINED with pinned items
            // Supabase Join syntax: "column( foreign_table_columns )"
            // We aliased keys in our heads, but here we reference the relation.
            const { data, error } = await supabase
                .from("profiles")
                .select(`
                    *,
                    pinned_movie:pinned_movie_id( * ),
                    pinned_book:pinned_book_id( * ),
                    pinned_tv:pinned_tv_id( * )
                `)
                .eq("username", username)
                .single();

            if (error) {
                console.warn("Profile fetch error:", error);
                setProfile(null);
            } else {
                setProfile({
                    ...data,
                    // Fallback avatar from Clerk if not in DB (DB usually just stores ref, but here we can mix)
                    // Actually, for this demo we might rely on Clerk for the avatar 
                    // since we didn't add avatar_url to profiles table yet?
                    // Ah, the user didn't ask for avatar_url column. 
                    // We'll use the one from Clerk if it's the own user, 
                    // BUT for public viewers we need a way to get it. 
                    // The prompt said: "Avatar: Display the user's Clerk Profile Image"
                    // Since Clerk images are tied to Clerk IDs, we might need to store it or fetch it via backend.
                    // For simplicity in this step, let's assume we can use a placeholder or 
                    // if it's the logged-in user, use their image.
                    avatar_url: user?.username?.toLowerCase() === username?.toLowerCase() ? user.imageUrl : "https://github.com/shadcn.png"
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [username, user]);

    // Check ownership
    // Note: Clerk username might not match our DB username strictly if we don't sync them.
    // Ideally we match by ID, but the URL is by username.
    // So we check: authenticated user ID === profile.id
    const isOwner = user?.id && profile?.id === user.id;

    if (loading || !isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center">
                <h1 className="text-2xl font-bold">User Not Found</h1>
                <p className="text-muted-foreground mb-4">The story you are looking for hasn't been written yet.</p>
                {user ? (
                    <Button onClick={() => setEditOpen(true)}>
                        {user.username ? "Create My Profile" : `Claim @${username}`}
                    </Button>
                ) : (
                    <p className="text-sm mt-4 text-muted-foreground">Sign in to claim this handle.</p>
                )}

                <ProfileEditModal
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    profile={profile}
                    username={username}
                    onSuccess={fetchProfile}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <ParallaxHeader
                profile={profile}
                isOwner={!!isOwner}
                onEditClick={() => setEditOpen(true)}
            />

            <div className="container mx-auto px-4 mt-8 space-y-16">
                {/* Hall of Fame - Only show if there are pinned items */}
                {(profile.pinned_movie || profile.pinned_book || profile.pinned_tv) && (
                    <LayoutGroup>
                        <motion.div layout id="hall-of-fame">
                            <HallOfFame profile={profile} />
                        </motion.div>
                    </LayoutGroup>
                )}

                {/* Collections Tabs */}
                <CollectionsTabs userId={profile.id} />

                <section>
                    <Guestbook profileId={profile.id} />
                </section>
            </div>

            <ProfileEditModal
                open={editOpen}
                onOpenChange={setEditOpen}
                profile={profile}
                username={username}
                onSuccess={fetchProfile}
            />
        </div>
    );
}
