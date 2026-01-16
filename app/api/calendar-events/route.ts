// @ts-nocheck
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Fetch all data in parallel
        const [movies, books, travels, blogs] = await Promise.all([
            supabaseAdmin.from("movie_logs").select("id, title, watched_date, poster_url").eq("user_id", userId),
            supabaseAdmin.from("book_logs").select("id, title, finished_date, cover_url").eq("user_id", userId),
            supabaseAdmin.from("travel_logs").select("id, location_name, visit_date").eq("user_id", userId),
            supabaseAdmin.from("blog_posts").select("id, title, created_at, cover_image").eq("user_id", userId)
        ]);

        const events = [
            ...(movies.data || []).map(m => ({
                id: m.id,
                type: "movie",
                title: m.title,
                date: m.watched_date,
                image: m.poster_url,
                color: "chart-1"
            })),
            ...(books.data || []).map(b => ({
                id: b.id,
                type: "book",
                title: b.title,
                date: b.finished_date,
                image: b.cover_url,
                color: "chart-2"
            })),
            ...(travels.data || []).map(t => ({
                id: t.id,
                type: "travel",
                title: t.location_name,
                date: t.visit_date,
                image: null,
                color: "chart-3"
            })),
            ...(blogs.data || []).map(b => ({
                id: b.id,
                type: "blog",
                title: b.title,
                date: b.created_at ? b.created_at.split("T")[0] : null,
                image: b.cover_image,
                color: "chart-4"
            }))
        ].filter(e => e.date); // Filter out items without dates

        // Sort by date descending (newest first)
        events.sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());

        return NextResponse.json(events);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
