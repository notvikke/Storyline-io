
"use client";

import { Crown, Film, BookOpen, Tv } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface HallOfFameProps {
    profile: any;
}

export function HallOfFame({ profile }: HallOfFameProps) {
    const pinnedItems = [
        { type: "movie", data: profile.pinned_movie, icon: Film, label: "Favorite Movie" },
        { type: "book", data: profile.pinned_book, icon: BookOpen, label: "Favorite Book" },
        { type: "tv", data: profile.pinned_tv, icon: Tv, label: "Favorite Show" },
    ].filter(item => item.data); // Only show if pinned

    if (pinnedItems.length === 0) return null;

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-2">
                <Crown className="text-amber-500 fill-amber-500" size={24} />
                <h2 className="text-2xl font-bold font-serif">The Hall of Fame</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pinnedItems.map((item, idx) => (
                    <Card key={`${item.type}-${idx}`} className="overflow-hidden border-2 border-amber-500/20 bg-amber-500/5 hover:border-amber-500/50 transition-all group relative">
                        {/* Poster Background for visual richness */}
                        <div className="absolute inset-0 z-0">
                            {/* We fallback to the poster URL if available */}
                            {(item.data.poster_url || item.data.cover_url) ? (
                                <img
                                    src={item.data.poster_url || item.data.cover_url}
                                    alt={item.data.title}
                                    className="w-full h-full object-cover opacity-20 blur-sm group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-amber-500/10 to-transparent" />
                            )}
                        </div>

                        <CardContent className="relative z-10 p-6 flex flex-col items-center text-center h-full justify-between gap-4">
                            <div className="p-3 bg-background/80 backdrop-blur-sm rounded-full border border-amber-500/30">
                                <item.icon className="text-amber-500" size={24} />
                            </div>

                            <div className="space-y-1">
                                <h3 className="font-bold text-lg leading-tight group-hover:text-amber-600 transition-colors">
                                    {item.data.title}
                                </h3>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                                    {item.label}
                                </p>
                            </div>

                            {/* Mini Rating Badge */}
                            {item.data.rating && (
                                <div className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow-lg shadow-amber-500/20">
                                    {item.data.rating}/5
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}
