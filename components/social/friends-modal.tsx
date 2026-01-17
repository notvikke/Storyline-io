"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, UserPlus, Check, X } from "lucide-react";
import Link from "next/link";
import {
    getFriendsList,
    getPendingRequests,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    checkFriendshipStatus
} from "@/actions/social";

interface FriendsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function FriendsModal({ open, onOpenChange }: FriendsModalProps) {
    const [activeTab, setActiveTab] = useState("friends");
    const [friends, setFriends] = useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);

    // Load friends and pending requests
    useEffect(() => {
        if (open) {
            loadData();
        }
    }, [open]);

    const loadData = async () => {
        setLoading(true);
        const [friendsRes, pendingRes] = await Promise.all([
            getFriendsList(),
            getPendingRequests()
        ]);

        if (friendsRes.success) setFriends(friendsRes.data || []);
        if (pendingRes.success) setPendingRequests(pendingRes.data || []);
        setLoading(false);
    };

    // Search users
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setSearchLoading(true);
                const res = await searchUsers(searchQuery);
                if (res.success && res.data) {
                    // Check friendship status for each result
                    const resultsWithStatus = await Promise.all(
                        res.data.map(async (user: any) => {
                            const statusRes = await checkFriendshipStatus(user.id);
                            return {
                                ...user,
                                friendshipStatus: statusRes.success ? statusRes.status : "none"
                            };
                        })
                    );
                    setSearchResults(resultsWithStatus);
                }
                setSearchLoading(false);
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSendRequest = async (userId: string) => {
        const res = await sendFriendRequest(userId);
        if (res.success) {
            // Update search results
            setSearchResults(prev =>
                prev.map(u => u.id === userId ? { ...u, friendshipStatus: "sent" } : u)
            );
        }
    };

    const handleAccept = async (friendshipId: string) => {
        const res = await acceptFriendRequest(friendshipId);
        if (res.success) {
            await loadData();
        }
    };

    const handleReject = async (friendshipId: string) => {
        const res = await rejectFriendRequest(friendshipId);
        if (res.success) {
            await loadData();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                        Friends
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="friends">
                            My Friends
                            {friends.length > 0 && (
                                <span className="ml-2 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-500 text-xs">
                                    {friends.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="pending">
                            Pending
                            {pendingRequests.length > 0 && (
                                <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 text-xs animate-pulse">
                                    {pendingRequests.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="add">Add Friend</TabsTrigger>
                    </TabsList>

                    {/* My Friends Tab */}
                    <TabsContent value="friends" className="flex-1 overflow-y-auto mt-0">
                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <Loader2 className="animate-spin text-purple-500" size={32} />
                            </div>
                        ) : friends.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground mb-2">No friends yet</p>
                                <p className="text-sm text-muted-foreground">Search to add someone!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {friends.map((friend) => (
                                    <Link
                                        key={friend.id}
                                        href={`/u/${friend.username}`}
                                        onClick={() => onOpenChange(false)}
                                        className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
                                    >
                                        <Avatar className="w-12 h-12 border-2 border-purple-500/20">
                                            <AvatarImage src={friend.avatar_url} />
                                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                                {friend.username?.[0]?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="font-semibold group-hover:text-purple-500 transition-colors">
                                                {friend.username}
                                            </p>
                                            <p className="text-xs text-muted-foreground">View Profile</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Pending Requests Tab */}
                    <TabsContent value="pending" className="flex-1 overflow-y-auto mt-0">
                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <Loader2 className="animate-spin text-purple-500" size={32} />
                            </div>
                        ) : pendingRequests.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No pending requests</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingRequests.map((request) => (
                                    <div
                                        key={request.friendshipId}
                                        className="flex items-center gap-3 p-4 rounded-lg border border-border"
                                    >
                                        <Avatar className="w-12 h-12 border-2 border-purple-500/20">
                                            <AvatarImage src={request.avatar_url} />
                                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                                {request.username?.[0]?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="font-semibold">{request.username}</p>
                                            <p className="text-xs text-muted-foreground">wants to be friends</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleAccept(request.friendshipId)}
                                                className="bg-green-500 hover:bg-green-600 text-white"
                                            >
                                                <Check size={16} />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleReject(request.friendshipId)}
                                            >
                                                <X size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Add Friend Tab */}
                    <TabsContent value="add" className="flex-1 overflow-y-auto mt-0">
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <Input
                                    placeholder="Search by username..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {searchLoading ? (
                                <div className="flex items-center justify-center h-40">
                                    <Loader2 className="animate-spin text-purple-500" size={32} />
                                </div>
                            ) : searchQuery.length < 2 ? (
                                <div className="text-center py-12 text-muted-foreground text-sm">
                                    Type at least 2 characters to search
                                </div>
                            ) : searchResults.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    No users found
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {searchResults.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center gap-3 p-4 rounded-lg border border-border"
                                        >
                                            <Avatar className="w-12 h-12 border-2 border-purple-500/20">
                                                <AvatarImage src={user.avatar_url} />
                                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                                    {user.username?.[0]?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-semibold">{user.username}</p>
                                            </div>
                                            {user.friendshipStatus === "friends" ? (
                                                <Button size="sm" disabled variant="outline">
                                                    <Check size={16} className="mr-1" />
                                                    Friends
                                                </Button>
                                            ) : user.friendshipStatus === "sent" ? (
                                                <Button size="sm" disabled variant="outline">
                                                    Request Sent
                                                </Button>
                                            ) : user.friendshipStatus === "pending" ? (
                                                <Button size="sm" disabled variant="outline">
                                                    Pending
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSendRequest(user.id)}
                                                    className="bg-purple-500 hover:bg-purple-600 text-white"
                                                >
                                                    <UserPlus size={16} className="mr-1" />
                                                    Add Friend
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
