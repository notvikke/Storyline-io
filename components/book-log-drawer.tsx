"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { BookOpen, Search, Star, X, Loader2 } from "lucide-react";
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
}

export function BookLogDrawer({ open, onOpenChange, onSuccess }: BookLogDrawerProps) {
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
            const response = await fetch("/api/book-logs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: user.id,
                    isbn: selectedBook.isbn,
                    title: selectedBook.title,
                    author: selectedBook.author,
                    publish_year: selectedBook.publishYear,
                    cover_url: selectedBook.coverUrl,
                    page_count: selectedBook.pageCount,
                    rating: rating || null,
                    notes: notes || null,
                    started_date: startedDate || null,
                    finished_date: finishedDate,
                }),
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
                        Log a Book
                    </DrawerTitle>
                    <DrawerDescription>
                        Search for a book and add it to your reading list
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
                                    <button
                                        onClick={() => setSelectedBook(null)}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Rating */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Your Rating
                                    </label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setRating(star)}
                                                className="transition-all"
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
                                <div>
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
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Finished Reading
                                    </label>
                                    <Input
                                        type="date"
                                        value={finishedDate}
                                        onChange={(e) => setFinishedDate(e.target.value)}
                                    />
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Your thoughts about this book..."
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
                            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={20} />
                                    Saving...
                                </>
                            ) : (
                                "Save Book"
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
