"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Image as ImageIcon, Save, ArrowLeft, MoreVertical, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface BlogPost {
    id: string;
    title: string;
    content: string;
    cover_image: string | null;
    excerpt: string | null;
    published: boolean;
}

interface BlogEditorProps {
    initialData?: BlogPost;
}

export default function BlogEditor({ initialData }: BlogEditorProps) {
    const router = useRouter();
    const [title, setTitle] = useState(initialData?.title || "");
    const [content, setContent] = useState(initialData?.content || "");
    const [coverImage, setCoverImage] = useState(initialData?.cover_image || "");
    const [published, setPublished] = useState(initialData?.published || false);

    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    // Quota info
    const [quotaMsg, setQuotaMsg] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (file: File, isCover: boolean) => {
        setUploading(true);
        setQuotaMsg("");

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                setQuotaMsg(data.error || "Upload failed");
                throw new Error(data.error);
            }

            if (data.success) {
                if (isCover) {
                    setCoverImage(data.url);
                } else {
                    // Append to content
                    setContent(prev => prev + `\n\n![${file.name}](${data.url})\n`);
                }

                if (data.remainingQuota <= 3) {
                    setQuotaMsg(`Warning: Only ${data.remainingQuota} images remaining.`);
                }
            }
        } catch (error: any) {
            console.error(error);
            alert(error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) return;

        setSaving(true);
        try {
            const body = {
                title,
                content,
                cover_image: coverImage || null,
                published,
            };

            const url = initialData?.id
                ? `/api/blogs/${initialData.id}`
                : "/api/blogs";

            const method = initialData?.id ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error("Failed to save post");

            router.push("/blog");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to save post");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header / Toolbar */}
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-muted rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <span className="font-semibold text-muted-foreground">
                        {initialData ? "Edit Post" : "New Post"}
                    </span>
                    <span className="text-xs text-destructive">{quotaMsg}</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
                    >
                        {previewMode ? "Edit" : "Preview"}
                    </button>
                    <button
                        onClick={() => setPublished(!published)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${published ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"}`}
                    >
                        {published ? "Published" : "Draft"}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-foreground text-background font-bold rounded-full hover:opacity-90 transition-all"
                    >
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Save
                    </button>
                </div>
            </div>

            {/* Inputs */}
            <div className="space-y-6 px-4">

                {/* Cover Image */}
                <div className="group relative w-full h-48 md:h-64 bg-muted/40 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden transition-colors hover:bg-muted/60">
                    {coverImage ? (
                        <>
                            <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                            <button
                                onClick={() => setCoverImage("")}
                                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </>
                    ) : (
                        <div className="text-center">
                            <ImageIcon className="mx-auto mb-2 text-muted-foreground" size={32} />
                            <p className="text-sm text-muted-foreground font-medium">Add Cover Image</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">10MB limit</p>
                        </div>
                    )}

                    <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                            if (e.target.files?.[0]) handleImageUpload(e.target.files[0], true);
                        }}
                    />
                    {uploading && <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                        <Loader2 className="animate-spin" />
                    </div>}
                </div>

                {/* Title */}
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Post Title..."
                    className="w-full text-4xl md:text-5xl font-bold bg-transparent border-none placeholder:text-muted-foreground/30 focus:outline-none focus:ring-0"
                />

                {/* Content Editor / Preview */}
                {previewMode ? (
                    <div className="prose dark:prose-invert max-w-none min-h-[50vh] p-4 bg-transparent">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                ) : (
                    <div className="relative min-h-[50vh]">
                        {/* Editor Toolbar (Simple) */}
                        <div className="absolute top-0 right-0 flex items-center gap-2 p-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) handleImageUpload(e.target.files[0], false);
                                }}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="p-2 text-muted-foreground hover:bg-muted rounded-md transition-colors"
                                title="Insert Image"
                            >
                                {uploading ? <Loader2 className="animate-spin" size={16} /> : <ImageIcon size={20} />}
                            </button>
                        </div>

                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Tell your story..."
                            className="w-full h-full min-h-[60vh] resize-none bg-transparent border-none text-lg leading-relaxed placeholder:text-muted-foreground/30 focus:outline-none focus:ring-0 p-0"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
