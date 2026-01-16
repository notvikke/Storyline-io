// @ts-nocheck
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin: any = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

function generateSlug(title: string) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') +
        '-' + Date.now().toString().slice(-4); // Append random suffix to avoid collisions
}

export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data, error } = await supabaseAdmin
            .from("blog_posts")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body: any = await req.json();

        if (!body.title || !body.content) {
            return NextResponse.json({ error: "Title and Content are required" }, { status: 400 });
        }

        const slug = generateSlug(body.title);

        const { data, error } = await supabaseAdmin
            .from("blog_posts")
            .insert([{
                user_id: userId,
                title: body.title,
                content: body.content,
                slug: slug,
                cover_image: body.cover_image || null,
                excerpt: body.excerpt || body.content.substring(0, 150) + "...",
                published: body.published || false,
                published_at: body.published ? new Date().toISOString() : null,
                tags: body.tags || []
            }])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
