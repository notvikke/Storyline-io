"use client";

import { useUser } from "@clerk/nextjs";
import { Film, Star, Plus, Loader2, Trash2, SlidersHorizontal, Check, Calendar } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { MovieLogDrawer } from "@/components/movie-log-drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Database } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

type MovieLog = Database["public"]["Tables"]["movie_logs"]["Row"];

export default function MoviesPage() {
    const { user, isLoaded } = useUser();
    const [movies, setMovies] = useState<MovieLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editItem, setEditItem] = useState<MovieLog | undefined>(undefined);

    // Filter & Sort states
    const [filterRating, setFilterRating] = useState<number | "all">("all");
    const [filterYear, setFilterYear] = useState<string | "all">("all");
    const [filterMonth, setFilterMonth] = useState<string | "all">("all");
    const [sortBy, setSortBy] = useState<"date" | "rating" | "title">("date");
    const [showFilters, setShowFilters] = useState(false);

    const fetchMovies = async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const response = await fetch("/api/movie-logs");
            if (!response.ok) throw new Error("Failed to fetch movies");
            const data = await response.json();
            setMovies(data);
        } catch (error) {
            console.error("Error fetching movies:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded) {
            if (user?.id) {
                fetchMovies();
            } else {
                setLoading(false);
            }
        }
    }, [isLoaded, user?.id]);

    const handleComplete = (movie: MovieLog) => {
        setEditItem(movie);
        setDrawerOpen(true);
    };

    const handleDrawerOpenChange = (open: boolean) => {
        setDrawerOpen(open);
        if (!open) setEditItem(undefined);
    };

    // Get unique years and months from COMPLETED movies only
    const completedMovies = useMemo(() => movies.filter(m => m.status === "completed"), [movies]);

    const availableYears = useMemo(() => {
        const years = new Set(
            completedMovies
                .map(m => m.watched_date ? new Date(m.watched_date).getFullYear() : NaN)
                .filter(y => !isNaN(y))
        );
        return Array.from(years).sort((a, b) => b - a);
    }, [completedMovies]);

    const availableMonths = useMemo(() => {
        const months = new Set(
            completedMovies.map(m => {
                if (!m.watched_date) return "";
                const date = new Date(m.watched_date);
                if (isNaN(date.getTime())) return "";
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            })
        );
        return Array.from(months).filter(m => m !== "").sort().reverse();
    }, [completedMovies]);

    // Filtered and sorted movies (applied to both lists locally)
    const getFilteredMovies = (list: MovieLog[]) => {
        let filtered = [...list];

        // Filter by rating
        if (filterRating !== "all") {
            filtered = filtered.filter(m => m.rating === filterRating);
        }

        // Filter by year
        if (filterYear !== "all") {
            filtered = filtered.filter(m =>
                new Date(m.watched_date || "").getFullYear() === parseInt(filterYear)
            );
        }

        // Filter by month
        if (filterMonth !== "all") {
            filtered = filtered.filter(m => {
                const date = new Date(m.watched_date || "");
                const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                return monthStr === filterMonth;
            });
        }

        // Sort
        filtered.sort((a, b) => {
            if (sortBy === "date") {
                const dateA = new Date(a.watched_date || a.created_at).getTime();
                const dateB = new Date(b.watched_date || b.created_at).getTime();
                return dateB - dateA;
            } else if (sortBy === "rating") {
                return (b.rating || 0) - (a.rating || 0);
            } else {
                return a.title.localeCompare(b.title);
            }
        });

        return filtered;
    };

    const journeyMovies = useMemo(() => getFilteredMovies(movies.filter(m => m.status === "completed")), [movies, filterRating, filterYear, filterMonth, sortBy]);
    const planningMovies = useMemo(() => getFilteredMovies(movies.filter(m => m.status === "planning")), [movies, filterRating, filterYear, filterMonth, sortBy]);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this movie?")) return;

        try {
            const response = await fetch(`/api/movie-logs?id=${id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete movie");
            fetchMovies();
        } catch (error) {
            console.error("Error deleting movie:", error);
            alert("Failed to delete movie");
        }
    };

    const MovieGrid = ({ items, isPlanning = false }: { items: MovieLog[], isPlanning?: boolean }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {items.map((movie) => (
                <div
                    key={movie.id}
                    className={cn(
                        "group relative overflow-hidden rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10",
                        isPlanning && "opacity-80 hover:opacity-100"
                    )}
                >
                    {/* Poster */}
                    <div className="relative">
                        {movie.poster_url ? (
                            <img
                                src={movie.poster_url}
                                alt={movie.title}
                                className={cn(
                                    "w-full h-64 object-cover transition-all duration-500",
                                    isPlanning && "grayscale-[0.5] group-hover:grayscale-0"
                                )}
                            />
                        ) : (
                            <div className="w-full h-64 bg-muted flex items-center justify-center">
                                <Film size={48} className="text-muted-foreground" />
                            </div>
                        )}

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                        {/* Planning: Move to Completed Button */}
                        {isPlanning && (
                            <button
                                onClick={() => handleComplete(movie)}
                                className="absolute bottom-4 right-4 p-3 bg-primary text-black rounded-full shadow-lg hover:scale-110 transition-all active:scale-95 z-20"
                                title="Mark as Watched"
                            >
                                <Check size={20} strokeWidth={3} />
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                        <div className="flex justify-between items-start gap-2">
                            <h3 className="text-lg font-bold line-clamp-1 leading-tight">{movie.title}</h3>
                            {isPlanning && <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-muted rounded text-muted-foreground whitespace-nowrap">Planned</span>}
                        </div>

                        <p className="text-sm text-muted-foreground">
                            {movie.year} • {movie.director || "Unknown Director"}
                        </p>

                        {!isPlanning && movie.rating && (
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        className={
                                            i < movie.rating!
                                                ? "fill-primary text-primary"
                                                : "text-muted-foreground"
                                        }
                                    />
                                ))}
                            </div>
                        )}

                        {movie.notes && (
                            <p className="text-sm text-muted-foreground line-clamp-2 italic">
                                "{movie.notes}"
                            </p>
                        )}

                        <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 mt-2">
                            <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                {isPlanning
                                    ? `Added: ${new Date(movie.created_at).toLocaleDateString()}`
                                    : `Watched: ${new Date(movie.watched_date || "").toLocaleDateString()}`
                                }
                            </div>
                        </div>

                        {/* Delete Button */}
                        <button
                            onClick={(e) => handleDelete(movie.id, e)}
                            className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-md text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive z-20"
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
                    <Film className="text-primary" size={40} />
                    <div>
                        <h1 className="text-4xl font-bold">Movies</h1>
                        <p className="text-muted-foreground">
                            Track your cinematic journey
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setDrawerOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 w-full md:w-auto justify-center"
                >
                    <Plus size={20} />
                    Log Movie
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            ) : (
                <Tabs defaultValue="journey" className="w-full">
                    <div className="flex items-center justify-between mb-6">
                        <TabsList className="bg-muted/50 p-1">
                            <TabsTrigger value="journey" className="px-6">My Journey ({movies.filter(m => m.status === 'completed').length})</TabsTrigger>
                            <TabsTrigger value="planning" className="px-6">Planning ({movies.filter(m => m.status === 'planning').length})</TabsTrigger>
                        </TabsList>

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
                                    <label className="block text-sm font-medium mb-2">Year</label>
                                    <select
                                        value={filterYear}
                                        onChange={(e) => setFilterYear(e.target.value)}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="all">All Years</option>
                                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Month</label>
                                    <select
                                        value={filterMonth}
                                        onChange={(e) => setFilterMonth(e.target.value)}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="all">All Months</option>
                                        {availableMonths.map(m => {
                                            const [year, monthNum] = m.split("-");
                                            const date = new Date(parseInt(year), parseInt(monthNum) - 1);
                                            return <option key={m} value={m}>{date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</option>
                                        })}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    <TabsContent value="journey" className="space-y-6">
                        {journeyMovies.length === 0 ? (
                            <div className="text-center py-20 rounded-xl bg-card border border-border border-dashed">
                                <Film className="mx-auto text-muted-foreground mb-4" size={48} />
                                <h3 className="text-xl font-semibold mb-2">Your journey is empty</h3>
                                <p className="text-muted-foreground">Start logging movies you've watched!</p>
                            </div>
                        ) : (
                            <MovieGrid items={journeyMovies} />
                        )}
                    </TabsContent>

                    <TabsContent value="planning" className="space-y-6">
                        {planningMovies.length === 0 ? (
                            <div className="text-center py-20 rounded-xl bg-card border border-border border-dashed">
                                <Plus className="mx-auto text-muted-foreground mb-4" size={48} />
                                <h3 className="text-xl font-semibold mb-2">Nothing planned yet</h3>
                                <p className="text-muted-foreground">Search for movies and add them to your planning list.</p>
                            </div>
                        ) : (
                            <MovieGrid items={planningMovies} isPlanning={true} />
                        )}
                    </TabsContent>
                </Tabs>
            )}

            {/* Drawer */}
            <MovieLogDrawer
                open={drawerOpen}
                onOpenChange={handleDrawerOpenChange}
                onSuccess={fetchMovies}
                editItem={editItem}
            />
        </div>
    );
}
