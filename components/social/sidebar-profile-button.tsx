"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { UserPlus, User2 } from "lucide-react";
import { ProfileEditModal } from "./edit-profile-modal";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function SidebarProfileButton() {
    const { user } = useUser();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    const fetchProfile = async () => {
        if (!user) return;
        try {
            const { data } = await supabase
                .from("profiles")
                .select("username, id")
                .eq("id", user.id)
                .single();
            setProfile(data);
        } catch (error) {
            // Ignore error, just means no profile
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchProfile();
        else setLoading(false);
    }, [user]);

    if (loading || !user) return null;

    if (profile) {
        return (
            <Link href={`/u/${profile.username}`} className="w-full">
                <Button variant="outline" className="w-full justify-start gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary">
                    <User2 size={16} />
                    View Profile
                </Button>
            </Link>
        );
    }

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className="w-full justify-start gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0"
            >
                <UserPlus size={16} />
                Create Profile
            </Button>

            <ProfileEditModal
                open={open}
                onOpenChange={setOpen}
                profile={null}
                onSuccess={fetchProfile}
            />
        </>
    );
}
