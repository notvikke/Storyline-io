"use client";

import { useUser } from "@clerk/nextjs";
import { BookOpen, Star, Plus, Loader2, Trash2, SlidersHorizontal } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { BookLogDrawer } from "@/components/book-log-drawer";
import type { Database } from "@/lib/supabase/database.types";

type BookLog = Database["public"]["Tables"]["book_logs"]["Row"];

export default function BooksPage() {
    const { user, isLoaded } = useUser();
    const [books, setBooks] = useState<BookLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Filter & Sort states
    const [filterRating, setFilterRating] = useState<number | "all">("all");
    const [filterYear, setFilterYear] = useState<string | "all">("all");
    const [filterMonth, setFilterMonth] = useState<string | "all">("all");
    const [sortBy, setSortBy] = useState<"date" | "rating" | "title">("date");
    const [showFilters, setShowFilters] = useState(false);

    const fetchBooks = async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const response = await fetch("/api/book-logs");
            if (!response.ok) throw new Error("Failed to fetch books");
            const data = await response.json();
            setBooks(data);
        } catch (error) {
            console.error("Error fetching books:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded) {
            if (user?.id) {
                fetchBooks();
            } else {
                setLoading(false);
            }
        }
    }, [isLoaded, user?.id]);

    // Get unique years and months (using finished_date)
    const availableYears = useMemo(() => {
        const years = new Set(books.map(b => new Date(b.finished_date || "").getFullYear()));
        return Array.from(years).filter(y => !isNaN(y)).sort((a, b) => b - a);
    }, [books]);

    const availableMonths = useMemo(() => {
        const months = new Set(
            books.map(b => {
                const date = new Date(b.finished_date || "");
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            })
        );
        return Array.from(months).filter(m => !m.includes("NaN")).sort().reverse();
    }, [books]);

    // Filtered and sorted books
    const filteredBooks = useMemo(() => {
        let filtered = [...books];

        // Filter by rating
        if (filterRating !== "all") {
            filtered = filtered.filter(b => b.rating === filterRating);
        }

        // Filter by year
        if (filterYear !== "all") {
            filtered = filtered.filter(b =>
                new Date(b.finished_date || "").getFullYear() === parseInt(filterYear)
            );
        }

        // Filter by month
        if (filterMonth !== "all") {
            filtered = filtered.filter(b => {
                const date = new Date(b.finished_date || "");
                const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                return monthStr === filterMonth;
            });
        }

        // Sort
        filtered.sort((a, b) => {
            if (sortBy === "date") {
                return new Date(b.finished_date || "").getTime() - new Date(a.finished_date || "").getTime();
            } else if (sortBy === "rating") {
                return (b.rating || 0) - (a.rating || 0);
            } else {
                return a.title.localeCompare(b.title);
            }
        });

        return filtered;
    }, [books, filterRating, filterYear, filterMonth, sortBy]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this book?")) return;

        try {
            const response = await fetch(`/api/book-logs?id=${id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete book");
            fetchBooks();
        } catch (error) {
            console.error("Error deleting book:", error);
            alert("Failed to delete book");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <BookOpen className="text-secondary" size={40} />
                    <div>
                        <h1 className="text-4xl font-bold">Books</h1>
                        <p className="text-muted-foreground">
                            Chronicle your reading adventures • {filteredBooks.length} book{filteredBooks.length !== 1 ? "s" : ""}
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
                        className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/30"
                    >
                        <Plus size={20} />
                        Log Book
                    </button>
                </div>
            </div>

            {/* Filters & Sort Panel */}
            {showFilters && books.length > 0 && (
                <div className="p-4 rounded-xl bg-card border border-border space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Sort By */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as "date" | "rating" | "title")}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                            >
                                <option value="date">Date Finishied</option>
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
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
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
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
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
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
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
                            className="text-sm text-secondary hover:underline"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            )}

            {/* Books Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-secondary" size={40} />
                </div>
            ) : books.length === 0 ? (
                <div className="text-center py-20 rounded-xl bg-card border border-border">
                    <BookOpen className="mx-auto text-muted-foreground mb-4" size={64} />
                    <h3 className="text-xl font-semibold mb-2">No books logged yet</h3>
                    <p className="text-muted-foreground mb-6">
                        Start tracking your reading journey
                    </p>
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90"
                    >
                        Log Your First Book
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBooks.map((book) => (
                        <div
                            key={book.id}
                            className="group relative overflow-hidden rounded-xl bg-card border border-border hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/10"
                        >
                            {/* Cover */}
                            {book.cover_url ? (
                                <img
                                    src={book.cover_url}
                                    alt={book.title}
                                    className="w-full h-64 object-cover"
                                />
                            ) : (
                                <div className="w-full h-64 bg-muted flex items-center justify-center">
                                    <BookOpen size={48} className="text-muted-foreground" />
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-4 space-y-2">
                                <h3 className="text-lg font-bold line-clamp-1">{book.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {book.author || "Unknown Author"}
                                </p>
                                {book.publish_year && (
                                    <p className="text-xs text-muted-foreground">
                                        Published: {book.publish_year}
                                    </p>
                                )}

                                {/* Rating */}
                                {book.rating && (
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={16}
                                                className={
                                                    i < book.rating!
                                                        ? "fill-secondary text-secondary"
                                                        : "text-muted-foreground"
                                                }
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Notes */}
                                {book.notes && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {book.notes}
                                    </p>
                                )}

                                {/* Reading Dates */}
                                <div className="text-xs text-muted-foreground">
                                    {book.started_date && (
                                        <p>Started: {new Date(book.started_date).toLocaleDateString()}</p>
                                    )}
                                    {book.finished_date && (
                                        <p>Finished: {new Date(book.finished_date).toLocaleDateString()}</p>
                                    )}
                                </div>

                                {/* Delete Button */}
                                <button
                                    onClick={() => handleDelete(book.id)}
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
            <BookLogDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                onSuccess={fetchBooks}
            />
        </div>
    );
}
