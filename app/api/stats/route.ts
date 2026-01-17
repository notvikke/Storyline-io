import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

// Create Supabase client with service role (bypasses RLS)
const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function GET() {
    try {
        // Verify Clerk authentication
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get counts for all categories
        // Get counts for all categories
        const [moviesResult, booksResult, travelsResult, tvResult] = await Promise.all([
            supabaseAdmin.from("movie_logs").select("id", { count: "exact" }).eq("user_id", userId),
            supabaseAdmin.from("book_logs").select("id", { count: "exact" }).eq("user_id", userId),
            supabaseAdmin.from("travel_logs").select("id", { count: "exact" }).eq("user_id", userId),
            supabaseAdmin.from("tv_logs").select("id", { count: "exact" }).eq("user_id", userId),
        ]);

        const stats = {
            moviesCount: moviesResult.count || 0,
            booksCount: booksResult.count || 0,
            travelsCount: travelsResult.count || 0,
            tvCount: tvResult.count || 0,
            totalMemories: (moviesResult.count || 0) + (booksResult.count || 0) + (travelsResult.count || 0) + (tvResult.count || 0),
        };

        return NextResponse.json(stats);
    } catch (error: any) {
        console.error("Stats API error:", error);
        return NextResponse.json(
            { error: error?.message || "Internal server error" },
            { status: 500 }
        );
    }
}
