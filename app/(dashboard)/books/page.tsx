"use client";

import { useUser } from "@clerk/nextjs";
import { BookOpen, Star, Plus, Loader2, Trash2, SlidersHorizontal, Check, Calendar } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { BookLogDrawer } from "@/components/book-log-drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Database } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

type BookLog = Database["public"]["Tables"]["book_logs"]["Row"];

export default function BooksPage() {
    const { user, isLoaded } = useUser();
    const [books, setBooks] = useState<BookLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editItem, setEditItem] = useState<BookLog | undefined>(undefined);

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

    const handleComplete = (book: BookLog) => {
        setEditItem(book);
        setDrawerOpen(true);
    };

    const handleDrawerOpenChange = (open: boolean) => {
        setDrawerOpen(open);
        if (!open) setEditItem(undefined);
    };

    // Get unique years and months (using finished_date) from COMPLETED only
    const completedBooks = useMemo(() => books.filter(b => b.status === "completed"), [books]);

    const availableYears = useMemo(() => {
        const years = new Set(
            completedBooks
                .map(b => b.finished_date ? new Date(b.finished_date).getFullYear() : NaN)
                .filter(y => !isNaN(y))
        );
        return Array.from(years).sort((a, b) => b - a);
    }, [completedBooks]);

    const availableMonths = useMemo(() => {
        const months = new Set(
            completedBooks.map(b => {
                if (!b.finished_date) return "";
                const date = new Date(b.finished_date);
                if (isNaN(date.getTime())) return "";
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            })
        );
        return Array.from(months).filter(m => m !== "").sort().reverse();
    }, [completedBooks]);

    // Filtered and sorted books
    const getFilteredBooks = (list: BookLog[]) => {
        let filtered = [...list];

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
                const dateA = new Date(a.finished_date || a.created_at).getTime();
                const dateB = new Date(b.finished_date || b.created_at).getTime();
                return dateB - dateA;
            } else if (sortBy === "rating") {
                return (b.rating || 0) - (a.rating || 0);
            } else {
                return a.title.localeCompare(b.title);
            }
        });

        return filtered;
    };

    const journeyBooks = useMemo(() => getFilteredBooks(books.filter(b => b.status === "completed")), [books, filterRating, filterYear, filterMonth, sortBy]);
    const planningBooks = useMemo(() => getFilteredBooks(books.filter(b => b.status === "planning")), [books, filterRating, filterYear, filterMonth, sortBy]);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
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

    const BookGrid = ({ items, isPlanning = false }: { items: BookLog[], isPlanning?: boolean }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {items.map((book) => (
                <div
                    key={book.id}
                    className={cn(
                        "group relative overflow-hidden rounded-xl bg-card border border-border hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/10",
                        isPlanning && "opacity-80 hover:opacity-100"
                    )}
                >
                    {/* Cover */}
                    <div className="relative">
                        {book.cover_url ? (
                            <img
                                src={book.cover_url}
                                alt={book.title}
                                className={cn(
                                    "w-full h-64 object-cover transition-all duration-500",
                                    isPlanning && "grayscale-[0.5] group-hover:grayscale-0"
                                )}
                            />
                        ) : (
                            <div className="w-full h-64 bg-muted flex items-center justify-center">
                                <BookOpen size={48} className="text-muted-foreground" />
                            </div>
                        )}

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                        {/* Planning: Move to Completed Button */}
                        {isPlanning && (
                            <button
                                onClick={() => handleComplete(book)}
                                className="absolute bottom-4 right-4 p-3 bg-secondary text-secondary-foreground rounded-full shadow-lg hover:scale-110 transition-all active:scale-95 z-20"
                                title="Mark as Read"
                            >
                                <Check size={20} strokeWidth={3} />
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                        <div className="flex justify-between items-start gap-2">
                            <h3 className="text-lg font-bold line-clamp-1 leading-tight">{book.title}</h3>
                            {isPlanning && <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-muted rounded text-muted-foreground whitespace-nowrap">Planned</span>}
                        </div>

                        <p className="text-sm text-muted-foreground">
                            {book.author || "Unknown Author"}
                        </p>
                        {book.publish_year && (
                            <p className="text-xs text-muted-foreground">
                                Published: {book.publish_year}
                            </p>
                        )}

                        {!isPlanning && book.rating && (
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

                        {book.notes && (
                            <p className="text-sm text-muted-foreground line-clamp-2 italic">
                                "{book.notes}"
                            </p>
                        )}

                        <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 mt-2">
                            <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                {isPlanning
                                    ? `Added: ${new Date(book.created_at).toLocaleDateString()}`
                                    : `Finished: ${new Date(book.finished_date || "").toLocaleDateString()}`
                                }
                            </div>
                        </div>

                        {/* Delete Button */}
                        <button
                            onClick={(e) => handleDelete(book.id, e)}
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
                    <BookOpen className="text-secondary" size={40} />
                    <div>
                        <h1 className="text-4xl font-bold">Books</h1>
                        <p className="text-muted-foreground">
                            Chronicle your reading adventures
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setDrawerOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/30 w-full md:w-auto justify-center"
                >
                    <Plus size={20} />
                    Log Book
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-secondary" size={40} />
                </div>
            ) : (
                <Tabs defaultValue="journey" className="w-full">
                    <div className="flex items-center justify-between mb-6">
                        <TabsList className="bg-muted/50 p-1">
                            <TabsTrigger value="journey" className="px-6">My Journey ({books.filter(b => b.status === 'completed').length})</TabsTrigger>
                            <TabsTrigger value="planning" className="px-6">Planning ({books.filter(b => b.status === 'planning').length})</TabsTrigger>
                        </TabsList>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm",
                                showFilters ? "bg-secondary/20 text-secondary" : "bg-muted hover:bg-muted/80"
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
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
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
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
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
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
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
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
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
                        {journeyBooks.length === 0 ? (
                            <div className="text-center py-20 rounded-xl bg-card border border-border border-dashed">
                                <BookOpen className="mx-auto text-muted-foreground mb-4" size={48} />
                                <h3 className="text-xl font-semibold mb-2">Your journey is empty</h3>
                                <p className="text-muted-foreground">Start logging books you've read!</p>
                            </div>
                        ) : (
                            <BookGrid items={journeyBooks} />
                        )}
                    </TabsContent>

                    <TabsContent value="planning" className="space-y-6">
                        {planningBooks.length === 0 ? (
                            <div className="text-center py-20 rounded-xl bg-card border border-border border-dashed">
                                <Plus className="mx-auto text-muted-foreground mb-4" size={48} />
                                <h3 className="text-xl font-semibold mb-2">Nothing planned yet</h3>
                                <p className="text-muted-foreground">Search for books and add them to your reading list.</p>
                            </div>
                        ) : (
                            <BookGrid items={planningBooks} isPlanning={true} />
                        )}
                    </TabsContent>
                </Tabs>
            )}

            {/* Drawer */}
            <BookLogDrawer
                open={drawerOpen}
                onOpenChange={handleDrawerOpenChange}
                onSuccess={fetchBooks}
                editItem={editItem}
            />
        </div>
    );
}
