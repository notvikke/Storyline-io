"use client";

import { useUser } from "@clerk/nextjs";
import { Tv, Star, Plus, Loader2, Trash2, SlidersHorizontal, Check, Calendar, PlayCircle } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { TvLogDrawer } from "@/components/tv-log-drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Database } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";
import { useGridDensity } from "@/hooks/use-grid-density";
import { GridDensityToggle } from "@/components/grid-density-toggle";

type TvLog = Database["public"]["Tables"]["tv_logs"]["Row"];

export default function TvPage() {
    const { user, isLoaded } = useUser();
    const [shows, setShows] = useState<TvLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editItem, setEditItem] = useState<TvLog | undefined>(undefined);

    // Filter & Sort states
    const [filterRating, setFilterRating] = useState<number | "all">("all");
    const [filterYear, setFilterYear] = useState<string | "all">("all");
    const [sortBy, setSortBy] = useState<"date" | "rating" | "title">("date");
    const [showFilters, setShowFilters] = useState(false);
    const { density, setDensity } = useGridDensity();

    const fetchShows = async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const response = await fetch("/api/tv-logs");
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                console.error("Failed to fetch shows:", errData);
                throw new Error(errData.error || "Failed to fetch tv shows");
            }
            const data = await response.json();
            setShows(data);
        } catch (error) {
            console.error("Error fetching tv shows:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded) {
            if (user?.id) {
                fetchShows();
            } else {
                setLoading(false);
            }
        }
    }, [isLoaded, user?.id]);

    const handleEdit = (show: TvLog) => {
        setEditItem(show);
        setDrawerOpen(true);
    };

    const handleDrawerOpenChange = (open: boolean) => {
        setDrawerOpen(open);
        if (!open) setEditItem(undefined);
    };

    // Get unique years from COMPLETED/WATCHING shows
    const activeShows = useMemo(() => shows.filter(s => s.status !== "planning"), [shows]);

    const availableYears = useMemo(() => {
        const years = new Set(
            activeShows
                .map(s => s.created_at ? new Date(s.created_at).getFullYear() : NaN)
                .filter(y => !isNaN(y))
        );
        return Array.from(years).sort((a, b) => b - a);
    }, [activeShows]);


    // Filtered and sorted shows
    const getFilteredShows = (list: TvLog[]) => {
        let filtered = [...list];

        // Filter by rating
        if (filterRating !== "all") {
            filtered = filtered.filter(s => s.rating === filterRating);
        }

        // Filter by year
        if (filterYear !== "all") {
            filtered = filtered.filter(s =>
                new Date(s.created_at).getFullYear() === parseInt(filterYear)
            );
        }

        // Sort
        filtered.sort((a, b) => {
            if (sortBy === "date") {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return dateB - dateA;
            } else if (sortBy === "rating") {
                return (b.rating || 0) - (a.rating || 0);
            } else {
                return a.title.localeCompare(b.title);
            }
        });

        return filtered;
    };

    const journeyShows = useMemo(() => getFilteredShows(shows.filter(s => s.status === "completed")), [shows, filterRating, filterYear, sortBy]);
    const watchingShows = useMemo(() => getFilteredShows(shows.filter(s => s.status === "watching")), [shows, filterRating, filterYear, sortBy]);
    const planningShows = useMemo(() => getFilteredShows(shows.filter(s => s.status === "planning")), [shows, filterRating, filterYear, sortBy]);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this show?")) return;

        try {
            const response = await fetch(`/api/tv-logs?id=${id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete show");
            fetchShows();
        } catch (error) {
            console.error("Error deleting show:", error);
            alert("Failed to delete show");
        }
    };

    const TvGrid = ({ items, status }: { items: TvLog[], status: "completed" | "planning" | "watching" }) => (
        <div className={cn(
            "grid grid-cols-2 gap-4 animate-in fade-in duration-500",
            "md:grid-cols-3",
            density === 5 ? "lg:grid-cols-5" : "lg:grid-cols-7",
            density === 7 ? "gap-4" : "gap-6"
        )}>
            {items.map((show) => (
                <div
                    key={show.id}
                    className={cn(
                        "group relative overflow-hidden rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10",
                        status === "planning" && "opacity-80 hover:opacity-100"
                    )}
                >
                    {/* Poster */}
                    <div className="relative">
                        {show.poster_url ? (
                            <img
                                src={show.poster_url}
                                alt={show.title}
                                className={cn(
                                    "w-full h-64 object-cover transition-all duration-500",
                                    status === "planning" && "grayscale-[0.5] group-hover:grayscale-0"
                                )}
                            />
                        ) : (
                            <div className="w-full h-64 bg-muted flex items-center justify-center">
                                <Tv size={48} className="text-muted-foreground" />
                            </div>
                        )}

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                        {/* Edit Button overlay */}
                        <button
                            onClick={() => handleEdit(show)}
                            className="absolute inset-0 z-10 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-black/40 backdrop-blur-sm text-white font-medium"
                        >
                            Update Status
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                        <div className="flex justify-between items-start gap-2">
                            <h3 className="text-lg font-bold line-clamp-1 leading-tight">{show.title}</h3>
                            {status === "planning" && <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-muted rounded text-muted-foreground whitespace-nowrap">Plan</span>}
                            {status === "watching" && <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-primary/20 text-primary rounded whitespace-nowrap">Watching</span>}
                        </div>

                        {status === "completed" && show.rating && (
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        className={
                                            i < show.rating!
                                                ? "fill-primary text-primary"
                                                : "text-muted-foreground"
                                        }
                                    />
                                ))}
                            </div>
                        )}

                        {show.notes && (
                            <p className="text-sm text-muted-foreground line-clamp-2 italic">
                                "{show.notes}"
                            </p>
                        )}

                        <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 mt-2">
                            <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                Log: {new Date(show.created_at).toLocaleDateString()}
                            </div>
                        </div>

                        {/* Delete Button */}
                        <button
                            onClick={(e) => handleDelete(show.id, e)}
                            className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-md text-white rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-destructive z-20"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Tv className="text-primary" size={40} />
                    <div>
                        <h1 className="text-4xl font-bold">TV Shows</h1>
                        <p className="text-muted-foreground">
                            Track your binge-watching sessions
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setDrawerOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 w-full md:w-auto justify-center"
                >
                    <Plus size={20} />
                    Log TV Show
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            ) : (
                <Tabs defaultValue="watching" className="w-full">
                    <div className="flex items-center justify-between mb-6">
                        <TabsList className="bg-muted/50 p-1">
                            <TabsTrigger value="watching" className="px-6">Watching ({shows.filter(s => s.status === 'watching').length})</TabsTrigger>
                            <TabsTrigger value="journey" className="px-6">Completed ({shows.filter(s => s.status === 'completed').length})</TabsTrigger>
                            <TabsTrigger value="planning" className="px-6">Planning ({shows.filter(s => s.status === 'planning').length})</TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm",
                                    showFilters ? "bg-primary/20 text-primary" : "bg-muted hover:bg-muted/80"
                                )}
                            >
                                <SlidersHorizontal size={16} />
                                Filters
                            </button>
                            <div className="h-6 w-px bg-border mx-2" />
                            <GridDensityToggle density={density} onDensityChange={setDensity} />
                        </div>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="p-4 rounded-xl bg-card border border-border space-y-4 mb-6 animate-in slide-in-from-top-2 duration-200">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Sort By</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as "date" | "rating" | "title")}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="date">Date (Newest)</option>
                                        <option value="rating">Rating</option>
                                        <option value="title">Title (A-Z)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Rating</label>
                                    <select
                                        value={filterRating}
                                        onChange={(e) => setFilterRating(e.target.value === "all" ? "all" : parseInt(e.target.value))}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="all">All Ratings</option>
                                        {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Year Logged</label>
                                    <select
                                        value={filterYear}
                                        onChange={(e) => setFilterYear(e.target.value)}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="all">All Years</option>
                                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    <TabsContent value="watching" className="space-y-6">
                        {watchingShows.length === 0 ? (
                            <div className="text-center py-20 rounded-xl bg-card border border-border border-dashed">
                                <PlayCircle className="mx-auto text-muted-foreground mb-4" size={48} />
                                <h3 className="text-xl font-semibold mb-2">Not watching anything?</h3>
                                <p className="text-muted-foreground">Find a new show to start bingeing!</p>
                            </div>
                        ) : (
                            <TvGrid items={watchingShows} status="watching" />
                        )}
                    </TabsContent>

                    <TabsContent value="journey" className="space-y-6">
                        {journeyShows.length === 0 ? (
                            <div className="text-center py-20 rounded-xl bg-card border border-border border-dashed">
                                <Tv className="mx-auto text-muted-foreground mb-4" size={48} />
                                <h3 className="text-xl font-semibold mb-2">No completed shows yet</h3>
                                <p className="text-muted-foreground">Mark shows as done when you finish them.</p>
                            </div>
                        ) : (
                            <TvGrid items={journeyShows} status="completed" />
                        )}
                    </TabsContent>

                    <TabsContent value="planning" className="space-y-6">
                        {planningShows.length === 0 ? (
                            <div className="text-center py-20 rounded-xl bg-card border border-border border-dashed">
                                <Plus className="mx-auto text-muted-foreground mb-4" size={48} />
                                <h3 className="text-xl font-semibold mb-2">Watchlist empty</h3>
                                <p className="text-muted-foreground">Search for shows and add them to your plan.</p>
                            </div>
                        ) : (
                            <TvGrid items={planningShows} status="planning" />
                        )}
                    </TabsContent>
                </Tabs>
            )}

            {/* Drawer */}
            <TvLogDrawer
                open={drawerOpen}
                onOpenChange={handleDrawerOpenChange}
                onSuccess={fetchShows}
                editItem={editItem}
            />
        </div>
    );
}
