"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Loader2, Film, BookOpen, MapPin, FileText, ChevronDown } from "lucide-react";
import Link from "next/link";

interface CalendarEvent {
    id: string;
    type: "movie" | "book" | "travel" | "blog";
    title: string;
    date: string;
    image: string | null;
    color: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function CalendarView() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    // Initialize with fixed date for SSR, then update on mount
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Ensure client-side date matches current browser time exactly on mount
        const now = new Date();
        setCurrentDate(now);
        setSelectedDate(now);
    }, []);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch("/api/calendar-events");
                if (res.ok) {
                    const data = await res.json();
                    setEvents(data);
                }
            } catch (error) {
                console.error("Failed to fetch calendar events", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    // Calendar Helper Logic
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    // Group events by date
    const eventsByDate = useMemo(() => {
        const map: Record<string, CalendarEvent[]> = {};
        events.forEach(event => {
            if (!map[event.date]) map[event.date] = [];
            map[event.date].push(event);
        });
        return map;
    }, [events]);

    const changeMonth = (delta: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
        setSelectedDate(null); // Clear selection on month change
    };

    const formatDateKey = (year: number, month: number, day: number) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    // Events for selected date
    const selectedDateEvents = selectedDate
        ? eventsByDate[formatDateKey(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())] || []
        : [];

    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [pickerYear, setPickerYear] = useState(new Date().getFullYear());

    // Sync picker year when calendar view changes (only if picker is closed)
    useEffect(() => {
        if (!isPickerOpen) {
            setPickerYear(currentDate.getFullYear());
        }
    }, [currentDate, isPickerOpen]);

    const handleMonthSelect = (monthIndex: number) => {
        setCurrentDate(new Date(pickerYear, monthIndex, 1));
        setIsPickerOpen(false);
        setSelectedDate(null);
    };

    if (loading || !mounted) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Calendar Grid */}
            <div className="flex-1 bg-card border border-border rounded-xl overflow-hidden shadow-sm relative">
                {/* Header */}
                <div className="p-4 flex items-center justify-between border-b border-border bg-muted/20 relative z-20">
                    <div className="relative">
                        <button
                            onClick={() => setIsPickerOpen(!isPickerOpen)}
                            className="text-xl font-bold flex items-center gap-2 hover:text-primary transition-colors px-2 py-1 -ml-2 rounded-lg hover:bg-muted/50"
                        >
                            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                            <span className={`text-muted-foreground transition-transform duration-200 ${isPickerOpen ? "rotate-180" : ""}`}>
                                <ChevronDown size={20} />
                            </span>
                        </button>

                        {/* Date Picker Dropdown */}
                        {isPickerOpen && (
                            <>
                                {/* Backdrop to close */}
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsPickerOpen(false)}
                                />
                                <div className="absolute top-full left-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                                    {/* Year Selector */}
                                    <div className="flex items-center justify-between mb-4">
                                        <button
                                            onClick={() => setPickerYear(y => y - 1)}
                                            className="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <span className="font-bold text-lg">{pickerYear}</span>
                                        <button
                                            onClick={() => setPickerYear(y => y + 1)}
                                            className="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>

                                    {/* Month Grid */}
                                    <div className="grid grid-cols-3 gap-2">
                                        {MONTHS.map((month, index) => {
                                            const today = new Date();
                                            const isCurrentMonth = index === today.getMonth() && pickerYear === today.getFullYear();
                                            const isSelectedMonth = index === currentDate.getMonth() && pickerYear === currentDate.getFullYear();

                                            return (
                                                <button
                                                    key={month}
                                                    onClick={() => handleMonthSelect(index)}
                                                    className={`
                                                        py-2 px-1 rounded-md text-sm font-medium transition-all
                                                        ${isSelectedMonth
                                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                                        }
                                                        ${isCurrentMonth && !isSelectedMonth ? "border border-primary/30 text-primary" : ""}
                                                    `}
                                                >
                                                    {month.substring(0, 3)}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-4 pt-3 border-t border-border flex justify-between">
                                        <button
                                            onClick={() => {
                                                const now = new Date();
                                                setCurrentDate(now);
                                                setPickerYear(now.getFullYear());
                                                setIsPickerOpen(false);
                                                setSelectedDate(now);
                                            }}
                                            className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            Jump to Today
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7 text-center border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {DAYS.map(day => <div key={day} className="py-2">{day}</div>)}
                </div>
                <div className="grid grid-cols-7 bg-background">
                    {/* Empty cells for padding */}
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-24 md:h-32 border-b border-r border-border/50 bg-muted/5"></div>
                    ))}

                    {/* Days */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateKey = formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), day);
                        const dayEvents = eventsByDate[dateKey] || [];
                        const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                        const isSelected = selectedDate?.getDate() === day && selectedDate.getMonth() === currentDate.getMonth();

                        return (
                            <div
                                key={day}
                                onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                                className={`
                                    relative h-24 md:h-32 border-b border-r border-border/50 p-2 cursor-pointer transition-colors
                                    ${isSelected ? "bg-primary/5 ring-1 ring-inset ring-primary" : "hover:bg-muted/30"}
                                    ${isToday ? "bg-muted/20" : ""}
                                `}
                            >
                                <span className={`
                                    inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mb-1
                                    ${isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground"}
                                `}>
                                    {day}
                                </span>

                                <div className="flex flex-wrap gap-1 mt-1">
                                    {dayEvents.slice(0, 5).map((event, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-2 h-2 rounded-full bg-${event.color}`}
                                            title={event.title}
                                        />
                                    ))}
                                    {dayEvents.length > 5 && (
                                        <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 5}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar / Details Panel */}
            <div className="w-full lg:w-80 shrink-0">
                <div className="bg-card border border-border rounded-xl p-4 h-full min-h-[400px]">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        {selectedDate ? selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : "Select a date"}
                    </h3>

                    {selectedDateEvents.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>No activity recorded.</p>
                            <p className="text-xs mt-2 opacity-60">Try adding a movie, book, trip, or story.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {selectedDateEvents.map(event => (
                                <div key={event.id} className="flex gap-3 items-start group">
                                    <div className={`mt-1 p-2 rounded-full bg-${event.color}/10 text-${event.color}`}>
                                        {event.type === 'movie' && <Film size={16} />}
                                        {event.type === 'book' && <BookOpen size={16} />}
                                        {event.type === 'travel' && <MapPin size={16} />}
                                        {event.type === 'blog' && <FileText size={16} />}
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-0.5">
                                            {event.type}
                                        </span>
                                        <h4 className="font-medium text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                                            {event.title}
                                        </h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
