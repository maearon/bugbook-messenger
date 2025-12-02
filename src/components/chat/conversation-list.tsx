"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { useSocket } from "@/lib/socket/socket-context"
import { SOCKET_EVENTS } from "@/lib/socket/socket-server"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
// import type { ConversationWithDetails } from "@/lib/db/models"
import { formatDistanceToNow } from "date-fns"
import { ConversationWithDetails } from "@/types/chat"
import { LoadingDots } from "../products/enhanced-product-form"
import { useRouter } from "next/navigation"

interface ConversationListProps {
  selectedConversationId?: string
  onSelectConversation: (conversationId: string) => void
}

export function ConversationList({ selectedConversationId, onSelectConversation }: ConversationListProps) {
  const { accessToken } = useAuth()
  const { socket } = useSocket()
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // -------------- FIX REDIRECT ERROR --------------
  useEffect(() => {
    if (!accessToken) {
      router.push("/login")
    }
  }, [accessToken, router])
  // ------------------------------------------------

  useEffect(() => {
    fetchConversations()

    if (socket) {
      socket.on(SOCKET_EVENTS.MESSAGE_NEW, () => {
        fetchConversations()
      })

      return () => {
        socket.off(SOCKET_EVENTS.MESSAGE_NEW)
      }
    }
  }, [socket])

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/conversations", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error("[v0] Fetch conversations error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <p className="p-4 text-center text-sm text-gray-500">Loading conversations..<LoadingDots /></p>
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 px-2 pb-4">
        {conversations.length === 0 ? (
          <p className="p-4 text-center text-sm text-gray-500">No conversations yet</p>
        ) : (
          conversations.map((conversation) => {
            const otherUser = conversation.otherParticipants?.[0]
            const displayName = conversation.type === "group" ? conversation.name : otherUser?.name
            const displayAvatar = conversation.type === "group" ? conversation.avatar : otherUser?.avatar
            const isSelected = selectedConversationId === conversation.id

            return (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all ${
                  isSelected
                    ? "border-2 border-purple-500 bg-purple-50"
                    : "border-2 border-transparent hover:bg-gray-100"
                }`}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={displayAvatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-400 to-fuchsia-400 text-white">
                      {displayName?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online status indicator */}
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900">{displayName}</p>
                    {conversation.lastMessage && (
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: false })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm text-gray-600">
                      {conversation.lastMessage?.content || "No messages yet"}
                    </p>
                    {conversation.unreadCount! > 0 && (
                      <Badge className="h-5 min-w-5 rounded-full bg-purple-600 px-1.5 text-xs text-white">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </ScrollArea>
  )
}
