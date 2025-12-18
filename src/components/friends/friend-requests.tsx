"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, X } from "lucide-react"
import { friendService } from "@/api/services/friendService"
import { toast } from "sonner"

/* ===================== TYPES ===================== */

interface FriendRequestUI {
  id: string
  sender: {
    id: string
    username: string
    name: string
    displayName?: string
    email?: string
    avatar?: string
  }
  createdAt: string
}

interface FriendRequestRaw {
  _id: string
  from: {
    id: string
    username?: string
    name?: string
    displayName?: string
    email?: string
    avatar?: string
  }
  to: {
    id: string
    username?: string
    name?: string
    displayName?: string
    email?: string
    avatar?: string
  }
  message: string
  createdAt: string
  updatedAt: string
}

interface FriendRequestsResponse {
  received: FriendRequestRaw[]
  sent: FriendRequestRaw[]
}

/* ===================== PAGE ===================== */

export function FriendRequestsPage() {
  const [receivedRequests, setReceivedRequests] = useState<FriendRequestUI[]>([])
  const [sentRequests, setSentRequests] = useState<FriendRequestUI[]>([])
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received")

  const [isLoading, setIsLoading] = useState(false)
  const [isReloading, setIsReloading] = useState(false)

  /* ---------- FORCE LOADING >= 3s ---------- */
  const fetchWithDelay = async (fetcher: () => Promise<void>) => {
    setIsLoading(true)
    const start = Date.now()

    try {
      await fetcher()
    } catch (e) {
      console.error("Fetcher error:", e)
    }

    const elapsed = Date.now() - start
    const wait = 3000 - elapsed
    if (wait > 0) await new Promise((r) => setTimeout(r, wait))

    setIsLoading(false)
    setIsReloading(false)
  }

  /* ---------- LOAD DATA ---------- */
  const loadRequests = async () => {
    try {
      const res: FriendRequestsResponse =
        await friendService.getFriendRequests()

      const received = (res.received || []).map(
        (r): FriendRequestUI => ({
          id: r._id,
          sender: {
            id: r.from?.id || "",
            name: r.from?.name || r.from?.displayName || "Unknown",
            username: r.from?.username || "unknown",
            email: r.from?.email || "unknown",
            avatar: r.from?.avatar,
          },
          createdAt: r.createdAt,
        })
      )

      const sent = (res.sent || []).map(
        (r): FriendRequestUI => ({
          id: r._id,
          sender: {
            id: r.to?.id || "",
            name: r.to?.name || r.to?.displayName || "Unknown",
            username: r.to?.username || "unknown",
            email: r.to?.email || "unknown",
            avatar: r.to?.avatar,
          },
          createdAt: r.createdAt,
        })
      )

      setReceivedRequests(received)
      setSentRequests(sent)
    } catch (e) {
      console.error("loadRequests error:", e)
      setReceivedRequests([])
      setSentRequests([])
    }
  }

  /* ---------- EFFECTS ---------- */
  useEffect(() => {
    fetchWithDelay(loadRequests)
  }, [])

  useEffect(() => {
    fetchWithDelay(loadRequests)
  }, [activeTab])

  const reloadData = () => {
    setIsReloading(true)
    fetchWithDelay(loadRequests)
  }

  /* ---------- ACCEPT / DECLINE ---------- */
  const handleRequest = async (id: string, action: "accept" | "decline") => {
    try {
      await friendService.responseFriendRequest(id, action)

      toast.success(
        action === "accept"
          ? "Accepted friend request!"
          : "Declined friend request!"
      )

      setReceivedRequests((prev) => prev.filter((r) => r.id !== id))
      setSentRequests((prev) => prev.filter((r) => r.id !== id))
    } catch (e: any) {
      console.error("handleRequest error:", e)
      toast.error(e?.response?.data?.message || "Action failed")
    }
  }

  const data = activeTab === "received" ? receivedRequests : sentRequests

  /* ===================== RENDER ===================== */

  return (
    <div className="relative mx-auto w-full h-full rounded-2xl bg-card p-0 shadow-xl">
      {/* Close button (optional) */}
      <button className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
        <X className="h-5 w-5" />
      </button>

      {/* Header */}
      <div className="p-6 pb-3">
        <h2 className="text-lg font-semibold">Lời mời kết bạn</h2>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Quản lý yêu cầu kết bạn đã gửi và đã nhận.
          </p>

          <Button
            variant="ghost"
            size="icon"
            onClick={reloadData}
            disabled={isReloading}
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isReloading ? "animate-spin" : ""
              }`}
            />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 rounded-xl bg-muted p-1">
          <button
            disabled={isLoading}
            onClick={() => setActiveTab("received")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm ${
              activeTab === "received"
                ? "bg-background shadow"
                : "text-muted-foreground"
            }`}
          >
            Đã nhận
          </button>

          <button
            disabled={isLoading}
            onClick={() => setActiveTab("sent")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm ${
              activeTab === "sent"
                ? "bg-background shadow"
                : "text-muted-foreground"
            }`}
          >
            Đã gửi
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 max-h-[420px] overflow-y-auto pb-6">
          {isLoading ? (
            <div className="min-h-[120px] flex items-center justify-center">
              <Loader2 className="animate-spin text-purple-600 h-6 w-6" />
            </div>
          ) : data.length === 0 ? (
            <div className="min-h-[120px] flex items-center justify-center">
              <p className="text-muted-foreground">
                Không có lời mời kết bạn.
              </p>
            </div>
          ) : (
            data.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 border p-4 rounded-xl"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={r.sender.avatar || "/avatar-placeholder.png"}
                  />
                  <AvatarFallback>
                    {r.sender.name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <p className="font-semibold">{r.sender.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {r.sender.email}
                  </p>
                </div>

                <div className="flex gap-2">
                  {activeTab === "received" && (
                    <Button
                      size="sm"
                      className="border-2 border-purple-600 text-purple-600 bg-background"
                      onClick={() =>
                        handleRequest(r.id, "accept")
                      }
                    >
                      Chấp nhận
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      handleRequest(r.id, "decline")
                    }
                  >
                    Từ chối
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
