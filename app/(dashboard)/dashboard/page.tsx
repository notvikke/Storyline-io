"use client";

import { useUser } from "@clerk/nextjs";
import { Film, BookOpen, MapPin, Calendar, Loader2, ArrowRight, Star, Tv } from "lucide-react";
import { useEffect, useState } from "react";
import { MovieLogDrawer } from "@/components/movie-log-drawer";
import { BookLogDrawer } from "@/components/book-log-drawer";
import { TravelLogDrawer } from "@/components/travel-log-drawer";
import { TvLogDrawer } from "@/components/tv-log-drawer";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { FriendsModal } from "@/components/social/friends-modal";
import { ProfileEditModal } from "@/components/social/edit-profile-modal";
import { getPendingRequests } from "@/actions/social";

interface Stats {
    moviesCount: number;
    booksCount: number;
    travelsCount: number;
    tvCount: number;
    totalMemories: number;
}

interface DashboardHighlights {
    recent: {
        movie: any | null;
        book: any | null;
        tv: any | null;
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
    const [travelDrawerOpen, setTravelDrawerOpen] = useState(false);
    const [tvDrawerOpen, setTvDrawerOpen] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [friendsModalOpen, setFriendsModalOpen] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

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
            if (user?.id) {
                fetchData();
                fetchProfile();
                fetchPendingRequests();
            } else {
                setLoading(false);
            }
        }
    }, [isLoaded, user?.id]);

    const fetchPendingRequests = async () => {
        const res = await getPendingRequests();
        if (res.success && res.data) {
            setPendingCount(res.data.length);
        }
    };

    const handleMovieSuccess = () => fetchData();
    const handleBookSuccess = () => fetchData();
    const handleTravelSuccess = () => fetchData();
    const handleTvSuccess = () => fetchData();

    const fetchProfile = async () => {
        if (!user?.id) return;
        try {
            const { data } = await supabase
                .from("profiles")
                .select("username")
                .eq("id", user.id)
                .single();
            setUserProfile(data);
        } catch {
            setUserProfile(null);
        }
    };

    const statsCards = [
        { label: "Movies Watched", value: stats?.moviesCount ?? 0, icon: Film, color: "text-primary" },
        { label: "TV Shows", value: stats?.tvCount ?? 0, icon: Tv, color: "text-primary" },
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
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent border border-primary/20 p-6 md:p-8"
            >
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="relative z-10">
                    <h1 className="text-2xl md:text-4xl font-bold mb-2">
                        Welcome back, {user?.firstName || "Explorer"}! 👋
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-lg">
                        Track your journey through movies, books, and travel experiences.
                    </p>
                </div>
            </motion.div>

            {/* Quick Actions - Moved to top for utility */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="rounded-xl bg-card border border-border p-4 md:p-6 shadow-sm"
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <motion.button
                        variants={item}
                        onClick={() => setMovieDrawerOpen(true)}
                        className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all duration-200 text-left group"
                    >
                        <Film className="text-primary group-hover:scale-110 transition-transform" size={24} />
                        <div>
                            <p className="font-semibold">Log Movie</p>
                            <p className="text-xs text-muted-foreground">Add watch</p>
                        </div>
                    </motion.button>
                    <motion.button
                        variants={item}
                        onClick={() => setTvDrawerOpen(true)}
                        className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all duration-200 text-left group"
                    >
                        <Tv className="text-primary group-hover:scale-110 transition-transform" size={24} />
                        <div>
                            <p className="font-semibold">Log TV</p>
                            <p className="text-xs text-muted-foreground">Track series</p>
                        </div>
                    </motion.button>
                    <motion.button
                        variants={item}
                        onClick={() => setBookDrawerOpen(true)}
                        className="flex items-center gap-3 p-4 rounded-lg bg-secondary/10 border border-secondary/30 hover:bg-secondary/20 transition-all duration-200 text-left group"
                    >
                        <BookOpen className="text-secondary group-hover:scale-110 transition-transform" size={24} />
                        <div>
                            <p className="font-semibold">Log Book</p>
                            <p className="text-xs text-muted-foreground">Track read</p>
                        </div>
                    </motion.button>
                    <motion.button
                        variants={item}
                        onClick={() => setTravelDrawerOpen(true)}
                        className="flex items-center gap-3 p-4 rounded-lg bg-chart-3/10 border border-chart-3/30 hover:bg-chart-3/20 transition-all duration-200 text-left group"
                    >
                        <MapPin className="text-chart-3 group-hover:scale-110 transition-transform" size={24} />
                        <div>
                            <p className="font-semibold">Log Trip</p>
                            <p className="text-xs text-muted-foreground">Add travel</p>
                        </div>
                    </motion.button>
                </div>
            </motion.div>

            {/* Social Connections Section */}
            <motion.div
                variants={container}
                animate="visible"
                className="mb-8"
            >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="text-[#FF7EB6]">●</span> Social Connections
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* My Profile Card */}
                    {userProfile ? (
                        <Link href={`/u/${userProfile.username}`}>
                            <motion.div
                                variants={item}
                                className="flex items-center gap-4 p-6 rounded-xl bg-[#0a0a0a] bg-purple-900/5 border border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-900/10 transition-all duration-300 text-left group cursor-pointer h-full shadow-lg hover:shadow-purple-500/10"
                            >
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform shadow-lg">
                                    {user?.firstName?.[0] || "U"}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-lg bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">My Profile</p>
                                    <p className="text-sm text-muted-foreground">View your public page</p>
                                </div>
                                <svg
                                    className="w-5 h-5 text-purple-500/50 group-hover:text-purple-500 group-hover:translate-x-1 transition-all"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </motion.div>
                        </Link>
                    ) : (
                        <motion.button
                            variants={item}
                            onClick={() => setProfileModalOpen(true)}
                            className="flex items-center gap-4 p-6 rounded-xl bg-[#0a0a0a] bg-purple-900/5 border border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-900/10 transition-all duration-300 text-left group h-full shadow-lg hover:shadow-purple-500/10"
                        >
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform shadow-lg">
                                +
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-lg bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Create Profile</p>
                                <p className="text-sm text-muted-foreground">Build your public page</p>
                            </div>
                            <svg
                                className="w-5 h-5 text-purple-500/50 group-hover:text-purple-500 group-hover:translate-x-1 transition-all"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </motion.button>
                    )}

                    {/* Friends Card */}
                    <motion.button
                        variants={item}
                        onClick={() => setFriendsModalOpen(true)}
                        className="flex items-center gap-4 p-6 rounded-xl bg-[#0a0a0a] bg-purple-900/5 border border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-900/10 transition-all duration-300 text-left group relative h-full shadow-lg hover:shadow-purple-500/10"
                    >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform shadow-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        {/* Notification Dot */}
                        {pendingCount > 0 && (
                            <div className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
                        )}
                        <div className="flex-1">
                            <p className="font-bold text-lg bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Friends</p>
                            <p className="text-sm text-muted-foreground">Manage connections</p>
                        </div>
                        <svg
                            className="w-5 h-5 text-purple-500/50 group-hover:text-purple-500 group-hover:translate-x-1 transition-all"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </motion.button>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6"
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                {/* Recent Movie */}
                                {highlights?.recent.movie ? (
                                    <div className="flex bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors group">
                                        <div className="w-1/3 md:w-24 shrink-0 bg-muted relative aspect-[2/3]">
                                            {highlights.recent.movie.poster_url ? (
                                                <Image
                                                    src={highlights.recent.movie.poster_url}
                                                    alt={highlights.recent.movie.title}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 33vw, 100px"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-muted-foreground"><Film /></div>
                                            )}
                                        </div>
                                        <div className="p-3 md:p-4 flex flex-col justify-between flex-1 min-w-0">
                                            <div>
                                                <h3 className="font-bold line-clamp-1 group-hover:text-primary transition-colors text-sm md:text-base">{highlights.recent.movie.title}</h3>
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
                                        <div className="w-1/3 md:w-24 shrink-0 bg-muted relative aspect-[2/3]">
                                            {highlights.recent.book.cover_url ? (
                                                <Image
                                                    src={highlights.recent.book.cover_url}
                                                    alt={highlights.recent.book.title}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 33vw, 100px"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-muted-foreground"><BookOpen /></div>
                                            )}
                                        </div>
                                        <div className="p-3 md:p-4 flex flex-col justify-between flex-1 min-w-0">
                                            <div>
                                                <h3 className="font-bold line-clamp-1 group-hover:text-secondary transition-colors text-sm md:text-base">{highlights.recent.book.title}</h3>
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

                                {/* Recent TV Show */}
                                {highlights?.recent.tv ? (
                                    <div className="flex bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors group">
                                        <div className="w-1/3 md:w-20 shrink-0 bg-muted relative aspect-[2/3]">
                                            {highlights.recent.tv.poster_url ? (
                                                <Image
                                                    src={highlights.recent.tv.poster_url}
                                                    alt={highlights.recent.tv.title}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 33vw, 100px"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-muted-foreground"><Tv /></div>
                                            )}
                                        </div>
                                        <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
                                            <div>
                                                <h3 className="font-bold line-clamp-1 group-hover:text-primary transition-colors text-sm">{highlights.recent.tv.title}</h3>
                                                {highlights.recent.tv.rating && (
                                                    <div className="flex items-center gap-1 text-yellow-500 my-1">
                                                        <Star size={12} fill="currentColor" />
                                                        <span className="text-xs font-medium">{highlights.recent.tv.rating}/5</span>
                                                    </div>
                                                )}
                                                <p className="text-xs text-muted-foreground line-clamp-2">{highlights.recent.tv.notes || "No notes added."}</p>
                                            </div>
                                            <Link href="/tv" className="text-xs text-primary mt-2 flex items-center gap-1 hover:underline">
                                                Read more <ArrowRight size={10} />
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-32 rounded-xl border border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground text-sm">
                                        No shows logged yet.
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
                                                    {item.type === 'movie' && <Film size={14} className="text-primary" />}
                                                    {item.type === 'book' && <BookOpen size={14} className="text-secondary" />}
                                                    {item.type === 'tv' && <Tv size={14} className="text-primary" />}
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
                        <div className={`relative ${highlights.flashback.photo_url ? 'h-[400px]' : 'h-auto bg-card border border-border'} rounded-2xl overflow-hidden group`}>
                            {highlights.flashback.photo_url ? (
                                <>
                                    <Image
                                        src={highlights.flashback.photo_url}
                                        alt={highlights.flashback.location_name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
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
                                </>
                            ) : (
                                <div className="p-6 flex flex-col justify-center h-full">
                                    <div className="flex items-center gap-2 mb-4 text-chart-3">
                                        <div className="p-2 rounded-full bg-chart-3/10">
                                            <MapPin size={20} />
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wider">Flashback</span>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">{highlights.flashback.location_name}</h3>
                                    {highlights.flashback.visit_date && (
                                        <p className="text-sm text-muted-foreground mb-4">{new Date(highlights.flashback.visit_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</p>
                                    )}
                                    <div className="relative pl-4 border-l-2 border-chart-3/30 py-1">
                                        <p className="text-base italic text-muted-foreground leading-relaxed">
                                            "{highlights.flashback.notes || 'No notes for this trip.'}"
                                        </p>
                                    </div>
                                </div>
                            )}
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
            <TravelLogDrawer
                open={travelDrawerOpen}
                onOpenChange={setTravelDrawerOpen}
                onSuccess={handleTravelSuccess}
            />
            <TvLogDrawer
                open={tvDrawerOpen}
                onOpenChange={setTvDrawerOpen}
                onSuccess={handleTvSuccess}
            />
            <FriendsModal
                open={friendsModalOpen}
                onOpenChange={setFriendsModalOpen}
            />
            <ProfileEditModal
                open={profileModalOpen}
                onOpenChange={setProfileModalOpen}
                profile={null}
                onSuccess={fetchProfile}
            />
        </div>
    );
}
