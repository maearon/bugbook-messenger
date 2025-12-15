// import { type Session } from "@/lib/auth"
// import { getServerSession } from "@/lib/get-session";
// import ChatWidgetClient from "./ChatWidgetClient";

// const ChatWidget = async () => {
//   const session: Session | null = await getServerSession() // Session type-safe

//   if (!session?.user?.email) return null

//   return (
//     <ChatWidgetClient session={session} />
//   )
// }

// export default ChatWidget
"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, X, Minus, Square, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ChatMessage {
  id: string
  content: string
  isAdmin: boolean
  timestamp: Date
  userName: string
  userEmail: string
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: "Xin chào! Chào mừng bạn đến với Moji. Tôi có thể giúp gì cho bạn?",
      isAdmin: true,
      timestamp: new Date(Date.now() - 300000),
      userName: "Admin",
      userEmail: "admin@moji.com",
    },
    {
      id: "2",
      content: "Chào bạn! Tôi muốn hỏi về tính năng chat",
      isAdmin: false,
      timestamp: new Date(Date.now() - 240000),
      userName: "User",
      userEmail: "user@example.com",
    },
    {
      id: "3",
      content:
        "Tất nhiên! Moji hỗ trợ chat thời gian thực, gửi emoji và nhiều tính năng khác. Bạn muốn biết thêm về tính năng nào? :)",
      isAdmin: true,
      timestamp: new Date(Date.now() - 180000),
      userName: "Admin",
      userEmail: "admin@moji.com",
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isMinimized, isOpen])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputMessage.trim()) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      isAdmin: false,
      timestamp: new Date(),
      userName: "User",
      userEmail: "user@example.com",
    }

    setMessages((prev) => [...prev, newMessage])
    setInputMessage("")

    // Simulate admin typing
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      const adminReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Cảm ơn bạn đã nhắn tin! Chúng tôi sẽ phản hồi sớm nhất có thể.",
        isAdmin: true,
        timestamp: new Date(),
        userName: "Admin",
        userEmail: "admin@moji.com",
      }
      setMessages((prev) => [...prev, adminReply])
    }, 2000)
  }

  const emojiMap: Record<string, string> = {
    "<3": "❤️",
    ":)": "😊",
    ":(": "🙁",
    ":P": "👍",
    ":D": "😄",
    ":F": "😛",
  }

  const patterns: Record<string, RegExp> = {
    ":)": /:\)(?!\))/g,
    ":(": /:\((?!\()/g,
    ":P": /:P(?!P)/g,
    ":D": /:D(?!D)/g,
    "<3": /<3(?!3)/g,
    ":F": /:F(?!F)/g,
  }

  function replaceEmojis(text: string): string {
    for (const [symbol, pattern] of Object.entries(patterns)) {
      text = text.replace(pattern, emojiMap[symbol])
    }
    return text
  }

  return (
    <>
      {/* Chat Widget Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white shadow-lg transition hover:from-purple-700 hover:to-fuchsia-700"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all duration-300 ${
            isMinimized
              ? "bottom-6 right-6 h-16 w-80 sm:w-96"
              : "bottom-0 right-0 h-screen w-screen sm:bottom-6 sm:right-6 sm:h-[600px] sm:w-96"
          }`}
        >
          {/* Chat Header */}
          <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-gradient-to-r from-purple-600 to-fuchsia-600 p-4">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                <span className="text-lg font-bold text-purple-600">M</span>
              </div>
              <div className="truncate">
                <h3 className="truncate text-base font-bold leading-none text-white">Moji Support</h3>
                <p className="truncate text-xs text-purple-100">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-400"></span> Online
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="rounded p-1 text-white transition hover:bg-white/20"
              >
                {isMinimized ? <Square className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
              </button>
              <button onClick={() => setIsOpen(false)} className="rounded p-1 text-white transition hover:bg-white/20">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">
                {messages.map((message) => (
                  <div key={message.id} className={message.isAdmin ? "text-left" : "text-right"}>
                    {message.isAdmin ? (
                      <div className="flex items-start space-x-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600">
                          <span className="text-xs font-bold text-white">M</span>
                        </div>
                        <div className="max-w-xs rounded-2xl bg-white p-3 shadow-sm">
                          <p className="text-xs italic text-gray-500">[Admin message]</p>
                          <p className="mt-1 text-sm text-gray-900">{replaceEmojis(message.content)}</p>
                          <p className="mt-1 text-xs text-gray-400">
                            {message.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-end justify-end space-x-2">
                        <div className="max-w-xs rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-600 p-3 shadow-sm">
                          <p className="text-xs italic text-purple-200">[User message]</p>
                          <p className="mt-1 text-sm text-white">{replaceEmojis(message.content)}</p>
                          <p className="mt-1 text-xs text-purple-200">
                            {message.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                          <span className="text-xs font-bold text-gray-700">U</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex items-start space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600">
                      <span className="text-xs font-bold text-white">M</span>
                    </div>
                    <div className="rounded-2xl bg-white p-3 shadow-sm">
                      <div className="flex space-x-1">
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 bg-white p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 rounded-xl border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                  <Button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

