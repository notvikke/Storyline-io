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

        // Get book data from request
        const bookData: any = await request.json();

        // Ensure the user_id matches the authenticated user
        if (bookData.user_id !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Insert into Supabase (bypasses RLS with service role)
        const { data, error } = await supabaseAdmin
            .from("book_logs")
            .insert(bookData)
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

        // Get user's books
        const { data, error } = await supabaseAdmin
            .from("book_logs")
            .select("*")
            .eq("user_id", userId)
            .order("finished_date", { ascending: false });

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
            return NextResponse.json({ error: "Book ID required" }, { status: 400 });
        }

        // Verify ownership before deleting
        const { data: book } = await supabaseAdmin
            .from("book_logs")
            .select("user_id")
            .eq("id", id)
            .single();

        if (book?.user_id !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Delete the book
        const { error } = await supabaseAdmin
            .from("book_logs")
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
