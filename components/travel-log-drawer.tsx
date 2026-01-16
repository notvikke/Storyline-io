"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { MapPin, Search, Calendar, Loader2 } from "lucide-react";
import { useEffect } from "react";
import type { Database } from "@/lib/supabase/database.types";

type TravelLog = Database["public"]["Tables"]["travel_logs"]["Row"];
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

interface TravelLogDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    initialData?: TravelLog | null;
}

interface LocationResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    address?: {
        country_code?: string;
    };
}

export function TravelLogDrawer({ open, onOpenChange, onSuccess, initialData }: TravelLogDrawerProps) {
    const { user } = useUser();
    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
    const [visitDate, setVisitDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);

    // Reset or Populate form when drawer opens
    useEffect(() => {
        if (open) {
            if (initialData) {
                // Edit Mode
                setSearchQuery("");
                setSelectedLocation({
                    place_id: 0, // Dummy ID
                    display_name: initialData.location_name,
                    lat: String(initialData.latitude),
                    lon: String(initialData.longitude),
                    address: { country_code: initialData.country_code || undefined }
                });
                setVisitDate(initialData.visit_date || new Date().toISOString().split("T")[0]);
                setNotes(initialData.notes || "");
            } else {
                // Create Mode
                setSearchQuery("");
                setSelectedLocation(null);
                setVisitDate(new Date().toISOString().split("T")[0]);
                setNotes("");
            }
        }
    }, [open, initialData]);

    // Search for location using Nominatim (OpenStreetMap)
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        setSearchResults([]);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1`
            );
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error("Search error:", error);
            alert("Failed to search for location");
        } finally {
            setSearching(false);
        }
    };

    const handleSave = async () => {
        if (!user?.id || !selectedLocation) return;

        setSaving(true);
        try {
            const method = initialData ? "PUT" : "POST";
            const body = {
                id: initialData?.id, // Only for PUT
                user_id: user.id,
                location_name: selectedLocation.display_name.split(",")[0],
                country: initialData?.country || selectedLocation.display_name.split(",").pop()?.trim(), // Preserve existing or extract new
                country_code: initialData?.country_code || selectedLocation.address?.country_code || null,
                latitude: parseFloat(selectedLocation.lat),
                longitude: parseFloat(selectedLocation.lon),
                visit_date: visitDate,
                notes: notes || null,
            };

            const response = await fetch("/api/travel-logs", {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to save trip");
            }

            // Reset and close
            setSelectedLocation(null);
            setSearchResults([]);
            setSearchQuery("");
            setNotes("");
            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            console.error("Save error:", error);
            alert(`Failed to save trip: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="max-h-[85vh] h-[85vh] bg-background border-t border-border focus:outline-none">
                <div className="mx-auto w-full max-w-sm sm:max-w-md h-full flex flex-col">
                    <DrawerHeader>
                        <DrawerTitle className="text-2xl font-bold flex items-center gap-2">
                            <MapPin className="text-chart-3" />
                            Log a Trip
                        </DrawerTitle>
                        <DrawerDescription>
                            Where on Earth have you been?
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto px-4 space-y-6">
                        {/* Search Section */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search Location</label>
                            <div className="flex gap-2">
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="City, Country, Landmark..."
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="bg-muted border-none"
                                />
                                <Button
                                    onClick={handleSearch}
                                    disabled={searching || !searchQuery}
                                    className="bg-chart-3 hover:bg-chart-3/90 text-white"
                                >
                                    {searching ? <Loader2 className="animate-spin" /> : <Search size={18} />}
                                </Button>
                            </div>

                            {/* Results */}
                            {searchResults.length > 0 && !selectedLocation && (
                                <div className="mt-2 space-y-2 border border-border rounded-lg p-2 max-h-48 overflow-y-auto bg-card">
                                    {searchResults.map((result) => (
                                        <button
                                            key={result.place_id}
                                            onClick={() => {
                                                setSelectedLocation(result);
                                                setSearchResults([]); // Clear results after selection
                                            }}
                                            className="w-full text-left p-2 hover:bg-muted rounded-md text-sm transition-colors flex items-start gap-2"
                                        >
                                            <MapPin size={16} className="mt-0.5 text-muted-foreground shrink-0" />
                                            <span className="line-clamp-2">{result.display_name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Selected Location Preview */}
                            {selectedLocation && (
                                <div className="mt-2 p-3 bg-secondary/10 border border-secondary/20 rounded-lg flex items-start gap-3">
                                    <MapPin className="text-chart-3 shrink-0" />
                                    <div>
                                        <p className="font-bold text-sm">{selectedLocation.display_name}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Coords: {parseFloat(selectedLocation.lat).toFixed(4)}, {parseFloat(selectedLocation.lon).toFixed(4)}
                                        </p>
                                        <button
                                            onClick={() => setSelectedLocation(null)}
                                            className="text-xs text-destructive hover:underline mt-2"
                                        >
                                            Change Location
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Details Section */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date Visited</label>
                                <Input
                                    type="date"
                                    value={visitDate}
                                    onChange={(e) => setVisitDate(e.target.value)}
                                    className="bg-muted border-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Notes & Memories</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="What did you love about this place?"
                                    className="w-full min-h-[100px] rounded-md border-none bg-muted p-3 text-sm focus:outline-none focus:ring-2 focus:ring-chart-3"
                                />
                            </div>
                        </div>
                    </div>

                    <DrawerFooter>
                        <Button
                            onClick={handleSave}
                            disabled={!selectedLocation || saving || !user?.id}
                            className="bg-chart-3 hover:bg-chart-3/90 text-white w-full h-12 text-lg"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving Trip...
                                </>
                            ) : (
                                "Log Trip"
                            )}
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="ghost" className="w-full">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
