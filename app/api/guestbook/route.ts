
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Fetch messages
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
        return NextResponse.json({ error: "Missing profileId" }, { status: 400 });
    }

    try {
        const { data, error } = await supabase
            .from("guestbook")
            .select(`
                *,
                author:author_id( username, cover_photo_url )
            `)
            .eq("profile_owner_id", profileId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Sign guestbook
export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Ensure author_id matches authenticated user
        if (body.author_id !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { data, error } = await supabase
            .from("guestbook")
            .insert(body)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Remove comment
export async function DELETE(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        // Retrieve the message to check ownership
        const { data: msg, error: fetchError } = await supabase
            .from("guestbook")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError || !msg) return NextResponse.json({ error: "Message not found" }, { status: 404 });

        // Allowed if user is author OR profile owner
        if (msg.author_id !== userId && msg.profile_owner_id !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { error } = await supabase
            .from("guestbook")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
