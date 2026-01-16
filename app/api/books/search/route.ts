import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const isbn = searchParams.get("isbn");

    try {
        let url = "https://openlibrary.org/search.json?";

        if (isbn) {
            // Search by ISBN
            url += `isbn=${encodeURIComponent(isbn)}`;
        } else if (query) {
            // Search by title/author
            url += `q=${encodeURIComponent(query)}&limit=10`;
        } else {
            return NextResponse.json(
                { error: "Missing search parameter (q or isbn)" },
                { status: 400 }
            );
        }

        const response = await fetch(url);
        const data = await response.json();

        if (!data.docs || data.docs.length === 0) {
            return NextResponse.json(
                { error: "No books found" },
                { status: 404 }
            );
        }

        // Transform the data to a cleaner format
        const books = data.docs.map((book: any) => ({
            isbn: book.isbn?.[0] || null,
            title: book.title,
            author: book.author_name?.[0] || "Unknown",
            publishYear: book.first_publish_year?.toString() || null,
            coverUrl: book.cover_i
                ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                : null,
            pageCount: book.number_of_pages_median || null,
            key: book.key,
        }));

        return NextResponse.json({ books });
    } catch (error) {
        console.error("Open Library API Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch book data" },
            { status: 500 }
        );
    }
}
