
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Initialize Supabase with Service Role Key for full access
const supabase = createClient(
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
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Create unique filename
        const fileExt = file.name.split(".").pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;

        // Convert file to ArrayBuffer for upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const { data, error } = await supabase.storage
            .from("profile-assets")
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: true
            });

        if (error) {
            console.error("Storage Upload Error:", error);
            throw error;
        }

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from("profile-assets")
            .getPublicUrl(fileName);

        return NextResponse.json({ url: publicUrl });

    } catch (error: any) {
        console.error("Upload Route Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
