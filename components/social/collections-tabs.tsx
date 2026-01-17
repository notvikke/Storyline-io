
"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@supabase/supabase-js";
import { Loader2, Star } from "lucide-react";
import Link from "next/link";

// Initialize Supabase
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CollectionsTabsProps {
    userId: string;
}

export function CollectionsTabs({ userId }: CollectionsTabsProps) {
    const [activeTab, setActiveTab] = useState("movies");
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCollection(activeTab);
    }, [activeTab, userId]);

    const fetchCollection = async (type: string) => {
        setLoading(true);
        try {
            let table = "";
            let select = "*";

            // Map tab to table
            switch (type) {
                case "movies": table = "movie_logs"; break;
                case "tv": table = "tv_logs"; break;
                case "books": table = "book_logs"; break;
                case "blogs": table = "blog_posts"; break;
                case "travel": table = "travel_logs"; break;
                default: table = "movie_logs";
            }

            // Fetch ALL items (no limit for now, or higher limit like 50)
            let query = supabase
                .from(table)
                .select(select)
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(50);

            // Removed rating filter per user request to show ALL data
            /*
            if (["movies", "tv", "books"].includes(type)) {
                query = query.gte("rating", 4);
            }
            */

            const { data, error } = await query;
            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error("Error fetching collection:", error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section>
            <Tabs defaultValue="movies" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-center mb-8">
                    <TabsList className="bg-muted/50 p-1">
                        <TabsTrigger value="movies">Movies</TabsTrigger>
                        <TabsTrigger value="tv">TV Shows</TabsTrigger>
                        <TabsTrigger value="books">Books</TabsTrigger>
                        <TabsTrigger value="blogs">Blogs</TabsTrigger>
                        <TabsTrigger value="travel">Travel</TabsTrigger>
                    </TabsList>
                </div>

                <div className="min-h-[300px]">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-muted-foreground" size={32} />
                        </div>
                    ) : items.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {items.map((item) => {
                                const isBlog = activeTab === "blogs";
                                const cardContent = (
                                    <>
                                        {/* Poster Container */}
                                        <div className="aspect-[2/3] relative">
                                            {(item.poster_url || item.cover_url || item.cover_image || item.photo_url) ? (
                                                <img
                                                    src={item.poster_url || item.cover_url || item.cover_image || item.photo_url}
                                                    alt={item.title || item.location_name}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-secondary/20 text-center p-2 text-xs text-muted-foreground">
                                                    {item.title || item.location_name}
                                                </div>
                                            )}

                                            {/* Status Badge */}
                                            {item.status && (
                                                <div className="absolute top-2 right-2">
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-md text-white ${item.status === 'completed' ? 'bg-green-500' :
                                                        item.status === 'watching' ? 'bg-blue-500' :
                                                            item.status === 'planning' ? 'bg-yellow-500' : 'bg-gray-500'
                                                        }`}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Rating Badge */}
                                            {item.rating && (
                                                <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 text-amber-400 shadow-sm border border-white/10">
                                                    <Star className="fill-amber-400" size={12} />
                                                    <span className="font-bold text-xs">{item.rating}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info Below Poster */}
                                        <div className="p-3 bg-card border-t">
                                            <p className="font-bold line-clamp-1 text-sm mb-1">{item.title || item.location_name}</p>
                                            {(item.watched_date || item.finished_date || item.visit_date || item.created_at) && (
                                                <p className="text-[10px] text-muted-foreground">
                                                    {new Date(item.watched_date || item.finished_date || item.visit_date || item.created_at).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </>
                                );

                                return isBlog ? (
                                    <Link key={item.id} href={`/blog/${item.id}`} className="group relative rounded-lg overflow-hidden bg-muted shadow-sm hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
                                        {cardContent}
                                    </Link>
                                ) : (
                                    <div key={item.id} className="group relative rounded-lg overflow-hidden bg-muted shadow-sm hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
                                        {cardContent}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
                            <p className="text-muted-foreground">No entries found.</p>
                        </div>
                    )}
                </div>
            </Tabs>
        </section>
    );
}
