"use client";

import { useUser } from "@clerk/nextjs";
import { Film, BookOpen, MapPin, Calendar, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { MovieLogDrawer } from "@/components/movie-log-drawer";
import { BookLogDrawer } from "@/components/book-log-drawer";

interface Stats {
    moviesCount: number;
    booksCount: number;
    travelsCount: number;
    totalMemories: number;
}

export default function DashboardPage() {
    const { user, isLoaded } = useUser();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [movieDrawerOpen, setMovieDrawerOpen] = useState(false);
    const [bookDrawerOpen, setBookDrawerOpen] = useState(false);

    const fetchStats = async () => {
        if (!user?.id) return;

        try {
            const response = await fetch("/api/stats");
            if (!response.ok) throw new Error("Failed to fetch stats");
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded) {
            if (user?.id) {
                fetchStats();
            } else {
                setLoading(false);
            }
        }
    }, [isLoaded, user?.id]);

    const handleMovieSuccess = () => {
        fetchStats(); // Refresh stats after adding a movie
    };

    const handleBookSuccess = () => {
        fetchStats(); // Refresh stats after adding a book
    };

    const statsCards = [
        { label: "Movies Watched", value: stats?.moviesCount ?? 0, icon: Film, color: "text-primary" },
        { label: "Books Read", value: stats?.booksCount ?? 0, icon: BookOpen, color: "text-secondary" },
        { label: "Places Visited", value: stats?.travelsCount ?? 0, icon: MapPin, color: "text-chart-3" },
        { label: "Total Memories", value: stats?.totalMemories ?? 0, icon: Calendar, color: "text-chart-4" },
    ];

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent border border-primary/20 p-8">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold mb-2">
                        Welcome back, {user?.firstName || "Explorer"}! 👋
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Track your journey through movies, books, and travel experiences.
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="group relative overflow-hidden rounded-xl bg-card border border-border p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`${stat.color}`}>
                                    <Icon size={32} strokeWidth={1.5} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="animate-spin text-muted-foreground" size={20} />
                                        <p className="text-muted-foreground text-sm">Loading...</p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-3xl font-bold">{stat.value}</p>
                                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                                    </>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl bg-card border border-border p-6">
                <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => setMovieDrawerOpen(true)}
                        className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all duration-200 text-left"
                    >
                        <Film className="text-primary" size={24} />
                        <div>
                            <p className="font-semibold">Log a Movie</p>
                            <p className="text-xs text-muted-foreground">Add your latest watch</p>
                        </div>
                    </button>
                    <button
                        onClick={() => setBookDrawerOpen(true)}
                        className="flex items-center gap-3 p-4 rounded-lg bg-secondary/10 border border-secondary/30 hover:bg-secondary/20 transition-all duration-200 text-left"
                    >
                        <BookOpen className="text-secondary" size={24} />
                        <div>
                            <p className="font-semibold">Log a Book</p>
                            <p className="text-xs text-muted-foreground">Track your reading</p>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 rounded-lg bg-chart-3/10 border border-chart-3/30 hover:bg-chart-3/20 transition-all duration-200 text-left">
                        <MapPin className="text-chart-3" size={24} />
                        <div>
                            <p className="font-semibold">Log a Trip</p>
                            <p className="text-xs text-muted-foreground">Remember your travels</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Drawers */}
            <MovieLogDrawer
                open={movieDrawerOpen}
                onOpenChange={setMovieDrawerOpen}
                onSuccess={handleMovieSuccess}
            />
            <BookLogDrawer
                open={bookDrawerOpen}
                onOpenChange={setBookDrawerOpen}
                onSuccess={handleBookSuccess}
            />
        </div>
    );
}
