// @ts-nocheck
/**
 * Supabase Helper Functions
 * Utility functions for common database operations
 */

import { supabase } from "./client";
import type { Database } from "./database.types";

// Type aliases for cleaner code
type MovieLog = Database["public"]["Tables"]["movie_logs"]["Row"];
type BookLog = Database["public"]["Tables"]["book_logs"]["Row"];
type TravelLog = Database["public"]["Tables"]["travel_logs"]["Row"];
type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];
type BlogComment = Database["public"]["Tables"]["blog_comments"]["Row"];

// =============================================
// MOVIE LOGS
// =============================================

export async function getMovieLogs(userId: string) {
    const { data, error } = await supabase
        .from("movie_logs")
        .select("*")
        .eq("user_id", userId)
        .order("watched_date", { ascending: false });

    if (error) throw error;
    return data as MovieLog[];
}

export async function createMovieLog(
    movieData: Database["public"]["Tables"]["movie_logs"]["Insert"]
) {
    const { data, error } = await supabase
        .from("movie_logs")
        .insert(movieData)
        .select()
        .single();

    if (error) throw error;
    return data as MovieLog;
}

export async function updateMovieLog(
    id: string,
    updates: Database["public"]["Tables"]["movie_logs"]["Update"]
) {
    const { data, error } = await supabase
        .from("movie_logs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data as MovieLog;
}

export async function deleteMovieLog(id: string) {
    const { error } = await supabase.from("movie_logs").delete().eq("id", id);

    if (error) throw error;
}

// =============================================
// BOOK LOGS
// =============================================

export async function getBookLogs(userId: string) {
    const { data, error } = await supabase
        .from("book_logs")
        .select("*")
        .eq("user_id", userId)
        .order("finished_date", { ascending: false });

    if (error) throw error;
    return data as BookLog[];
}

export async function createBookLog(
    bookData: Database["public"]["Tables"]["book_logs"]["Insert"]
) {
    // console.log("Creating book log with data:", bookData);
    const { data, error } = await supabase
        .from("book_logs")
        .insert(bookData)
        .select()
        .single();

    if (error) {
        console.error("Supabase error:", error);
        console.error("Full error object:", JSON.stringify(error, null, 2));
        throw error;
    }
    return data as BookLog;
}

export async function updateBookLog(
    id: string,
    updates: Database["public"]["Tables"]["book_logs"]["Update"]
) {
    const { data, error } = await supabase
        .from("book_logs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data as BookLog;
}

export async function deleteBookLog(id: string) {
    const { error } = await supabase.from("book_logs").delete().eq("id", id);

    if (error) throw error;
}

// =============================================
// TRAVEL LOGS
// =============================================

export async function getTravelLogs(userId: string) {
    const { data, error } = await supabase
        .from("travel_logs")
        .select("*")
        .eq("user_id", userId)
        .order("visit_date", { ascending: false });

    if (error) throw error;
    return data as TravelLog[];
}

export async function createTravelLog(
    travelData: Database["public"]["Tables"]["travel_logs"]["Insert"]
) {
    const { data, error } = await supabase
        .from("travel_logs")
        .insert(travelData)
        .select()
        .single();

    if (error) throw error;
    return data as TravelLog;
}

export async function updateTravelLog(
    id: string,
    updates: Database["public"]["Tables"]["travel_logs"]["Update"]
) {
    const { data, error } = await supabase
        .from("travel_logs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data as TravelLog;
}

export async function deleteTravelLog(id: string) {
    const { error } = await supabase.from("travel_logs").delete().eq("id", id);

    if (error) throw error;
}

// =============================================
// BLOG POSTS
// =============================================

export async function getPublishedBlogPosts() {
    const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false });

    if (error) throw error;
    return data as BlogPost[];
}

export async function getUserBlogPosts(userId: string) {
    const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as BlogPost[];
}

export async function getBlogPostBySlug(slug: string) {
    const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error) throw error;
    return data as BlogPost;
}

export async function createBlogPost(
    postData: Database["public"]["Tables"]["blog_posts"]["Insert"]
) {
    const { data, error } = await supabase
        .from("blog_posts")
        .insert(postData)
        .select()
        .single();

    if (error) throw error;
    return data as BlogPost;
}

export async function updateBlogPost(
    id: string,
    updates: Database["public"]["Tables"]["blog_posts"]["Update"]
) {
    const { data, error } = await supabase
        .from("blog_posts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data as BlogPost;
}

export async function deleteBlogPost(id: string) {
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);

    if (error) throw error;
}

// =============================================
// BLOG COMMENTS
// =============================================

export async function getCommentsByPostId(postId: string) {
    const { data, error } = await supabase
        .from("blog_comments")
        .select("*")
        .eq("blog_post_id", postId)
        .order("created_at", { ascending: true });

    if (error) throw error;
    return data as BlogComment[];
}

export async function createComment(
    commentData: Database["public"]["Tables"]["blog_comments"]["Insert"]
) {
    const { data, error } = await supabase
        .from("blog_comments")
        .insert(commentData)
        .select()
        .single();

    if (error) throw error;
    return data as BlogComment;
}

export async function deleteComment(id: string) {
    const { error } = await supabase.from("blog_comments").delete().eq("id", id);

    if (error) throw error;
}

// =============================================
// STATISTICS
// =============================================

export async function getUserStats(userId: string) {
    const [moviesResult, booksResult, travelsResult] = await Promise.all([
        supabase.from("movie_logs").select("id", { count: "exact" }).eq("user_id", userId),
        supabase.from("book_logs").select("id", { count: "exact" }).eq("user_id", userId),
        supabase.from("travel_logs").select("id", { count: "exact" }).eq("user_id", userId),
    ]);

    return {
        moviesCount: moviesResult.count || 0,
        booksCount: booksResult.count || 0,
        travelsCount: travelsResult.count || 0,
        totalMemories: (moviesResult.count || 0) + (booksResult.count || 0) + (travelsResult.count || 0),
    };
}
