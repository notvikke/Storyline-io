
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface GuestbookProps {
    profileId: string;
}

export function Guestbook({ profileId }: GuestbookProps) {
    const { user } = useUser();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/guestbook?profileId=${profileId}`);
            if (!res.ok) throw new Error("Failed to fetch messages");
            const data = await res.json();
            setMessages(data || []);
        } catch (error) {
            console.error("Error fetching guestbook:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (profileId) fetchMessages();
    }, [profileId]);

    const handleSubmit = async () => {
        if (!user || !newMessage.trim()) return;
        setSubmitting(true);
        try {
            const response = await fetch("/api/guestbook", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    profile_owner_id: profileId,
                    author_id: user.id,
                    message: newMessage.trim(),
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to sign guestbook");
            }

            setNewMessage("");
            fetchMessages();
        } catch (error) {
            console.error("Error signing guestbook:", error);
            alert("Could not sign guestbook. Make sure you have created your own profile first!");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this message?")) return;
        try {
            const response = await fetch(`/api/guestbook?id=${id}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Failed to delete");

            fetchMessages();
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold font-serif mb-2">Sign the Guestbook</h2>
                <p className="text-muted-foreground">Leave a note for the traveler.</p>
            </div>

            {/* Input Form */}
            {user ? (
                <div className="bg-muted/30 p-4 rounded-lg border border-dashed border-muted relative">
                    <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="bg-background min-h-[100px] pr-12"
                        maxLength={500}
                    />
                    <div className="absolute bottom-6 right-6">
                        <Button
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={handleSubmit}
                            disabled={submitting || !newMessage.trim()}
                        >
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <p className="text-sm">Please sign in to leave a message.</p>
                </div>
            )}

            {/* Message List */}
            <div className="grid gap-4">
                {messages.map((msg) => (
                    <div key={msg.id} className="group relative bg-background/50 backdrop-blur-sm border p-4 rounded-xl shadow-sm hover:shadow-md transition-all">
                        <div className="flex gap-3 items-start">
                            {/* We don't have avatar_url in profiles schema yet, using a placeholder or constructing it */}
                            <Avatar className="h-10 w-10 border">
                                <AvatarFallback>{msg.author?.username?.[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>

                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-sm">@{msg.author?.username || "Unknown"}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-sm leading-relaxed text-foreground/90">{msg.message}</p>
                            </div>

                            {/* Delete Action (Owner or Author) */}
                            {user && (user.id === msg.author_id || user.id === profileId) && (
                                <button
                                    onClick={() => handleDelete(msg.id)}
                                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {!loading && messages.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground italic">
                        No messages yet. Be the first to say hello!
                    </div>
                )}
            </div>
        </div>
    );
}
