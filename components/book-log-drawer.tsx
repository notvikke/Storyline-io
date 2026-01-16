"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { BookOpen, Search, Star, X, Loader2, Check, Clock } from "lucide-react";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BookSearchResult {
    isbn: string | null;
    title: string;
    author: string;
    publishYear: string | null;
    coverUrl: string | null;
    pageCount: number | null;
    key: string;
}

interface BookLogDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    editItem?: any;
}

export function BookLogDrawer({ open, onOpenChange, onSuccess, editItem }: BookLogDrawerProps) {
    const { user } = useUser();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
    const [selectedBook, setSelectedBook] = useState<BookSearchResult | null>(null);
    const [rating, setRating] = useState(0);
    const [notes, setNotes] = useState("");
    const [startedDate, setStartedDate] = useState("");
    const [finishedDate, setFinishedDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [searching, setSearching] = useState(false);
    const [saving, setSaving] = useState(false);

    // "completed" vs "planning"
    const [status, setStatus] = useState<"completed" | "planning">("completed");

    // Initialize editing state
    useEffect(() => {
        if (open && editItem) {
            setStatus("completed");
            setSelectedBook({
                isbn: editItem.isbn,
                title: editItem.title,
                author: editItem.author,
                publishYear: editItem.publish_year,
                coverUrl: editItem.cover_url,
                pageCount: editItem.page_count,
                key: editItem.id // Just for internal key
            });
            setNotes(editItem.notes || "");
            if (editItem.rating) setRating(editItem.rating);
            if (editItem.started_date) setStartedDate(editItem.started_date);
            if (editItem.finished_date) setFinishedDate(editItem.finished_date);
            else setFinishedDate(new Date().toISOString().split("T")[0]);
        } else if (open) {
            setStatus("completed");
            setSearchResults([]);
            setSelectedBook(null);
            setRating(0);
            setNotes("");
            setSearchQuery("");
            setStartedDate("");
            setFinishedDate(new Date().toISOString().split("T")[0]);
        }
    }, [open, editItem]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        try {
            const response = await fetch(
                `/api/books/search?q=${encodeURIComponent(searchQuery)}`
            );
            const data = await response.json();

            if (data.books) {
                setSearchResults(data.books);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setSearching(false);
        }
    };

    const handleSelectBook = (book: BookSearchResult) => {
        setSelectedBook(book);
        setSearchResults([]);
    };

    const handleSave = async () => {
        if (!user?.id || !selectedBook) return;

        setSaving(true);
        try {
            const payload = {
                user_id: user.id,
                isbn: selectedBook.isbn,
                title: selectedBook.title,
                author: selectedBook.author,
                publish_year: selectedBook.publishYear,
                cover_url: selectedBook.coverUrl,
                page_count: selectedBook.pageCount,
                rating: status === "completed" ? (rating || null) : null,
                notes: notes || null,
                started_date: status === "completed" ? (startedDate || null) : null,
                finished_date: status === "completed" ? finishedDate : null,
                status: status,
            };

            const url = "/api/book-logs";
            const method = editItem ? "PATCH" : "POST";
            const body = editItem ? JSON.stringify({ ...payload, id: editItem.id }) : JSON.stringify(payload);

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to save book");
            }

            // Reset and close
            setSelectedBook(null);
            setRating(0);
            setNotes("");
            setStartedDate("");
            setSearchQuery("");
            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            console.error("Save error details:", error);
            alert(`Failed to save book: ${error?.message || "Unknown error"}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="max-h-[90vh]">
                <DrawerHeader>
                    <DrawerTitle className="flex items-center gap-2">
                        <BookOpen className="text-secondary" size={24} />
                        {editItem ? "Complete Your Journey" : "Log a Book"}
                    </DrawerTitle>
                    <DrawerDescription>
                        {editItem ? "Rate and review this book to add it to your finished list." : "Search for a book and add it to your reading list"}
                    </DrawerDescription>
                </DrawerHeader>

                <div className="px-4 pb-4 overflow-y-auto">
                    {!selectedBook ? (
                        <>
                            {/* Search Section */}
                            <div className="flex gap-2 mb-4">
                                <Input
                                    placeholder="Search for a book..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="flex-1"
                                />
                                <Button onClick={handleSearch} disabled={searching}>
                                    {searching ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <Search size={20} />
                                    )}
                                </Button>
                            </div>

                            {/* Search Results */}
                            <div className="space-y-2">
                                {searchResults.map((book, index) => (
                                    <div
                                        key={book.key || index}
                                        onClick={() => handleSelectBook(book)}
                                        className="flex gap-3 p-3 rounded-lg border border-border hover:border-secondary/50 cursor-pointer transition-all"
                                    >
                                        {book.coverUrl ? (
                                            <img
                                                src={book.coverUrl}
                                                alt={book.title}
                                                className="w-12 h-16 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                                                <BookOpen size={20} className="text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="font-semibold">{book.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {book.author}
                                            </p>
                                            {book.publishYear && (
                                                <p className="text-xs text-muted-foreground">
                                                    {book.publishYear}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Selected Book Details */}
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    {selectedBook.coverUrl && (
                                        <img
                                            src={selectedBook.coverUrl}
                                            alt={selectedBook.title}
                                            className="w-24 h-36 object-cover rounded-lg"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold">{selectedBook.title}</h3>
                                        <p className="text-muted-foreground">{selectedBook.author}</p>
                                        {selectedBook.publishYear && (
                                            <p className="text-sm text-muted-foreground">
                                                Published: {selectedBook.publishYear}
                                            </p>
                                        )}
                                        {selectedBook.pageCount && (
                                            <p className="text-sm text-muted-foreground">
                                                {selectedBook.pageCount} pages
                                            </p>
                                        )}
                                    </div>
                                    {!editItem && (
                                        <button
                                            onClick={() => setSelectedBook(null)}
                                            className="text-muted-foreground hover:text-foreground h-fit"
                                        >
                                            <X size={20} />
                                        </button>
                                    )}
                                </div>

                                {/* Status Selection (Tabs) */}
                                <div className="flex p-1 bg-muted rounded-lg">
                                    <button
                                        onClick={() => setStatus("completed")}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all",
                                            status === "completed"
                                                ? "bg-secondary text-secondary-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Check size={16} />
                                        Read
                                    </button>
                                    <button
                                        onClick={() => setStatus("planning")}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all",
                                            status === "planning"
                                                ? "bg-secondary text-secondary-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Clock size={16} />
                                        Planning
                                    </button>
                                </div>

                                {status === "completed" && (
                                    <>
                                        {/* Rating */}
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label className="block text-sm font-medium mb-2">
                                                Your Rating
                                            </label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        onClick={() => setRating(star)}
                                                        className="transition-all hover:scale-110"
                                                    >
                                                        <Star
                                                            size={28}
                                                            className={
                                                                star <= rating
                                                                    ? "fill-secondary text-secondary"
                                                                    : "text-muted-foreground"
                                                            }
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Started Date */}
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300 delay-75">
                                            <label className="block text-sm font-medium mb-2">
                                                Started Reading (Optional)
                                            </label>
                                            <Input
                                                type="date"
                                                value={startedDate}
                                                onChange={(e) => setStartedDate(e.target.value)}
                                            />
                                        </div>

                                        {/* Finished Date */}
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300 delay-100">
                                            <label className="block text-sm font-medium mb-2">
                                                Finished Reading
                                            </label>
                                            <Input
                                                type="date"
                                                value={finishedDate}
                                                onChange={(e) => setFinishedDate(e.target.value)}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Notes */}
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300 delay-100">
                                    <label className="block text-sm font-medium mb-2">
                                        {status === "planning" ? "Why do you want to read this?" : "Notes (Optional)"}
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder={status === "planning" ? "Highly recommended by..." : "Your thoughts about this book..."}
                                        className="w-full h-24 px-3 py-2 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-secondary"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <DrawerFooter>
                    {selectedBook && (
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={20} />
                                    Saving...
                                </>
                            ) : (
                                status === "completed" ? "Add to My Journey" : "Add to Planning"
                            )}
                        </Button>
                    )}
                    <DrawerClose asChild>
                        <Button variant="outline" className="w-full">
                            Cancel
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
