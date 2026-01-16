"use client";

import CalendarView from "@/components/calendar/calendar-view";

export default function CalendarPage() {
    return (
        <div className="container mx-auto max-w-6xl p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-1">Activity Calendar</h1>
                <p className="text-muted-foreground">A timeline of your movies, books, travels, and stories.</p>
            </div>
            <CalendarView />
        </div>
    );
}
