"use client"

import { useState } from "react"
import { MessageList } from "@/components/chat/message-list"
import { MessageInput } from "@/components/chat/message-input"
import { MessageCircle } from "lucide-react"

interface ChatWindowLayoutProps {
  selectedConversationId: string | undefined;
}

const ChatWindowLayout = ({ selectedConversationId }: ChatWindowLayoutProps) => {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleMessageSent = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      {selectedConversationId ? (
        <>
          <div className="flex-1 overflow-hidden">
            <MessageList conversationId={selectedConversationId} />
          </div>
          <MessageInput conversationId={selectedConversationId} onMessageSent={handleMessageSent} />
        </>
      ) : (
        <div className="flex h-full flex-col items-center justify-center">
          <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-fuchsia-400">
            <MessageCircle className="h-16 w-16 text-white" />
          </div>
          <h2 className="mb-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-3xl font-bold text-transparent">
            Chào mừng bạn đến với Moji!
          </h2>
          <p className="text-gray-600">Chọn một cuộc hội thoại để bắt đầu chat!</p>
        </div>
      )}
    </div>
  )
}

export default ChatWindowLayout
