"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquarePlus } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
// import type { UserDTO } from "@/lib/db/models"
import type { User as UserDTO  } from "@/lib/auth"

interface NewChatDialogProps {
  onConversationCreated: (conversationId: string) => void
}

export function NewChatDialog({ onConversationCreated }: NewChatDialogProps) {
  const { accessToken } = useAuth()
  const [open, setOpen] = useState(false)
  const [friends, setFriends] = useState<UserDTO[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchFriends()
    }
  }, [open])

  const fetchFriends = async () => {
    try {
      const response = await fetch("/api/friends", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setFriends(data.friends)
      }
    } catch (error) {
      console.error("[v0] Fetch friends error:", error)
    }
  }

  const handleCreateConversation = async (friendId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("https://node-boilerplate-pww8.onrender.com/v1/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          participantIds: [friendId],
          type: "direct",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setOpen(false)
        onConversationCreated(data.conversation.id)
      }
    } catch (error) {
      console.error("[v0] Create conversation error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-12 w-full rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 font-semibold hover:from-purple-700 hover:to-fuchsia-700">
          <MessageSquarePlus className="mr-2 h-5 w-5" />
          Tạo cuộc trò chuyện mới
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">Bắt đầu trò chuyện</DialogTitle>
          <DialogDescription className="text-gray-600">Chọn một người bạn để bắt đầu chat</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {friends.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">Chưa có bạn bè để trò chuyện</p>
          ) : (
            friends.map((friend) => (
              <button
                key={friend.id}
                onClick={() => handleCreateConversation(friend.id)}
                disabled={isLoading}
                className="flex w-full items-center gap-3 rounded-xl border-2 border-gray-200 p-3 transition-all hover:border-purple-500 hover:bg-purple-50"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={friend.image || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-fuchsia-400 text-white">
                    {friend.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">{friend.name}</p>
                  <p className="text-sm text-gray-500">@{friend.name}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
