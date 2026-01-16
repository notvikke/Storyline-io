// @ts-nocheck
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client with service role (bypasses RLS)
const supabaseAdmin: any = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function POST(request: NextRequest) {
    try {
        // Verify Clerk authentication
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get movie data from request
        const movieData: any = await request.json();

        // Ensure the user_id matches the authenticated user
        if (movieData.user_id !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Insert into Supabase (bypasses RLS with service role)
        const { data, error } = await supabaseAdmin
            .from("movie_logs")
            .insert(movieData)
            .select()
            .single();

        if (error) {
            console.error("Supabase error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("API error:", error);
        return NextResponse.json(
            { error: error?.message || "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        // Verify Clerk authentication
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user's movies
        const { data, error } = await supabaseAdmin
            .from("movie_logs")
            .select("*")
            .eq("user_id", userId)
            .order("watched_date", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        // Verify Clerk authentication
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Movie ID required" }, { status: 400 });
        }

        // Verify ownership before deleting
        const { data: movie } = await supabaseAdmin
            .from("movie_logs")
            .select("user_id")
            .eq("id", id)
            .single();

        if (movie?.user_id !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Delete the movie
        const { error } = await supabaseAdmin
            .from("movie_logs")
            .delete()
            .eq("id", id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || "Internal server error" },
            { status: 500 }
        );
    }
}
