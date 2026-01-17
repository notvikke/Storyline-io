// @ts-nocheck
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin: any = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;

        const { data, error } = await supabaseAdmin
            .from("blog_posts")
            .select("*")
            .eq("id", resolvedParams.id)
            .single();

        if (error) throw error;
        if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body: any = await req.json();
        const resolvedParams = await params;

        // Check ownership
        const { data: existing, error: fetchError } = await supabaseAdmin
            .from("blog_posts")
            .select("user_id")
            .eq("id", resolvedParams.id)
            .single();

        if (fetchError || !existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
        if (existing.user_id !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { data, error } = await supabaseAdmin
            .from("blog_posts")
            .update({
                title: body.title,
                content: body.content,
                cover_image: body.cover_image,
                excerpt: body.excerpt,
                published: body.published,
                published_at: body.published ? (body.published_at || new Date().toISOString()) : null,
                updated_at: new Date().toISOString()
            })
            .eq("id", resolvedParams.id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const resolvedParams = await params;

        // Check ownership
        const { data: existing, error: fetchError } = await supabaseAdmin
            .from("blog_posts")
            .select("user_id")
            .eq("id", resolvedParams.id)
            .single();

        if (fetchError || !existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
        if (existing.user_id !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { error } = await supabaseAdmin
            .from("blog_posts")
            .delete()
            .eq("id", resolvedParams.id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
