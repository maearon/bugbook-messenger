"use client";

import type { Conversation } from "@/types/chat";
import ChatCard from "./ChatCard";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { cn } from "@/lib/utils";
import UserAvatar from "./UserAvatar";
import StatusBadge from "./StatusBadge";
import UnreadCountBadge from "./UnreadCountBadge";
import { useSocketStore } from "@/stores/useSocketStore";
import { parseEmoji } from "@/lib/emoji";
import TypingDots from "./TypingDots";

const DirectMessageCard = ({ convo }: { convo: Conversation }) => {
  const { user } = useAuthStore();
  const { activeConversationId, setActiveConversation, messages, fetchMessages } =
    useChatStore();
  const { onlineUsers, typingUsers } = useSocketStore();

  if (!user) return null;

  // user còn lại trong direct chat
  const otherUser = convo.participants.find((p) => p._id !== user._id);
  if (!otherUser) return null;

  const unreadCount = convo.unreadCounts?.[user._id] ?? 0;

  /**
   * ✅ CÁCH LÀM ĐƠN GIẢN – KHÔNG ĐỤNG sender._id
   * - Chỉ hiển thị content
   * - Không suy đoán ai gửi
   */
  // const lastMessage = parseEmoji(convo.lastMessage?.content ?? "");
  const rawLastMessage = convo.lastMessage;

  const senderId =
    typeof rawLastMessage?.sender._id === "string"
      ? rawLastMessage?.sender._id
      : rawLastMessage?.sender._id;

  const lastMessageContent = parseEmoji(rawLastMessage?.content ?? "");

  const lastMessageText =
    senderId === user._id
      ? `Bạn: ${lastMessageContent}`
      : lastMessageContent;

  const handleSelectConversation = async (id: string) => {
    setActiveConversation(id);
    if (!messages[id]) {
      await fetchMessages();
    }
  };

  // typing
  const typingUserIds = typingUsers[convo._id] || [];
  const isTyping = typingUserIds.length > 0;

  return (
    <ChatCard
      convoId={convo._id}
      name={otherUser.displayName ?? ""}
      timestamp={
        convo.lastMessage?.createdAt
          ? new Date(convo.lastMessage.createdAt)
          : undefined
      }
      isActive={activeConversationId === convo._id}
      onSelect={handleSelectConversation}
      unreadCount={unreadCount}
      leftSection={
        <>
          <UserAvatar
            type="sidebar"
            name={otherUser.displayName ?? ""}
            avatarUrl={otherUser.avatarUrl ?? undefined}
          />
          <StatusBadge
            status={
              onlineUsers.includes(otherUser?._id ?? "") ? "online" : "offline"
            }
          />
          {unreadCount > 0 && (
            <UnreadCountBadge unreadCount={unreadCount} />
          )}
        </>
      }
      // subtitle={
      //   <p
      //     className={cn(
      //       "text-sm truncate",
      //       unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground"
      //     )}
      //   >
      //     {lastMessage}
      //   </p>
      // }
      subtitle={
        <p
          className={cn(
            "text-sm truncate",
            isTyping
              ? "text-primary"
              : unreadCount > 0
              ? "font-medium text-foreground"
              : "text-muted-foreground"
          )}
        >
          {isTyping ? <TypingDots /> : lastMessageText}
        </p>
      }
    />
  );
};

export default DirectMessageCard;
