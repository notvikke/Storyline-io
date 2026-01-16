import { NextRequest, NextResponse } from "next/server";

const OMDB_API_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY;

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("s");
    const imdbId = searchParams.get("i");

    if (!OMDB_API_KEY) {
        return NextResponse.json(
            { error: "OMDb API key not configured" },
            { status: 500 }
        );
    }

    try {
        let url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}`;

        if (imdbId) {
            // Get specific movie by IMDb ID
            url += `&i=${imdbId}&plot=full`;
        } else if (query) {
            // Search movies by title
            url += `&s=${encodeURIComponent(query)}&type=movie`;
        } else {
            return NextResponse.json(
                { error: "Missing search parameter (s or i)" },
                { status: 400 }
            );
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.Response === "False") {
            return NextResponse.json(
                { error: data.Error || "Movie not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("OMDb API Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch movie data" },
            { status: 500 }
        );
    }
}
