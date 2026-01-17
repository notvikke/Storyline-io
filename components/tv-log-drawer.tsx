"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Tv, Search, Star, X, Loader2, Check, Clock, PlayCircle } from "lucide-react";
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

interface TvSearchResult {
    imdbID: string;
    Title: string;
    Year: string;
    Poster: string;
    Type: string;
}

interface TvDetails {
    imdbID: string;
    Title: string;
    Year: string;
    Director: string;
    Genre: string;
    Plot: string;
    Poster: string;
}

interface TvLogDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    editItem?: any;
}

export function TvLogDrawer({ open, onOpenChange, onSuccess, editItem }: TvLogDrawerProps) {
    const { user } = useUser();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<TvSearchResult[]>([]);
    const [selectedShow, setSelectedShow] = useState<TvDetails | null>(null);
    const [rating, setRating] = useState(0);
    const [notes, setNotes] = useState("");
    const [status, setStatus] = useState<"completed" | "planning" | "watching">("watching");
    const [searching, setSearching] = useState(false);
    const [saving, setSaving] = useState(false);

    // Initialize editing state
    useEffect(() => {
        if (open && editItem) {
            setStatus(editItem.status || "completed");
            setSelectedShow({
                imdbID: editItem.imdb_id || "",
                Title: editItem.title,
                Year: "", // Not always available in simple edit
                Director: "",
                Genre: "",
                Plot: "",
                Poster: editItem.poster_url || "",
            });
            setNotes(editItem.notes || "");
            if (editItem.rating) setRating(editItem.rating);
        } else if (open) {
            // Reset for new log
            setStatus("watching");
            setSearchResults([]);
            setSelectedShow(null);
            setRating(0);
            setNotes("");
            setSearchQuery("");
        }
    }, [open, editItem]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        try {
            // Use type=series param
            const response = await fetch(`/api/movies/search?s=${encodeURIComponent(searchQuery)}&type=series`);
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

    const handleSelectShow = async (imdbID: string) => {
        try {
            // Reusing movies/search endpoint as it proxies to OMDb by ID which works for any type
            const response = await fetch(`/api/movies/search?i=${imdbID}`);
            const data = await response.json();
            setSelectedShow(data);
            setSearchResults([]);
        } catch (error) {
            console.error("Fetch show details error:", error);
        }
    };

    const handleSave = async () => {
        if (!user?.id || !selectedShow) return;

        setSaving(true);
        try {
            const payload = {
                user_id: user.id,
                imdb_id: selectedShow.imdbID,
                title: selectedShow.Title,
                poster_url: selectedShow.Poster !== "N/A" ? selectedShow.Poster : null,
                rating: status === "completed" ? (rating || null) : null,
                notes: notes || null,
                status: status,
            };

            const url = "/api/tv-logs";
            const method = editItem ? "PATCH" : "POST";
            const body = editItem ? JSON.stringify({ ...payload, id: editItem.id }) : JSON.stringify(payload);

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to save TV show");
            }

            // Reset and close
            setSelectedShow(null);
            setRating(0);
            setNotes("");
            setSearchQuery("");
            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            console.error("Save error details:", error);
            alert(`Failed to save: ${error?.message || "Unknown error"}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="max-h-[90vh]">
                <DrawerHeader>
                    <DrawerTitle className="flex items-center gap-2">
                        <Tv className="text-primary" size={24} />
                        {editItem ? "Update Progress" : "Log a TV Show"}
                    </DrawerTitle>
                    <DrawerDescription>
                        {editItem ? "Update your status or rating." : "Search for a series and add it to your list"}
                    </DrawerDescription>
                </DrawerHeader>

                <div className="px-4 pb-4 overflow-y-auto">
                    {!selectedShow ? (
                        <>
                            {/* Search Section */}
                            <div className="flex gap-2 mb-4">
                                <Input
                                    placeholder="Search for a TV Series... (e.g. Breaking Bad)"
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
                                {searchResults.map((show) => (
                                    <div
                                        key={show.imdbID}
                                        onClick={() => handleSelectShow(show.imdbID)}
                                        className="flex gap-3 p-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-all"
                                    >
                                        {show.Poster !== "N/A" ? (
                                            <img
                                                src={show.Poster}
                                                alt={show.Title}
                                                className="w-12 h-16 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                                                <Tv size={20} className="text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="font-semibold">{show.Title}</p>
                                            <p className="text-sm text-muted-foreground">{show.Year}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Selected Show Details */}
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    {selectedShow.Poster !== "N/A" && (
                                        <img
                                            src={selectedShow.Poster}
                                            alt={selectedShow.Title}
                                            className="w-24 h-36 object-cover rounded-lg"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold">{selectedShow.Title}</h3>
                                        <p className="text-muted-foreground">{selectedShow.Year}</p>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {selectedShow.Genre}
                                        </p>
                                    </div>
                                    {!editItem && (
                                        <button
                                            onClick={() => setSelectedShow(null)}
                                            className="text-muted-foreground hover:text-foreground h-fit"
                                        >
                                            <X size={20} />
                                        </button>
                                    )}
                                </div>

                                {/* Status Selection */}
                                <div className="flex p-1 bg-muted rounded-lg">
                                    <button
                                        onClick={() => setStatus("watching")}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all",
                                            status === "watching"
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <PlayCircle size={16} />
                                        Watching
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
                                        Plan
                                    </button>
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
                                        Done
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
                                    </>
                                )}

                                {/* Notes */}
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300 delay-100">
                                    <label className="block text-sm font-medium mb-2">
                                        Notes
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Where are you in the series? What do you think?"
                                        className="w-full h-24 px-3 py-2 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <DrawerFooter>
                    {selectedShow && (
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
                                "Save Show"
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
