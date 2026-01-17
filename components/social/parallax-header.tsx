"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Edit, MapPin, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SocialLinkRow } from "@/components/social/social-link-row";

interface ParallaxHeaderProps {
    profile: any;
    isOwner: boolean;
    onEditClick: () => void;
}

export function ParallaxHeader({ profile, isOwner, onEditClick }: ParallaxHeaderProps) {
    const ref = useRef(null);
    const { scrollY } = useScroll();

    // Parallax effect: moves background slower than content
    const y = useTransform(scrollY, [0, 500], [0, 250]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);

    // Fallback gradient if no cover photo
    const defaultCover = "linear-gradient(to bottom right, #4f46e5, #9333ea)";

    return (
        <div ref={ref} className="relative w-full mb-20">
            {/* Parallax Cover Container */}
            <div className="h-[350px] overflow-hidden relative w-full">
                <motion.div
                    style={{ y, opacity }}
                    className="absolute inset-0 w-full h-full"
                >
                    {profile.cover_photo_url ? (
                        <img
                            src={profile.cover_photo_url}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div
                            className="w-full h-full"
                            style={{ background: defaultCover }}
                        />
                    )}
                    <div className="absolute inset-0 bg-black/20" />
                </motion.div>

                {/* Back to Dashboard Button */}
                <div className="absolute top-4 left-4 z-10">
                    <Button variant="ghost" size="icon" className="bg-black/20 hover:bg-black/40 text-white rounded-full" onClick={() => window.location.href = "/dashboard"}>
                        <ArrowLeft size={20} />
                    </Button>
                </div>
            </div>

            {/* Profile Info Overlay (overlaps cover) */}
            <div className="container mx-auto px-4 relative">
                <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 sm:-mt-20 gap-6 text-center md:text-left">

                    {/* Avatar */}
                    <div className="relative">
                        <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-background shadow-xl">
                            <AvatarImage src={profile.avatar_url} alt={profile.username} />
                            <AvatarFallback className="text-4xl">
                                {profile.username?.[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Text Info */}
                    <div className="flex-1 pb-2">
                        <h1 className="text-3xl sm:text-4xl font-bold">{profile.username}</h1>
                        <div className="text-muted-foreground flex items-center gap-2 mt-1">
                            <p className="font-medium text-foreground">@{profile.username}</p>
                            {profile.location_label && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <MapPin size={14} />
                                        {profile.location_label}
                                    </span>
                                </>
                            )}
                        </div>
                        {profile.bio && (
                            <p className="mt-3 max-w-2xl text-base sm:text-lg text-muted-foreground">
                                {profile.bio}
                            </p>
                        )}

                        {/* Social Links - Mobile (centered below bio) */}
                        <div className="md:hidden mt-4 flex justify-center">
                            <SocialLinkRow
                                social_x={profile.social_x}
                                social_instagram={profile.social_instagram}
                                social_tiktok={profile.social_tiktok}
                                social_snapchat={profile.social_snapchat}
                                social_spotify={profile.social_spotify}
                                social_email={profile.social_email}
                                social_website={profile.social_website}
                            />
                        </div>
                    </div>

                    {/* Social Links - Desktop (right of bio, left of edit button) */}
                    <div className="hidden md:flex pb-4 items-end">
                        <SocialLinkRow
                            social_x={profile.social_x}
                            social_instagram={profile.social_instagram}
                            social_tiktok={profile.social_tiktok}
                            social_snapchat={profile.social_snapchat}
                            social_spotify={profile.social_spotify}
                            social_email={profile.social_email}
                            social_website={profile.social_website}
                        />
                    </div>

                    {/* Action Button */}
                    {isOwner && (
                        <div className="pb-4">
                            <Button onClick={onEditClick} variant="outline" className="gap-2">
                                <Edit size={16} />
                                Edit Profile
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
