
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

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

// console.log("Service Key Loaded:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
// console.log("Service Key Length:", process.env.SUPABASE_SERVICE_ROLE_KEY?.length);

export async function POST(req: Request) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({ error: "Configuration Error: SUPABASE_SERVICE_ROLE_KEY is missing from server environment." }, { status: 500 });
    }

    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Ensure the ID matches the authenticated user (Security check)
        if (body.id !== userId) {
            return NextResponse.json({ error: "Forbidden: Cannot update other users" }, { status: 403 });
        }

        const { data, error } = await supabase
            .from("profiles")
            .upsert(body)
            .select()
            .single();

        if (error) {
            console.error("Supabase Profile Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("API Profile Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
