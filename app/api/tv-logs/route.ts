
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

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        // Validate required fields
        if (!body.title || !body.imdb_id) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Ensure user_id matches authenticated user
        if (body.user_id && body.user_id !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { data, error } = await supabaseAdmin
            .from("tv_logs")
            .insert({
                user_id: userId, // Enforce correct user_id
                title: body.title,
                imdb_id: body.imdb_id,
                poster_url: body.poster_url,
                rating: body.rating,
                notes: body.notes,
                status: body.status || "completed",
            })
            .select()
            .single();

        if (error) {
            console.error("Supabase error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Internal error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = searchParams.get("limit");

        let query = supabaseAdmin
            .from("tv_logs")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (limit) {
            query = query.limit(parseInt(limit));
        }

        const { data, error } = await query;

        if (error) {
            console.error("Supabase GET error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("API GET internal error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        // Verify ownership
        const { data: log } = await supabaseAdmin
            .from("tv_logs")
            .select("user_id")
            .eq("id", id)
            .single();

        if (log?.user_id !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { error } = await supabaseAdmin
            .from("tv_logs")
            .delete()
            .eq("id", id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const updates = await request.json();
        const { id, ...dataToUpdate } = updates;

        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        // Verify ownership
        const { data: existing } = await supabaseAdmin
            .from("tv_logs")
            .select("user_id")
            .eq("id", id)
            .single();

        if (existing?.user_id !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Prevent updating sensitive fields
        delete dataToUpdate.user_id;

        const { data, error } = await supabaseAdmin
            .from("tv_logs")
            .update(dataToUpdate)
            .eq("id", id)
            .select()
            .single();

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
