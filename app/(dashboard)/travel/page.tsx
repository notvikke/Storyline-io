"use client";

import { useUser } from "@clerk/nextjs";
import { Plus, Loader2, MapPin, Globe, Calendar, ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { TravelLogDrawer } from "@/components/travel-log-drawer";
import type { Database } from "@/lib/supabase/database.types";
import Image from "next/image";

// Dynamically import Leaflet map
const LeafletMap = dynamic(
    () => import("@/components/map/leaflet-map"),
    {
        loading: () => (
            <div className="w-full h-full flex items-center justify-center bg-muted/20">
                <Loader2 className="animate-spin text-chart-3" size={40} />
            </div>
        ),
        ssr: false
    }
);

type TravelLog = Database["public"]["Tables"]["travel_logs"]["Row"];

export default function TravelPage() {
    const { user, isLoaded } = useUser();
    const [logs, setLogs] = useState<TravelLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<TravelLog | null>(null);

    // UI State
    const [showCountries, setShowCountries] = useState(true);
    const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
    const [filterYear, setFilterYear] = useState<string>("all");

    const fetchLogs = async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const response = await fetch("/api/travel-logs");
            if (!response.ok) throw new Error("Failed to fetch travel logs");
            const data = await response.json();
            setLogs(data);
        } catch (error) {
            console.error("Error fetching travel logs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded) {
            if (user?.id) {
                fetchLogs();
            } else {
                setLoading(false);
            }
        }
    }, [isLoaded, user?.id]);

    const handleEdit = (log: TravelLog) => {
        setEditingLog(log);
        setDrawerOpen(true);
    };

    const handleDelete = async (logId: string) => {
        if (!confirm("Are you sure you want to delete this trip?")) return;

        try {
            const response = await fetch(`/api/travel-logs?id=${logId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete log");

            // Optimistic update
            setLogs(prev => prev.filter(l => l.id !== logId));

            // Or refetch to be safe
            fetchLogs();
        } catch (error) {
            console.error("Error deleting log:", error);
            alert("Failed to delete trip");
        }
    };

    // Process Data
    const processedData = useMemo(() => {
        // 1. Filter
        let filtered = [...logs];
        if (filterYear !== "all") {
            filtered = filtered.filter(l => l.visit_date?.startsWith(filterYear));
        }

        // 2. Sort
        filtered.sort((a, b) => {
            const dateA = new Date(a.visit_date || 0).getTime();
            const dateB = new Date(b.visit_date || 0).getTime();
            return sortBy === "newest" ? dateB - dateA : dateA - dateB;
        });

        // 3. Unique Countries (for stats list)
        // Use a Map to keep the first occurrence (or most recent due to sort)
        const uniqueCountriesMap = new Map();
        logs.forEach(log => {
            if (log.country && log.country_code) {
                if (!uniqueCountriesMap.has(log.country_code)) {
                    uniqueCountriesMap.set(log.country_code, {
                        name: log.country,
                        code: log.country_code
                    });
                }
            }
        });

        const distinctCountries = Array.from(uniqueCountriesMap.values());

        // Available years for filter
        const years = Array.from(new Set(logs.map(l => l.visit_date?.substring(0, 4)).filter(Boolean))).sort().reverse();

        return { filteredLogs: filtered, distinctCountries, years };
    }, [logs, filterYear, sortBy]);

    return (
        <div className="relative h-[calc(100vh-6rem)] w-full overflow-hidden rounded-xl border border-border bg-background shadow-sm">

            {/* Map Container */}
            <div className="absolute inset-0 z-0">
                <LeafletMap
                    logs={processedData.filteredLogs}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            {/* Floating Panel */}
            <div className="absolute top-4 left-4 z-[1000] w-80 flex flex-col gap-4">

                {/* Stats Card */}
                <div className="p-4 bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Globe className="text-chart-3" size={24} />
                            <div>
                                <h1 className="font-bold text-lg leading-none">Travel Map</h1>
                                <p className="text-xs text-muted-foreground">Your global footprint</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center mb-4">
                        <div className="p-2 bg-muted/50 rounded-lg">
                            <p className="text-2xl font-bold text-chart-3">{logs.length}</p>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Places</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded-lg">
                            <p className="text-2xl font-bold text-chart-3">{processedData.distinctCountries.length}</p>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Countries</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <select
                                value={filterYear}
                                onChange={(e) => setFilterYear(e.target.value)}
                                className="w-full appearance-none bg-muted/50 border border-transparent hover:border-border rounded-md px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-chart-3"
                            >
                                <option value="all">All Years</option>
                                {processedData.years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-1.5 text-muted-foreground pointer-events-none" size={14} />
                        </div>
                        <div className="relative flex-1">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="w-full appearance-none bg-muted/50 border border-transparent hover:border-border rounded-md px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-chart-3"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                            <ArrowUpDown className="absolute right-2 top-1.5 text-muted-foreground pointer-events-none" size={14} />
                        </div>
                    </div>
                </div>

                {/* Countries List (Collapsible) */}
                <div className="bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-lg overflow-hidden transition-all duration-300">
                    <button
                        onClick={() => setShowCountries(!showCountries)}
                        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                    >
                        <span className="text-sm font-semibold">Countries Visited</span>
                        {showCountries ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {showCountries && (
                        <div className="max-h-[30vh] overflow-y-auto p-2 pt-0 space-y-1 custom-scrollbar">
                            {processedData.distinctCountries.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-4">No countries visited yet.</p>
                            ) : (
                                processedData.distinctCountries.map((country) => (
                                    <div key={country.code} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors group">
                                        <div className="relative w-6 h-4 shadow-sm rounded-sm overflow-hidden shrink-0">
                                            <Image
                                                src={`https://flagcdn.com/${country.code.toLowerCase()}.svg`}
                                                alt={country.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <span className="text-sm truncate">{country.name}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Action Button */}
            <div className="absolute top-4 right-4 z-[1000]">
                <button
                    onClick={() => {
                        setEditingLog(null); // Reset for new entry
                        setDrawerOpen(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-chart-3 text-white rounded-full hover:bg-chart-3/90 transition-all shadow-lg hover:shadow-chart-3/20 font-medium group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-200" />
                    Log Trip
                </button>
            </div>

            {/* Travel Drawer */}
            <TravelLogDrawer
                open={drawerOpen}
                onOpenChange={(open) => {
                    setDrawerOpen(open);
                    if (!open) setEditingLog(null); // Clear editing state when closed
                }}
                onSuccess={fetchLogs}
                initialData={editingLog}
            />
        </div>
    );
}
