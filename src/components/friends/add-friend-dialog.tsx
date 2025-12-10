"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Search, Loader2, UserSearch, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { friendService } from "@/api/services/friendService";
import { useAuthStore } from "@/stores/useAuthStore";
import type { User as UserDTO } from "@/lib/auth";
import { getAccessToken } from "@/lib/token";

interface AddFriendDialogProps {
  forProfilePage?: boolean;
}

export function AddFriendDialog({ forProfilePage = false }: AddFriendDialogProps) {
  const { user: userMongo } = useAuthStore();
  const accessToken = getAccessToken();

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<(UserDTO & { isFriend?: boolean; isSelf?: boolean })[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [friends, setFriends] = useState<string[]>([]);

  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  // -----------------------------
  // FETCH FRIEND LIST
  // -----------------------------
  const fetchFriendList = useCallback(async () => {
    try {
      const res = await friendService.getFriends("");
      const ids = res.friends?.map((x: any) => x._id ?? x.id) || [];
      setFriends(ids);
    } catch (err) {
      console.error("[AddFriendDialog] fetchFriendList error:", err);
    }
  }, []);

  // -----------------------------
  // NORMALIZE USER DATA
  // -----------------------------
  const normalizeUsers = useCallback(
    (list: any[]) => {
      return list.map((u: any) => {
        const userId = u.id ?? u._id;
        return {
          ...u,
          id: userId,
          isFriend: friends.includes(userId),
          isSelf: userMongo?.id === userId,
        };
      });
    },
    [friends, userMongo]
  );

  // -----------------------------
  // FETCH USERS (supports q)
  // -----------------------------
  const fetchUsers = useCallback(
    async (q: string) => {
      setIsInitialLoading(true);
      setErrorMessage("");

      try {
        const response = await fetch(`/api/v1/users/search?q=${encodeURIComponent(q)}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          setErrorMessage("Failed to load users");
          return;
        }

        const data = await response.json();
        const normalized = normalizeUsers(data.users || []);
        setSearchResults(normalized);
      } catch (err) {
        console.error("[AddFriendDialog] fetchUsers error:", err);
        setErrorMessage("Something went wrong.");
      } finally {
        setIsInitialLoading(false);
      }
    },
    [accessToken, normalizeUsers]
  );

  // -----------------------------
  // SEARCH
  // -----------------------------
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      fetchUsers("");
      return;
    }

    setIsSearching(true);
    try {
      await fetchUsers(searchQuery);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, fetchUsers]);

  // -----------------------------
  // RELOAD (keep query)
  // -----------------------------
  const handleReload = async () => {
    setIsReloading(true);
    await fetchFriendList();
    await fetchUsers(searchQuery); // ✅ giữ query khi reload
    setIsReloading(false);
  };

  // -----------------------------
  // SEND FRIEND REQUEST
  // -----------------------------
  const handleSendRequest = async (userId: string) => {
    setIsSending(userId);

    if (userId === userMongo?.id) {
      toast.error("Bạn không thể kết bạn với chính mình");
      setIsSending(null);
      return;
    }

    try {
      const res = await friendService.addFriend(userId);

      if (res.status === 201) {
        toast.success(res.data.msg);
        setSearchResults((prev) => prev.filter((u) => u.id !== userId));
      } else {
        toast.error("Something went wrong");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      toast.error(msg || "Something went wrong");
    } finally {
      setIsSending(null);
    }
  };

  // -----------------------------
  // EFFECT WHEN OPEN
  // -----------------------------
  useEffect(() => {
    if (!open) return;

    setErrorMessage("");
    setSearchResults([]);

    const load = async () => {
      await fetchFriendList();
      await fetchUsers(searchQuery); // ✅ load theo query hiện tại
    };

    load();
  }, [open]);

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {forProfilePage ? (
          <Button>
            <UserSearch className="mr-2 h-4 w-4" />
            Add Friend
          </Button>
        ) : (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Friend
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>

          <div className="flex items-center justify-between">
            <DialogDescription>Search for users to send friend requests</DialogDescription>

            <Button variant="ghost" size="icon" onClick={handleReload} disabled={isReloading}>
              <RefreshCw className={`h-4 w-4 ${isReloading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-white text-black dark:bg-neutral-900 dark:text-white"
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {isInitialLoading && (
              // <div className="min-h-[120px] flex items-center justify-center">
              //   <Loader2 className="animate-spin h-6 w-6" />
              // </div>
              <div className="min-h-[120px] flex items-center justify-center">
                <Loader2 className="animate-spin text-purple-600 h-6 w-6" />
              </div>
            )}

            {!isInitialLoading && searchResults.length === 0 && !isSearching && (
              // <p className="text-sm text-muted-foreground text-center py-4">
              //   {searchQuery ? "No users found." : "No suggestions available."}
              // </p>
              <div className="min-h-[120px] flex items-center justify-center">
                <Loader2 className="animate-spin text-purple-600 h-6 w-6" />
              </div>
            )}

            {searchResults.map((user) => (
              <div key={user.id} className="flex items-center gap-3 rounded-lg border p-3">
                <Avatar>
                  <AvatarImage src={user.image || "/avatar-placeholder.png"} />
                  <AvatarFallback>{user.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>

                  {user.isSelf && <span className="text-xs text-green-600 font-medium">Self</span>}
                  {user.isFriend && !user.isSelf && (
                    <span className="text-xs text-green-600 font-medium">Friend</span>
                  )}
                </div>

                <Button size="sm" onClick={() => handleSendRequest(user.id)} disabled={isSending === user.id}>
                  {isSending === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
