"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Film, Search, Star, X, Loader2 } from "lucide-react";
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
}

export function MovieLogDrawer({ open, onOpenChange, onSuccess }: MovieLogDrawerProps) {
    const { user } = useUser();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<MovieSearchResult[]>([]);
    const [selectedMovie, setSelectedMovie] = useState<MovieDetails | null>(null);
    const [rating, setRating] = useState(0);
    const [notes, setNotes] = useState("");
    const [watchedDate, setWatchedDate] = useState(new Date().toISOString().split("T")[0]);
    const [searching, setSearching] = useState(false);
    const [saving, setSaving] = useState(false);

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
            const response = await fetch("/api/movie-logs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: user.id,
                    imdb_id: selectedMovie.imdbID,
                    title: selectedMovie.Title,
                    year: selectedMovie.Year,
                    director: selectedMovie.Director,
                    genre: selectedMovie.Genre,
                    poster_url: selectedMovie.Poster !== "N/A" ? selectedMovie.Poster : null,
                    plot: selectedMovie.Plot,
                    rating: rating || null,
                    notes: notes || null,
                    watched_date: watchedDate,
                }),
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
                        Log a Movie
                    </DrawerTitle>
                    <DrawerDescription>
                        Search for a movie and add it to your collection
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
                                        <p className="text-sm text-muted-foreground">
                                            Director: {selectedMovie.Director}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Genre: {selectedMovie.Genre}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedMovie(null)}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <p className="text-sm">{selectedMovie.Plot}</p>

                                {/* Rating */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Your Rating</label>
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
                                                            ? "fill-primary text-primary"
                                                            : "text-muted-foreground"
                                                    }
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Watched Date */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Watched Date</label>
                                    <Input
                                        type="date"
                                        value={watchedDate}
                                        onChange={(e) => setWatchedDate(e.target.value)}
                                    />
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Your thoughts about this movie..."
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
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={20} />
                                    Saving...
                                </>
                            ) : (
                                "Save Movie"
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
