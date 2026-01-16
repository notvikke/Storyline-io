"use client";

import { useUser } from "@clerk/nextjs";
import { Film, BookOpen, MapPin, Calendar, Loader2, ArrowRight, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { MovieLogDrawer } from "@/components/movie-log-drawer";
import { BookLogDrawer } from "@/components/book-log-drawer";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface Stats {
    moviesCount: number;
    booksCount: number;
    travelsCount: number;
    totalMemories: number;
}

interface DashboardHighlights {
    recent: {
        movie: any | null;
        book: any | null;
    };
    planning: any[];
    flashback: any | null;
}

export default function DashboardPage() {
    const { user, isLoaded } = useUser();
    const [stats, setStats] = useState<Stats | null>(null);
    const [highlights, setHighlights] = useState<DashboardHighlights | null>(null);
    const [loading, setLoading] = useState(true);
    const [movieDrawerOpen, setMovieDrawerOpen] = useState(false);
    const [bookDrawerOpen, setBookDrawerOpen] = useState(false);

    const fetchData = async () => {
        if (!user?.id) return;

        try {
            // Fetch Stats
            const statsRes = await fetch("/api/stats");
            const statsData = await statsRes.json();
            setStats(statsData);

            // Fetch Highlights
            const highlightsRes = await fetch("/api/dashboard-highlights");
            const highlightsData = await highlightsRes.json();
            setHighlights(highlightsData);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded) {
            if (user?.id) fetchData();
            else setLoading(false);
        }
    }, [isLoaded, user?.id]);

    const handleMovieSuccess = () => fetchData();
    const handleBookSuccess = () => fetchData();

    const statsCards = [
        { label: "Movies Watched", value: stats?.moviesCount ?? 0, icon: Film, color: "text-primary" },
        { label: "Books Read", value: stats?.booksCount ?? 0, icon: BookOpen, color: "text-secondary" },
        { label: "Places Visited", value: stats?.travelsCount ?? 0, icon: MapPin, color: "text-chart-3" },
        { label: "Total Memories", value: stats?.totalMemories ?? 0, icon: Calendar, color: "text-chart-4" },
    ];

    // Animation Variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent border border-primary/20 p-8"
            >
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold mb-2">
                        Welcome back, {user?.firstName || "Explorer"}! 👋
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Track your journey through movies, books, and travel experiences.
                    </p>
                </div>
            </motion.div>

            {/* Quick Actions - Moved to top for utility */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="rounded-xl bg-card border border-border p-6 shadow-sm"
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.button
                        variants={item}
                        onClick={() => setMovieDrawerOpen(true)}
                        className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all duration-200 text-left group"
                    >
                        <Film className="text-primary group-hover:scale-110 transition-transform" size={24} />
                        <div>
                            <p className="font-semibold">Log a Movie</p>
                            <p className="text-xs text-muted-foreground">Add your latest watch</p>
                        </div>
                    </motion.button>
                    <motion.button
                        variants={item}
                        onClick={() => setBookDrawerOpen(true)}
                        className="flex items-center gap-3 p-4 rounded-lg bg-secondary/10 border border-secondary/30 hover:bg-secondary/20 transition-all duration-200 text-left group"
                    >
                        <BookOpen className="text-secondary group-hover:scale-110 transition-transform" size={24} />
                        <div>
                            <p className="font-semibold">Log a Book</p>
                            <p className="text-xs text-muted-foreground">Track your reading</p>
                        </div>
                    </motion.button>
                    <motion.button
                        variants={item}
                        // Travel Log unimplemented in this snippet context, but consistent with design
                        className="flex items-center gap-3 p-4 rounded-lg bg-chart-3/10 border border-chart-3/30 hover:bg-chart-3/20 transition-all duration-200 text-left group"
                    >
                        <MapPin className="text-chart-3 group-hover:scale-110 transition-transform" size={24} />
                        <div>
                            <p className="font-semibold">Log a Trip</p>
                            <p className="text-xs text-muted-foreground">Remember your travels</p>
                        </div>
                    </motion.button>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {statsCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            variants={item}
                            key={stat.label}
                            className={`group relative overflow-hidden rounded-xl bg-card border border-border p-6 hover:border-${stat.color.split('-')[1]}/50 transition-all duration-300 hover:shadow-lg hover:shadow-${stat.color.split('-')[1]}/10`}
                            style={{ borderColor: "var(--border)" }} // Default border, enhanced by hover
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`${stat.color}`}>
                                    <Icon size={32} strokeWidth={1.5} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                {loading && !stats ? (
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
                            <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color.split('-')[1]}/0 to-${stat.color.split('-')[1]}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Highlights & Planning) */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="lg:col-span-2 space-y-8"
                >
                    {/* Recent Highlights */}
                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ textShadow: "0 0 10px rgba(0, 255, 204, 0.3)" }}>
                            <span className="text-[#00FFCC]">Recently Logged</span>
                        </h2>

                        {loading && !highlights ? (
                            <div className="h-48 rounded-xl bg-muted/20 animate-pulse" />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Recent Movie */}
                                {highlights?.recent.movie ? (
                                    <div className="flex bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors group">
                                        <div className="w-24 shrink-0 bg-muted relative">
                                            {highlights.recent.movie.poster_url ? (
                                                <Image
                                                    src={highlights.recent.movie.poster_url}
                                                    alt={highlights.recent.movie.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-muted-foreground"><Film /></div>
                                            )}
                                        </div>
                                        <div className="p-4 flex flex-col justify-between flex-1">
                                            <div>
                                                <h3 className="font-bold line-clamp-1 group-hover:text-primary transition-colors">{highlights.recent.movie.title}</h3>
                                                <div className="flex items-center gap-1 text-yellow-500 my-1">
                                                    <Star size={12} fill="currentColor" />
                                                    <span className="text-xs font-medium">{highlights.recent.movie.rating}/10</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2">{highlights.recent.movie.notes || "No notes added."}</p>
                                            </div>
                                            <Link href="/movies" className="text-xs text-primary mt-2 flex items-center gap-1 hover:underline">
                                                Read more <ArrowRight size={10} />
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-32 rounded-xl border border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground text-sm">
                                        No movies logged yet.
                                    </div>
                                )}

                                {/* Recent Book */}
                                {highlights?.recent.book ? (
                                    <div className="flex bg-card border border-border rounded-xl overflow-hidden hover:border-secondary/50 transition-colors group">
                                        <div className="w-24 shrink-0 bg-muted relative">
                                            {highlights.recent.book.cover_url ? (
                                                <Image
                                                    src={highlights.recent.book.cover_url}
                                                    alt={highlights.recent.book.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-muted-foreground"><BookOpen /></div>
                                            )}
                                        </div>
                                        <div className="p-4 flex flex-col justify-between flex-1">
                                            <div>
                                                <h3 className="font-bold line-clamp-1 group-hover:text-secondary transition-colors">{highlights.recent.book.title}</h3>
                                                <div className="flex items-center gap-1 text-yellow-500 my-1">
                                                    <Star size={12} fill="currentColor" />
                                                    <span className="text-xs font-medium">{highlights.recent.book.rating}/5</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2">{highlights.recent.book.notes || "No notes added."}</p>
                                            </div>
                                            <Link href="/books" className="text-xs text-secondary mt-2 flex items-center gap-1 hover:underline">
                                                Read more <ArrowRight size={10} />
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-32 rounded-xl border border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground text-sm">
                                        No books logged yet.
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    {/* Up Next (Planning) */}
                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ textShadow: "0 0 10px rgba(0, 255, 204, 0.3)" }}>
                            <span className="text-[#00FFCC]">The Next Chapter</span>
                        </h2>
                        {loading && !highlights ? (
                            <div className="h-24 rounded-xl bg-muted/20 animate-pulse" />
                        ) : (
                            <div className="bg-card border border-border rounded-xl p-4">
                                {highlights?.planning && highlights.planning.length > 0 ? (
                                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                        {highlights.planning.map((item: any) => (
                                            <div key={item.id} className="min-w-[200px] p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {item.type === 'movie' ? <Film size={14} className="text-primary" /> : <BookOpen size={14} className="text-secondary" />}
                                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Planning</span>
                                                </div>
                                                <h4 className="font-medium text-sm line-clamp-1 mb-1">{item.title}</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    Added {new Date(item.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        ))}
                                        <Link href="/movies" className="min-w-[100px] flex flex-col items-center justify-center text-muted-foreground hover:text-foreground text-xs font-medium p-3 rounded-lg border border-dashed border-border hover:bg-muted/30 transition-colors">
                                            View All
                                        </Link>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">Nothing in your planning list yet.</p>
                                )}
                            </div>
                        )}
                    </section>
                </motion.div>

                {/* Right Column (Flashback) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ textShadow: "0 0 10px rgba(0, 255, 204, 0.3)" }}>
                        <span className="text-[#00FFCC]">A Moment in Time</span>
                    </h2>

                    {loading && !highlights ? (
                        <div className="h-80 rounded-xl bg-muted/20 animate-pulse" />
                    ) : highlights?.flashback ? (
                        <div className="relative h-[400px] rounded-2xl overflow-hidden group">
                            {highlights.flashback.photo_url ? (
                                <Image
                                    src={highlights.flashback.photo_url}
                                    alt={highlights.flashback.location_name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-chart-3/20 flex items-center justify-center">
                                    <MapPin size={48} className="text-chart-3 opacity-50" />
                                </div>
                            )}

                            {/* Glassmorphism Overlay */}
                            <div className="absolute inset-x-4 bottom-4 p-4 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white shadow-xl">
                                <div className="flex items-center gap-2 mb-1 text-white/80">
                                    <MapPin size={14} />
                                    <span className="text-xs font-medium uppercase tracking-wider">Flashback</span>
                                </div>
                                <h3 className="text-xl font-bold mb-2">{highlights.flashback.location_name}</h3>
                                {highlights.flashback.visit_date && (
                                    <p className="text-xs mb-2 opacity-80">{new Date(highlights.flashback.visit_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</p>
                                )}
                                <p className="text-sm line-clamp-3 opacity-90 leading-relaxed">
                                    "{highlights.flashback.notes || 'No notes for this trip.'}"
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-80 rounded-2xl border border-dashed border-border bg-card flex flex-col items-center justify-center p-6 text-center">
                            <MapPin size={32} className="text-muted-foreground mb-4" />
                            <p className="font-medium text-foreground">No travels logged yet</p>
                            <p className="text-sm text-muted-foreground mt-2">Log a trip to see flashbacks here.</p>
                            <button className="mt-4 px-4 py-2 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                                Log your first trip
                            </button>
                        </div>
                    )}
                </motion.div>
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
