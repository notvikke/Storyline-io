"use server";

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

// Get current user ID helper
async function getCurrentUserId() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    return userId;
}

// Send a friend request
export async function sendFriendRequest(receiverId: string) {
    try {
        const requesterId = await getCurrentUserId();

        // Check if relationship already exists
        const { data: existing } = await supabase
            .from("friendships")
            .select("*")
            .or(`and(requester_id.eq.${requesterId},receiver_id.eq.${receiverId}),and(requester_id.eq.${receiverId},receiver_id.eq.${requesterId})`)
            .single();

        if (existing) {
            if (existing.status === "accepted") {
                return { success: false, error: "Already friends" };
            }
            if (existing.status === "pending") {
                return { success: false, error: "Request already sent" };
            }
        }

        const { data, error } = await supabase
            .from("friendships")
            .insert({
                requester_id: requesterId,
                receiver_id: receiverId,
                status: "pending"
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Accept a friend request
export async function acceptFriendRequest(friendshipId: string) {
    try {
        const userId = await getCurrentUserId();

        const { data, error } = await supabase
            .from("friendships")
            .update({ status: "accepted" })
            .eq("id", friendshipId)
            .eq("receiver_id", userId)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Reject a friend request
export async function rejectFriendRequest(friendshipId: string) {
    try {
        const userId = await getCurrentUserId();

        const { error } = await supabase
            .from("friendships")
            .delete()
            .eq("id", friendshipId)
            .eq("receiver_id", userId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Search users by username
export async function searchUsers(query: string) {
    try {
        const userId = await getCurrentUserId();

        if (!query || query.length < 2) {
            return { success: true, data: [] };
        }

        const { data, error } = await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .ilike("username", `%${query}%`)
            .neq("id", userId)
            .limit(10);

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Get friends list (accepted friendships)
export async function getFriendsList() {
    try {
        const userId = await getCurrentUserId();

        const { data, error } = await supabase
            .from("friendships")
            .select(`
                id,
                requester_id,
                receiver_id,
                created_at
            `)
            .eq("status", "accepted")
            .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);

        if (error) throw error;

        // Get profile details for friends
        const friendIds = (data || []).map((f: any) =>
            f.requester_id === userId ? f.receiver_id : f.requester_id
        );

        if (friendIds.length === 0) {
            return { success: true, data: [] };
        }

        const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .in("id", friendIds);

        if (profilesError) throw profilesError;
        return { success: true, data: profiles || [] };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Get pending requests (incoming)
export async function getPendingRequests() {
    try {
        const userId = await getCurrentUserId();

        const { data, error } = await supabase
            .from("friendships")
            .select(`
                id,
                requester_id,
                created_at
            `)
            .eq("receiver_id", userId)
            .eq("status", "pending");

        if (error) throw error;

        // Get profile details for requesters
        const requesterIds = (data || []).map((f: any) => f.requester_id);

        if (requesterIds.length === 0) {
            return { success: true, data: [] };
        }

        const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .in("id", requesterIds);

        if (profilesError) throw profilesError;

        // Merge friendship data with profile data
        const requests = (data || []).map((req: any) => {
            const profile = profiles?.find((p: any) => p.id === req.requester_id);
            return {
                friendshipId: req.id,
                ...profile
            };
        });

        return { success: true, data: requests };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Check friendship status with a specific user
export async function checkFriendshipStatus(targetUserId: string) {
    try {
        const userId = await getCurrentUserId();

        const { data, error } = await supabase
            .from("friendships")
            .select("*")
            .or(`and(requester_id.eq.${userId},receiver_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},receiver_id.eq.${userId})`)
            .single();

        if (error && error.code !== "PGRST116") throw error;

        if (!data) {
            return { success: true, status: "none" };
        }

        if (data.status === "accepted") {
            return { success: true, status: "friends" };
        }

        if (data.requester_id === userId) {
            return { success: true, status: "sent" };
        }

        return { success: true, status: "pending" };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
