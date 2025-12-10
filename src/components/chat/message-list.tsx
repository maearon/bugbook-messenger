"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useSocket } from "@/lib/socket/socket-context";
import { SOCKET_EVENTS } from "@/lib/socket/socket-server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { MessageWithSender } from "@/types/chat/models";

interface MessageListProps {
  conversationId: string;
}

export function MessageList({ conversationId }: MessageListProps) {
  const { user, accessToken } = useAuth();
  const { socket } = useSocket();

  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // REAL scroll container ref (div)
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 🔽 Auto scroll
  const scrollToBottom = () => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  // --------------------------------------------
  // FETCH MESSAGES
  // --------------------------------------------
  const fetchMessages = useCallback(async () => {
    if (!accessToken) return;

    try {
      const response = await fetch(
        `https://node-boilerplate-pww8.onrender.com/v1/conversations/${conversationId}/messages`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!response.ok) return;

      const data = await response.json();
      setMessages(data.messages);
    } catch (err) {
      console.error("[MessageList] fetchMessages error:", err);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 50);
    }
  }, [conversationId, accessToken]);

  // --------------------------------------------
  // MARK AS SEEN
  // --------------------------------------------
  const markAsSeen = useCallback(async () => {
    if (!accessToken) return;

    try {
      await fetch(
        `https://node-boilerplate-pww8.onrender.com/v1/conversations/${conversationId}/seen`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
    } catch (err) {
      console.error("[MessageList] markAsSeen error:", err);
    }
  }, [conversationId, accessToken]);

  // --------------------------------------------
  // LOAD messages when conversation changes
  // --------------------------------------------
  useEffect(() => {
    if (!conversationId) return;
    fetchMessages();
    markAsSeen();

    if (!socket) return;

    socket.emit(SOCKET_EVENTS.CONVERSATION_JOIN, { conversationId });

    const handler = (newMessage: MessageWithSender) => {
      if (newMessage.conversationId !== conversationId) return;

      setMessages((prev) => [...prev, newMessage]);
      markAsSeen();
      setTimeout(scrollToBottom, 50);
    };

    socket.on(SOCKET_EVENTS.MESSAGE_NEW, handler);

    return () => {
      socket.emit(SOCKET_EVENTS.CONVERSATION_LEAVE, { conversationId });
      socket.off(SOCKET_EVENTS.MESSAGE_NEW, handler);
    };
  }, [conversationId, socket, fetchMessages, markAsSeen]);

  // --------------------------------------------
  // RENDER
  // --------------------------------------------
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        Loading messages...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 bg-background p-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src="/avatar-placeholder.png" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Đang chat
          </h3>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs text-gray-500">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 bg-background p-4">
        <div className="h-full" ref={scrollContainerRef}>
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwnMessage = message.senderId === user?.id;

              return (
                <div
                  key={message._id || message.id}
                  className={`flex gap-3 ${
                    isOwnMessage ? "flex-row-reverse" : ""
                  }`}
                >
                  {!isOwnMessage && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={message.sender?.avatar || "/placeholder.svg"}
                      />
                      <AvatarFallback>
                        {message.sender?.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`flex max-w-[70%] flex-col ${
                      isOwnMessage ? "items-end" : ""
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isOwnMessage
                          ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white"
                          : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      {/* IMAGE */}
                      {message.type === "image" && message.fileUrl && (
                        <img
                          src={message.fileUrl}
                          alt="Shared"
                          className="mb-2 max-w-full rounded-lg"
                        />
                      )}

                      {/* FILE */}
                      {message.type === "file" && message.fileUrl && (
                        <a
                          href={message.fileUrl}
                          target="_blank"
                          className="mb-2 block underline"
                        >
                          {message.fileName || "Tải file"}
                        </a>
                      )}

                      {/* CONTENT */}
                      <p className="break-words">{message.content}</p>
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-xs text-gray-500">
                        {format(
                          new Date(message.createdAt),
                          "HH:mm"
                        )}
                      </p>

                      {isOwnMessage && (
                        <span className="text-xs text-purple-600">seen</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
