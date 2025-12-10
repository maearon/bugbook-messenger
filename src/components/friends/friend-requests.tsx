"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2, X, RefreshCw } from "lucide-react"
import { friendService } from "@/api/services/friendService"

// Raw data từ backend
interface FriendRequestRaw {
  _id: string
  from: {
    id: string
    username?: string
    name?: string
    avatar?: string
  }
  to: string
  message: string
  createdAt: string
  updatedAt: string
}

interface FriendRequestsResponse {
  received: FriendRequestRaw[]
  sent: FriendRequestRaw[]
}

// UI type
interface FriendRequestWithSender {
  id: string
  senderId: string
  receiverId: string
  status: string
  createdAt: string
  sender: {
    id: string
    username: string
    name: string
    avatar?: string
  }
}

export function FriendRequests() {
  const { accessToken } = useAuth()

  const [receivedRequests, setReceivedRequests] = useState<FriendRequestWithSender[]>([])
  const [sentRequests, setSentRequests] = useState<FriendRequestWithSender[]>([])
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received")

  const [isLoading, setIsLoading] = useState(true)
  const [isReloading, setIsReloading] = useState(false)

  // Force loading >= 3s
  const fetchWithDelay = async (fetcher: () => Promise<void>) => {
    setIsLoading(true)
    const start = Date.now()

    try {
      await fetcher()
    } catch (e) {
      console.error("fetch error:", e)
    }

    const elapsed = Date.now() - start
    const wait = 3000 - elapsed
    if (wait > 0) await new Promise((r) => setTimeout(r, wait))

    setIsLoading(false)
    setIsReloading(false)
  }

  // ---- LOAD REQUESTS (giống dialog của bạn) ----
  const loadRequests = async () => {
    try {
      const res: FriendRequestsResponse = await friendService.getFriendRequests()

      const received = res.received.map((r) => ({
        id: r._id,
        senderId: r.from.id,
        receiverId: r.to,
        status: "pending",
        createdAt: r.createdAt,
        sender: {
          id: r.from.id,
          name: r.from.name || "Unknown",
          username: r.from.username || "unknown",
          avatar: r.from.avatar,
        },
      }))

      const sent = res.sent.map((r) => ({
        id: r._id,
        senderId: r.from.id,
        receiverId: r.to,
        status: "pending",
        createdAt: r.createdAt,
        sender: {
          id: r.from.id,
          name: r.from.name || "Unknown",
          username: r.from.username || "unknown",
          avatar: r.from.avatar,
        },
      }))

      setReceivedRequests(received)
      setSentRequests(sent)
    } catch (err) {
      console.error("loadRequests error:", err)
      setReceivedRequests([])
      setSentRequests([])
    }
  }

  // Initial load
  useEffect(() => {
    fetchWithDelay(loadRequests)
  }, [])

  // Tab switch reload
  useEffect(() => {
    fetchWithDelay(loadRequests)
  }, [activeTab])

  const reload = () => {
    setIsReloading(true)
    fetchWithDelay(loadRequests)
  }

  // ---- HANDLE ACCEPT / DECLINE ----
  const handleRequest = async (id: string, action: "accept" | "reject") => {
    try {
      await friendService.responseFriendRequest(id, action === "reject" ? "decline" : "accept")

      // remove UI
      setReceivedRequests((prev) => prev.filter((r) => r.id !== id))
      setSentRequests((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      console.error("handleRequest error:", err)
    }
  }

  const data = activeTab === "received" ? receivedRequests : sentRequests

  return (
    <div className="relative w-full rounded-2xl bg-card p-6 shadow-xl">
      {/* Close */}
      <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
        <X className="h-5 w-5" />
      </button>

      {/* Title */}
      <div className="flex items-center justify-between mb-4 mt-4">
        <h2 className="text-xl font-bold text-gray-900">Lời mời kết bạn</h2>

        <Button
          variant="ghost"
          size="icon"
          onClick={reload}
          disabled={isReloading || isLoading}
        >
          <RefreshCw
            className={`h-5 w-5 text-gray-600 ${isReloading ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
        <button
          disabled={isLoading}
          onClick={() => setActiveTab("received")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "received"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Đã nhận
        </button>

        <button
          disabled={isLoading}
          onClick={() => setActiveTab("sent")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "sent"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Đã gửi
        </button>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Loading or empty */}
        <div className="min-h-[248px] flex items-center justify-center">
          {isLoading ? (
            <Loader2 className="text-purple-600 size-8 animate-spin" />
          ) : data.length === 0 ? (
            <p className="py-8 text-center text-gray-500">Không có lời mời kết bạn.</p>
          ) : null}
        </div>

        {/* List */}
        {!isLoading &&
          data.length > 0 &&
          data.map((request) => (
            <div
              key={request.id}
              className="flex items-center gap-3 rounded-xl border border-gray-200 p-4"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={request.sender.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {request.sender.name[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <p className="font-semibold text-gray-900">{request.sender.name}</p>
                <p className="text-sm text-gray-500">@{request.sender.username}</p>
              </div>

              <div className="flex gap-2">
                {activeTab === "received" && (
                  <Button
                    size="sm"
                    onClick={() => handleRequest(request.id, "accept")}
                    className="rounded-full border-2 border-purple-600 bg-white px-4 text-purple-600 hover:bg-purple-50"
                  >
                    Chấp nhận
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRequest(request.id, "reject")}
                  className="rounded-full bg-red-600 px-4 hover:bg-red-700"
                >
                  Từ chối
                </Button>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
