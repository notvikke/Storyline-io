import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client with service role (bypasses RLS)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Recent Highlights (Completed/Watching)
        const { data: recentMovie } = await supabaseAdmin
            .from("movie_logs")
            .select("*")
            .eq("user_id", userId)
            .eq("status", "completed")
            .order("watched_date", { ascending: false })
            .limit(1)
            .single();

        const { data: recentBook } = await supabaseAdmin
            .from("book_logs")
            .select("*")
            .eq("user_id", userId)
            .eq("status", "completed")
            .order("finished_date", { ascending: false })
            .limit(1)
            .single();

        const { data: recentTv } = await supabaseAdmin
            .from("tv_logs")
            .select("*")
            .eq("user_id", userId)
            .in("status", ["watching", "completed"]) // Show recently updated TV log
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        // 2. Up Next (Planning)
        const { data: planningMovies } = await supabaseAdmin
            .from("movie_logs")
            .select("*")
            .eq("user_id", userId)
            .eq("status", "planning")
            .order("created_at", { ascending: false })
            .limit(3);

        const { data: planningBooks } = await supabaseAdmin
            .from("book_logs")
            .select("*")
            .eq("user_id", userId)
            .eq("status", "planning")
            .order("created_at", { ascending: false })
            .limit(3);

        const { data: planningTv } = await supabaseAdmin
            .from("tv_logs")
            .select("*")
            .eq("user_id", userId)
            .eq("status", "planning")
            .order("created_at", { ascending: false })
            .limit(3);

        const combinedPlanning = [
            ...(planningMovies || []).map((m: any) => ({ ...m, type: "movie" })),
            ...(planningBooks || []).map((b: any) => ({ ...b, type: "book" })),
            ...(planningTv || []).map((t: any) => ({ ...t, type: "tv" }))
        ]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 3);

        // 3. Flashback (Random Travel)
        // Fetch ID and Photo URL to minimize data transfer if we were fetching all, but for random we need to know count or fetch all IDs.
        // Since personal dashboard likely has <1000 logs, fetching all IDs is fine.
        const { data: allTravelIds } = await supabaseAdmin
            .from("travel_logs")
            .select("id")
            .eq("user_id", userId);

        let flashback = null;
        if (allTravelIds && allTravelIds.length > 0) {
            const randomIndex = Math.floor(Math.random() * allTravelIds.length);
            const randomId = allTravelIds[randomIndex].id;

            const { data: randomLog } = await supabaseAdmin
                .from("travel_logs")
                .select("*")
                .eq("id", randomId)
                .single();

            flashback = randomLog;
        }

        return NextResponse.json({
            recent: {
                movie: recentMovie || null,
                book: recentBook || null,
                tv: recentTv || null,
            },
            planning: combinedPlanning,
            flashback: flashback || null
        });

    } catch (error: any) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json(
            { error: error?.message || "Internal server error" },
            { status: 500 }
        );
    }
}
