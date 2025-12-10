"use client"

import { Conversation } from '@/types/chat'
import { useState } from 'react'
import { Button } from '../ui/button'
import { ImagePlus, Paperclip, Send } from 'lucide-react'
import { Input } from '../ui/input'
import EmojiPicker from './EmojiPicker'
import { toast } from 'sonner'
import { useChatStore } from '@/stores/useChatStore'
import { authClient } from '@/lib/auth-client'
import { useAuthStore } from '@/stores/useAuthStore'

interface MessageInputProps {
  selectedConversation: Conversation
}

const MessageInput = ({ selectedConversation }: MessageInputProps) => {

  const { user: userMongo } = useAuthStore();

  const { data: sessionClient } = authClient.useSession()
  const user = sessionClient?.user ?? null

  const { sendMessage, sendGroupMessage } = useChatStore()

  const [message, setMessage] = useState("")

  if (!user) return null

  const handleSend = async () => {
    if (!message.trim()) return

    const content = message.trim()
    setMessage("")

    try {
      // -----------------------------
      // 🔥 DIRECT MESSAGE
      // -----------------------------
      if (selectedConversation.type === "direct") {

        const participants = selectedConversation.participants
        if (!participants || participants.length !== 2) {
          toast.error("Conversation corrupted: participants invalid.")
          return
        }

        // 👉 FIX: Compare by ID instead of displayName
        const recipient = participants.find(p => p._id !== userMongo?._id)

        if (!recipient) {
          console.error("❌ Cannot determine recipient:", {
            me: user.id,
            participants
          })
          toast.error("Cannot determine recipient.")
          return
        }

        await sendMessage("68ff33481cab3106b6c045eb", content)
      }

      // -----------------------------
      // 🔥 GROUP MESSAGE
      // -----------------------------
      else {
        await sendGroupMessage(selectedConversation._id, content)
      }

    } catch (error) {
      console.error("Failed to send message:", error)
      toast.error("Failed to send message, please try again.")
    } finally {
      // setIsSending(false)  
      // setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-center gap-2 p-3 min-h-[56px] bg-background">
      <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-smooth">
        <Paperclip className="size-4" />
      </Button>
      
      <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-smooth">
        <ImagePlus className="size-4" />
      </Button>

      <div className="flex-1 relative">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="h-9 pr-20 bg-white text-black dark:bg-neutral-900 dark:text-white border-border/50 focus:border-primary/50 transition-smooth"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-8 hover:bg-primary/10 transition-smooth">
            <EmojiPicker onchange={(emoji: string) => setMessage(message + emoji)} />
          </Button>
        </div>
      </div>

      {/* <Button
        size="icon"
        className="bg-gradient-chat hover:shadow-grow transition-smooth hover:scale-105 size-8"
        onClick={handleSend}
        disabled={!message.trim()}
      >
        <Send className="size-4 text-white" />
      </Button> */}
      <Button
        onClick={handleSend}
        disabled={!message.trim()}
        className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 p-0 hover:from-purple-700 hover:to-fuchsia-700"
      >
        <Send className="size-4" />
      </Button>
    </div>
  )
}

export default MessageInput
