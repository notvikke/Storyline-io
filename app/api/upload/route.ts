import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Init Supabase Admin (Bypass RLS for listing/uploading if needed, though RLS allows auth users too)
// Using Service Role to ensure checks are robust and we can enforce quota without relying on RLS quirks
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

const MAX_IMAGES_PER_USER = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // 1. Validate File
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "Only images are allowed" }, { status: 400 });
        }
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 });
        }

        // 2. Check Quota (Count existing files in user's folder)
        // user_id/filename.ext
        const { data: existingFiles, error: listError } = await supabaseAdmin
            .storage
            .from("blog-images")
            .list(userId, { limit: 100 });

        if (listError) {
            console.error("Quota check error:", listError);
            return NextResponse.json({ error: "Failed to check storage quota" }, { status: 500 });
        }

        if ((existingFiles?.length || 0) >= MAX_IMAGES_PER_USER) {
            return NextResponse.json({
                error: `Storage quota exceeded. You can only upload ${MAX_IMAGES_PER_USER} images.`
            }, { status: 403 });
        }

        // 3. Upload File
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileExt = file.name.split(".").pop() || "jpg";
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabaseAdmin
            .storage
            .from("blog-images")
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (uploadError) {
            console.error("Upload error:", uploadError);
            return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
        }

        // 4. Return Public URL
        const { data: { publicUrl } } = supabaseAdmin
            .storage
            .from("blog-images")
            .getPublicUrl(fileName);

        return NextResponse.json({
            success: true,
            url: publicUrl,
            remainingQuota: MAX_IMAGES_PER_USER - (existingFiles?.length || 0) - 1
        });

    } catch (error: any) {
        console.error("Upload handler error:", error);
        return NextResponse.json(
            { error: error?.message || "Internal server error" },
            { status: 500 }
        );
    }
}
