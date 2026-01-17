"use client";

import { useEffect, useState, use } from "react";
import { Loader2, Calendar, ArrowLeft } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import BlogEditor from "@/components/blog/blog-editor";

interface BlogPost {
    id: string;
    user_id: string;
    title: string;
    content: string;
    cover_image: string | null;
    excerpt: string | null;
    published: boolean;
    created_at: string;
    published_at: string | null;
}

export default function BlogPage({ params }: { params: Promise<{ id: string }> }) {
    const { user } = useUser();
    const resolvedParams = use(params);
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await fetch(`/api/blogs/${resolvedParams.id}`);
                if (!res.ok) throw new Error("Failed to fetch post");
                const data = await res.json();
                setPost(data);
            } catch (err) {
                console.error(err);
                setError("Post not found");
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [resolvedParams.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="animate-spin text-chart-4" size={40} />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-center">
                <h1 className="text-2xl font-bold mb-2">Post not found</h1>
                <p className="text-muted-foreground mb-6">{error || "This blog post doesn't exist."}</p>
                <Link href="/blog" className="text-chart-4 hover:underline">
                    Go back to blogs
                </Link>
            </div>
        );
    }

    // Check if the current user is the owner
    const isOwner = user?.id === post.user_id;

    // If owner, show the editor
    if (isOwner) {
        return <BlogEditor initialData={post} />;
    }

    // Otherwise, show read-only view
    return (
        <div className="min-h-screen bg-background">
            {/* Cover Image */}
            {post.cover_image && (
                <div className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden">
                    <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                </div>
            )}

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 py-8 -mt-20 relative z-10">
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Blogs
                </Link>

                <article className="bg-card border border-border rounded-2xl p-6 md:p-10 shadow-xl">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">{post.title}</h1>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8 pb-6 border-b border-border">
                        <Calendar size={16} />
                        <time dateTime={post.published_at || post.created_at}>
                            {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </time>
                    </div>

                    <div
                        className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-chart-4 prose-img:rounded-lg"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </article>
            </div>
        </div>
    );
}
