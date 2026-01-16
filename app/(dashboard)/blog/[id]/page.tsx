"use client";

import { useEffect, useState, use } from "react";
import { Loader2 } from "lucide-react";
import BlogEditor from "@/components/blog/blog-editor";

interface BlogPost {
    id: string;
    title: string;
    content: string;
    cover_image: string | null;
    excerpt: string | null;
    published: boolean;
    created_at: string;
}

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params in Next.js 15+
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
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="animate-spin text-chart-4" size={40} />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="flex items-center justify-center h-[50vh] text-muted-foreground">
                {error || "Post not found"}
            </div>
        );
    }

    return <BlogEditor initialData={post} />;
}
