// @ts-nocheck
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

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

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        // Validate ownership
        if (body.user_id !== userId) {
            return NextResponse.json({ error: "Unauthorized: User ID mismatch" }, { status: 403 });
        }

        // Required fields
        if (!body.location_name || !body.latitude || !body.longitude) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from("travel_logs")
            .insert([body])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error creating travel log:", error);
        return NextResponse.json(
            { error: error?.message || "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data, error } = await supabaseAdmin
            .from("travel_logs")
            .select("*")
            .eq("user_id", userId)
            .order("visit_date", { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error fetching travel logs:", error);
        return NextResponse.json(
            { error: error?.message || "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
        }

        // Verify ownership before deleting
        const { data: existingLog, error: fetchError } = await supabaseAdmin
            .from("travel_logs")
            .select("user_id")
            .eq("id", id)
            .single();

        if (fetchError || !existingLog) {
            return NextResponse.json({ error: "Log not found" }, { status: 404 });
        }

        if (existingLog.user_id !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { error } = await supabaseAdmin
            .from("travel_logs")
            .delete()
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting travel log:", error);
        return NextResponse.json(
            { error: error?.message || "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing log ID" }, { status: 400 });
        }

        // Verify ownership
        const { data: existingLog, error: fetchError } = await supabaseAdmin
            .from("travel_logs")
            .select("user_id")
            .eq("id", id)
            .single();

        if (fetchError || !existingLog) {
            return NextResponse.json({ error: "Log not found" }, { status: 404 });
        }

        if (existingLog.user_id !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Update
        const { data, error } = await supabaseAdmin
            .from("travel_logs")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error updating travel log:", error);
        return NextResponse.json(
            { error: error?.message || "Internal server error" },
            { status: 500 }
        );
    }
}
