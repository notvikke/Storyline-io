"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Loader2, BookOpen } from "lucide-react";
import BlogCard from "@/components/blog/blog-card";

interface BlogPost {
    id: string;
    title: string;
    excerpt: string | null;
    content: string;
    cover_image: string | null;
    published: boolean;
    created_at: string;
}

export default function BlogListPage() {
    const { user, isLoaded } = useUser();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            if (!user) return;
            try {
                const res = await fetch("/api/blogs");
                if (res.ok) {
                    const data = await res.json();
                    setPosts(data);
                }
            } catch (error) {
                console.error("Failed to fetch posts", error);
            } finally {
                setLoading(false);
            }
        };

        if (isLoaded && user) {
            fetchPosts();
        } else if (isLoaded && !user) {
            setLoading(false);
        }
    }, [isLoaded, user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="animate-spin text-chart-4" size={40} />
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-6xl p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-1">My Stories</h1>
                    <p className="text-muted-foreground">Share your journey with the world</p>
                </div>

                <Link
                    href="/blog/new"
                    className="flex items-center gap-2 px-4 py-2 bg-chart-4 text-white rounded-full hover:bg-chart-4/90 transition-all font-medium shadow-lg hover:shadow-chart-4/20"
                >
                    <Plus size={18} />
                    Write New
                </Link>
            </div>

            {posts.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-border rounded-xl bg-muted/20">
                    <BookOpen className="mx-auto text-muted-foreground mb-4" size={48} />
                    <h2 className="text-xl font-semibold mb-2">No stories yet</h2>
                    <p className="text-muted-foreground mb-6">Start documenting your adventures today.</p>
                    <Link
                        href="/blog/new"
                        className="inline-flex items-center gap-2 text-chart-4 hover:underline"
                    >
                        Create your first post
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <BlogCard key={post.id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
}
