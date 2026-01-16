import Link from "next/link";
import { Calendar, EyeOff } from "lucide-react";

interface BlogPost {
    id: string;
    title: string;
    excerpt: string | null;
    content: string; // fallback if excerpt missing
    cover_image: string | null;
    published: boolean;
    created_at: string;
}

export default function BlogCard({ post }: { post: BlogPost }) {
    const excerpt = post.excerpt || post.content.substring(0, 150) + "...";

    return (
        <Link
            href={`/blog/${post.id}`}
            className="group relative flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:border-chart-4/50 h-full"
        >
            {/* Cover Image */}
            <div className="relative h-48 bg-muted overflow-hidden">
                {post.cover_image ? (
                    <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-chart-4/10 text-chart-4 font-bold text-3xl">
                        {post.title.charAt(0)}
                    </div>
                )}

                {/* Status Badge */}
                {!post.published && (
                    <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                        <EyeOff size={12} /> Draft
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 p-4 flex flex-col">
                <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-chart-4 transition-colors">
                    {post.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                    {excerpt}
                </p>

                <div className="flex items-center text-xs text-muted-foreground mt-auto pt-4 border-t border-border/50">
                    <Calendar size={12} className="mr-1" />
                    {new Date(post.created_at).toLocaleDateString()}
                </div>
            </div>
        </Link>
    );
}
