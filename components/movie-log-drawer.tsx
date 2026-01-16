"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Film, Search, Star, X, Loader2, Check, Clock } from "lucide-react";
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

interface MovieSearchResult {
    imdbID: string;
    Title: string;
    Year: string;
    Poster: string;
    Type: string;
}

interface MovieDetails {
    imdbID: string;
    Title: string;
    Year: string;
    Director: string;
    Genre: string;
    Plot: string;
    Poster: string;
}

interface MovieLogDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    editItem?: any; // For "Move to Completed" flow
}

export function MovieLogDrawer({ open, onOpenChange, onSuccess, editItem }: MovieLogDrawerProps) {
    const { user } = useUser();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<MovieSearchResult[]>([]);
    const [selectedMovie, setSelectedMovie] = useState<MovieDetails | null>(null);
    const [rating, setRating] = useState(0);
    const [notes, setNotes] = useState("");
    const [watchedDate, setWatchedDate] = useState(new Date().toISOString().split("T")[0]);
    const [searching, setSearching] = useState(false);
    const [saving, setSaving] = useState(false);

    // "completed" vs "planning"
    const [status, setStatus] = useState<"completed" | "planning">("completed");

    // Initialize editing state
    useEffect(() => {
        if (open && editItem) {
            // We are likely moving from planning -> completed, so default to 'completed'
            // and pre-fill details
            setStatus("completed");
            setSelectedMovie({
                imdbID: editItem.imdb_id || "",
                Title: editItem.title,
                Year: editItem.year || "",
                Director: editItem.director || "",
                Genre: editItem.genre || "",
                Plot: editItem.plot || "",
                Poster: editItem.poster_url || "",
            });
            setNotes(editItem.notes || "");
            if (editItem.rating) setRating(editItem.rating);
            if (editItem.watched_date) setWatchedDate(editItem.watched_date);
            else setWatchedDate(new Date().toISOString().split("T")[0]);
        } else if (open) {
            // Reset for new log
            setStatus("completed");
            setSearchResults([]);
            setSelectedMovie(null);
            setRating(0);
            setNotes("");
            setSearchQuery("");
            setWatchedDate(new Date().toISOString().split("T")[0]);
        }
    }, [open, editItem]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        try {
            const response = await fetch(`/api/movies/search?s=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();

            if (data.Search) {
                setSearchResults(data.Search);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setSearching(false);
        }
    };

    const handleSelectMovie = async (imdbID: string) => {
        try {
            const response = await fetch(`/api/movies/search?i=${imdbID}`);
            const data = await response.json();
            setSelectedMovie(data);
            setSearchResults([]);
        } catch (error) {
            console.error("Fetch movie details error:", error);
        }
    };

    const handleSave = async () => {
        if (!user?.id || !selectedMovie) return;

        setSaving(true);
        try {
            const payload = {
                user_id: user.id,
                imdb_id: selectedMovie.imdbID,
                title: selectedMovie.Title,
                year: selectedMovie.Year,
                director: selectedMovie.Director,
                genre: selectedMovie.Genre,
                poster_url: selectedMovie.Poster !== "N/A" ? selectedMovie.Poster : null,
                plot: selectedMovie.Plot,
                rating: status === "completed" ? (rating || null) : null,
                notes: notes || null,
                watched_date: status === "completed" ? watchedDate : null,
                status: status,
            };

            const url = "/api/movie-logs";
            const method = editItem ? "PATCH" : "POST";
            const body = editItem ? JSON.stringify({ ...payload, id: editItem.id }) : JSON.stringify(payload);

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to save movie");
            }

            // Reset and close
            setSelectedMovie(null);
            setRating(0);
            setNotes("");
            setSearchQuery("");
            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            console.error("Save error details:", error);
            alert(`Failed to save movie: ${error?.message || "Unknown error"}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="max-h-[90vh]">
                <DrawerHeader>
                    <DrawerTitle className="flex items-center gap-2">
                        <Film className="text-primary" size={24} />
                        {editItem ? "Complete Your Journey" : "Log a Movie"}
                    </DrawerTitle>
                    <DrawerDescription>
                        {editItem ? "Rate and review this movie to add it to your watched list." : "Search for a movie and add it to your collection"}
                    </DrawerDescription>
                </DrawerHeader>

                <div className="px-4 pb-4 overflow-y-auto">
                    {!selectedMovie ? (
                        <>
                            {/* Search Section */}
                            <div className="flex gap-2 mb-4">
                                <Input
                                    placeholder="Search for a movie..."
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
                                {searchResults.map((movie) => (
                                    <div
                                        key={movie.imdbID}
                                        onClick={() => handleSelectMovie(movie.imdbID)}
                                        className="flex gap-3 p-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-all"
                                    >
                                        {movie.Poster !== "N/A" ? (
                                            <img
                                                src={movie.Poster}
                                                alt={movie.Title}
                                                className="w-12 h-16 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                                                <Film size={20} className="text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="font-semibold">{movie.Title}</p>
                                            <p className="text-sm text-muted-foreground">{movie.Year}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Selected Movie Details */}
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    {selectedMovie.Poster !== "N/A" && (
                                        <img
                                            src={selectedMovie.Poster}
                                            alt={selectedMovie.Title}
                                            className="w-24 h-36 object-cover rounded-lg"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold">{selectedMovie.Title}</h3>
                                        <p className="text-muted-foreground">{selectedMovie.Year}</p>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {selectedMovie.Director} • {selectedMovie.Genre}
                                        </p>
                                    </div>
                                    {!editItem && (
                                        <button
                                            onClick={() => setSelectedMovie(null)}
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
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Check size={16} />
                                        Watched
                                    </button>
                                    <button
                                        onClick={() => setStatus("planning")}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all",
                                            status === "planning"
                                                ? "bg-primary text-primary-foreground shadow-sm"
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
                                            <label className="block text-sm font-medium mb-2">Your Rating</label>
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
                                                                    ? "fill-primary text-primary"
                                                                    : "text-muted-foreground"
                                                            }
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Watched Date */}
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300 delay-75">
                                            <label className="block text-sm font-medium mb-2">Watched Date</label>
                                            <Input
                                                type="date"
                                                value={watchedDate}
                                                onChange={(e) => setWatchedDate(e.target.value)}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Notes */}
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300 delay-100">
                                    <label className="block text-sm font-medium mb-2">
                                        {status === "planning" ? "Why do you want to watch this?" : "Notes (Optional)"}
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder={status === "planning" ? "Heard it's great because..." : "Your thoughts..."}
                                        className="w-full h-24 px-3 py-2 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <DrawerFooter>
                    {selectedMovie && (
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
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
