"use client";

import { useUser } from "@clerk/nextjs";
import { Film, Star, Plus, Loader2, Trash2, SlidersHorizontal } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { MovieLogDrawer } from "@/components/movie-log-drawer";
import type { Database } from "@/lib/supabase/database.types";

type MovieLog = Database["public"]["Tables"]["movie_logs"]["Row"];

export default function MoviesPage() {
    const { user, isLoaded } = useUser();
    const [movies, setMovies] = useState<MovieLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);

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

    // Get unique years and months
    const availableYears = useMemo(() => {
        const years = new Set(movies.map(m => new Date(m.watched_date || "").getFullYear()));
        return Array.from(years).filter(y => !isNaN(y)).sort((a, b) => b - a);
    }, [movies]);

    const availableMonths = useMemo(() => {
        const months = new Set(
            movies.map(m => {
                const date = new Date(m.watched_date || "");
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            })
        );
        return Array.from(months).filter(m => !m.includes("NaN")).sort().reverse();
    }, [movies]);

    // Filtered and sorted movies
    const filteredMovies = useMemo(() => {
        let filtered = [...movies];

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
                return new Date(b.watched_date || "").getTime() - new Date(a.watched_date || "").getTime();
            } else if (sortBy === "rating") {
                return (b.rating || 0) - (a.rating || 0);
            } else {
                return a.title.localeCompare(b.title);
            }
        });

        return filtered;
    }, [movies, filterRating, filterYear, filterMonth, sortBy]);

    const handleDelete = async (id: string) => {
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Film className="text-primary" size={40} />
                    <div>
                        <h1 className="text-4xl font-bold">Movies</h1>
                        <p className="text-muted-foreground">
                            Track your cinematic journey • {filteredMovies.length} movie{filteredMovies.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-all"
                    >
                        <SlidersHorizontal size={18} />
                        Filters
                    </button>
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
                    >
                        <Plus size={20} />
                        Log Movie
                    </button>
                </div>
            </div>

            {/* Filters & Sort Panel */}
            {showFilters && movies.length > 0 && (
                <div className="p-4 rounded-xl bg-card border border-border space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Sort By */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as "date" | "rating" | "title")}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="date">Date Watched</option>
                                <option value="rating">Rating</option>
                                <option value="title">Title (A-Z)</option>
                            </select>
                        </div>

                        {/* Filter by Rating */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Rating</label>
                            <select
                                value={filterRating}
                                onChange={(e) => setFilterRating(e.target.value === "all" ? "all" : parseInt(e.target.value))}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="all">All Ratings</option>
                                <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                                <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                                <option value="3">⭐⭐⭐ 3 Stars</option>
                                <option value="2">⭐⭐ 2 Stars</option>
                                <option value="1">⭐ 1 Star</option>
                            </select>
                        </div>

                        {/* Filter by Year */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Year</label>
                            <select
                                value={filterYear}
                                onChange={(e) => setFilterYear(e.target.value)}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="all">All Years</option>
                                {availableYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filter by Month */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Month</label>
                            <select
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="all">All Months</option>
                                {availableMonths.map(month => {
                                    const [year, monthNum] = month.split("-");
                                    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
                                    return (
                                        <option key={month} value={month}>
                                            {date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>

                    {/* Clear Filters */}
                    {(filterRating !== "all" || filterYear !== "all" || filterMonth !== "all") && (
                        <button
                            onClick={() => {
                                setFilterRating("all");
                                setFilterYear("all");
                                setFilterMonth("all");
                            }}
                            className="text-sm text-primary hover:underline"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            )}

            {/* Movies Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            ) : movies.length === 0 ? (
                <div className="text-center py-20 rounded-xl bg-card border border-border">
                    <Film className="mx-auto text-muted-foreground mb-4" size={64} />
                    <h3 className="text-xl font-semibold mb-2">No movies logged yet</h3>
                    <p className="text-muted-foreground mb-6">
                        Start tracking your cinematic journey
                    </p>
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                    >
                        Log Your First Movie
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {movies.map((movie) => (
                        <div
                            key={movie.id}
                            className="group relative overflow-hidden rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                        >
                            {/* Poster */}
                            {movie.poster_url ? (
                                <img
                                    src={movie.poster_url}
                                    alt={movie.title}
                                    className="w-full h-64 object-cover"
                                />
                            ) : (
                                <div className="w-full h-64 bg-muted flex items-center justify-center">
                                    <Film size={48} className="text-muted-foreground" />
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-4 space-y-2">
                                <h3 className="text-lg font-bold line-clamp-1">{movie.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {movie.year} • {movie.director || "Unknown Director"}
                                </p>

                                {/* Rating */}
                                {movie.rating && (
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

                                {/* Notes */}
                                {movie.notes && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {movie.notes}
                                    </p>
                                )}

                                {/* Watched Date */}
                                <p className="text-xs text-muted-foreground">
                                    Watched: {new Date(movie.watched_date || "").toLocaleDateString()}
                                </p>

                                {/* Delete Button */}
                                <button
                                    onClick={() => handleDelete(movie.id)}
                                    className="absolute top-2 right-2 p-2 bg-destructive/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Drawer */}
            <MovieLogDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                onSuccess={fetchMovies}
            />
        </div>
    );
}
