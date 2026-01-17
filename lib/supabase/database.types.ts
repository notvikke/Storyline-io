/**
 * Storyline Database Types
 * Auto-generated TypeScript types for Supabase schema
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            movie_logs: {
                Row: {
                    id: string
                    user_id: string
                    imdb_id: string | null
                    title: string
                    year: string | null
                    director: string | null
                    genre: string | null
                    poster_url: string | null
                    plot: string | null
                    rating: number | null
                    notes: string | null
                    watched_date: string | null
                    status: "completed" | "planning"
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    imdb_id?: string | null
                    title: string
                    year?: string | null
                    director?: string | null
                    genre?: string | null
                    poster_url?: string | null
                    plot?: string | null
                    rating?: number | null
                    notes?: string | null
                    watched_date?: string | null
                    status?: "completed" | "planning"
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    imdb_id?: string | null
                    title?: string
                    year?: string | null
                    director?: string | null
                    genre?: string | null
                    poster_url?: string | null
                    plot?: string | null
                    rating?: number | null
                    notes?: string | null
                    watched_date?: string | null
                    status?: "completed" | "planning"
                    created_at?: string
                    updated_at?: string
                }
            }
            book_logs: {
                Row: {
                    id: string
                    user_id: string
                    isbn: string | null
                    title: string
                    author: string | null
                    publish_year: string | null
                    cover_url: string | null
                    description: string | null
                    page_count: number | null
                    rating: number | null
                    notes: string | null
                    started_date: string | null
                    finished_date: string | null
                    status: "completed" | "planning"
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    isbn?: string | null
                    title: string
                    author?: string | null
                    publish_year?: string | null
                    cover_url?: string | null
                    description?: string | null
                    page_count?: number | null
                    rating?: number | null
                    notes?: string | null
                    started_date?: string | null
                    finished_date?: string | null
                    status?: "completed" | "planning"
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    isbn?: string | null
                    title?: string
                    author?: string | null
                    publish_year?: string | null
                    cover_url?: string | null
                    description?: string | null
                    page_count?: number | null
                    rating?: number | null
                    notes?: string | null
                    started_date?: string | null
                    finished_date?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            travel_logs: {
                Row: {
                    id: string
                    user_id: string
                    location_name: string
                    country: string | null
                    country_code: string | null
                    latitude: number
                    longitude: number
                    visit_date: string | null
                    duration_days: number | null
                    notes: string | null
                    photo_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    location_name: string
                    country?: string | null
                    country_code?: string | null
                    latitude: number
                    longitude: number
                    visit_date?: string | null
                    duration_days?: number | null
                    notes?: string | null
                    photo_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    location_name?: string
                    country?: string | null
                    country_code?: string | null
                    latitude?: number
                    longitude?: number
                    visit_date?: string | null
                    duration_days?: number | null
                    notes?: string | null
                    photo_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            blog_posts: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    slug: string
                    content: string
                    excerpt: string | null
                    cover_image: string | null
                    tags: string[] | null
                    published: boolean
                    published_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    slug: string
                    content: string
                    excerpt?: string | null
                    cover_image?: string | null
                    tags?: string[] | null
                    published?: boolean
                    published_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    slug?: string
                    content?: string
                    excerpt?: string | null
                    cover_image?: string | null
                    tags?: string[] | null
                    published?: boolean
                    published_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            blog_comments: {
                Row: {
                    id: string
                    blog_post_id: string
                    user_id: string
                    content: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    blog_post_id: string
                    user_id: string
                    content: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    blog_post_id?: string
                    user_id?: string
                    content?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            tv_logs: {
                Row: {
                    id: string
                    user_id: string
                    imdb_id: string
                    title: string
                    poster_url: string | null
                    rating: number | null
                    notes: string | null
                    status: "completed" | "planning" | "watching"
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    imdb_id: string
                    title: string
                    poster_url?: string | null
                    rating?: number | null
                    notes?: string | null
                    status?: "completed" | "planning" | "watching"
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    imdb_id?: string
                    title?: string
                    poster_url?: string | null
                    rating?: number | null
                    notes?: string | null
                    status?: "completed" | "planning" | "watching"
                    created_at?: string
                }
            }
            profiles: {
                Row: {
                    id: string
                    username: string
                    bio: string | null
                    location_label: string | null
                    avatar_url: string | null
                    cover_photo_url: string | null
                    social_x: string | null
                    social_instagram: string | null
                    social_tiktok: string | null
                    social_snapchat: string | null
                    social_spotify: string | null
                    social_email: string | null
                    social_website: string | null
                    pinned_movie_id: string | null
                    pinned_book_id: string | null
                    pinned_tv_id: string | null
                    updated_at: string
                    created_at: string
                }
                Insert: {
                    id: string
                    username: string
                    bio?: string | null
                    location_label?: string | null
                    avatar_url?: string | null
                    cover_photo_url?: string | null
                    social_x?: string | null
                    social_instagram?: string | null
                    social_tiktok?: string | null
                    social_snapchat?: string | null
                    social_spotify?: string | null
                    social_email?: string | null
                    social_website?: string | null
                    pinned_movie_id?: string | null
                    pinned_book_id?: string | null
                    pinned_tv_id?: string | null
                    updated_at?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    username?: string
                    bio?: string | null
                    location_label?: string | null
                    cover_photo_url?: string | null
                    pinned_movie_id?: string | null
                    pinned_book_id?: string | null
                    pinned_tv_id?: string | null
                    updated_at?: string
                    created_at?: string
                }
            }
            guestbook: {
                Row: {
                    id: string
                    profile_owner_id: string
                    author_id: string
                    message: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    profile_owner_id: string
                    author_id: string
                    message: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    profile_owner_id?: string
                    author_id?: string
                    message?: string
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
