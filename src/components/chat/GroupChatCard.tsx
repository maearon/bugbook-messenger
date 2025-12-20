"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/chat";
import ChatCard from "./ChatCard";
import UnreadCountBadge from "./UnreadCountBadge";
import GroupChatAvatar from "./GroupChatAvatar";
import { useSocketStore } from "@/stores/useSocketStore";
import TypingDots from "./TypingDots";
import { parseEmoji } from "@/lib/emoji";

const GroupChatCard = ({ convo }: { convo: Conversation }) => {
  const { typingUsers } = useSocketStore();
  const { user } = useAuthStore();
  const {
    activeConversationId,
    setActiveConversation,
    messages,
    fetchMessages,
  } = useChatStore();

  if (!user) return null;

  const unreadCount = convo.unreadCounts?.[user._id] ?? 0;
  const name = convo.group?.name ?? "";

  const handleSelectConversation = async (id: string) => {
    setActiveConversation(id);
    if (!messages[id]) {
      await fetchMessages();
    }
  };

  /* =======================
   * Last message normalize
   * ======================= */
  const rawLastMessage = convo.lastMessage;

  const lastMessageContent = parseEmoji(rawLastMessage?.content ?? "");

  // Ưu tiên sender._id → fallback senderId
  const senderId =
    rawLastMessage?.sender?._id ??
    (typeof (rawLastMessage as any)?.senderId === "string"
      ? (rawLastMessage as any).senderId
      : (rawLastMessage as any)?.senderId?._id);

  const sender = convo.participants.find((p) => p._id === senderId);

  const isOwnMessage = senderId === user._id;

  const prefix = isOwnMessage
    ? "Bạn: "
    : sender?.displayName
    ? `${sender.displayName}: `
    : "Bạn: ";

  /* =======================
   * Typing state
   * ======================= */
  const typingUserIds =
    (typingUsers[convo._id] ?? []).filter((id) => id !== user._id);

  const isTyping = typingUserIds.length > 0;

  return (
    <ChatCard
      convoId={convo._id}
      name={name}
      timestamp={
        rawLastMessage?.createdAt
          ? new Date(rawLastMessage.createdAt)
          : undefined
      }
      isActive={activeConversationId === convo._id}
      onSelect={handleSelectConversation}
      unreadCount={unreadCount}
      leftSection={
        <>
          {unreadCount > 0 && (
            <UnreadCountBadge unreadCount={unreadCount} />
          )}
          <GroupChatAvatar
            participants={convo.participants}
            type="chat"
          />
        </>
      }
      // subtitle={
      //   <p className="text-sm truncate text-muted-foreground">
      //     {convo.participants.length} thành viên
      //   </p>
      // }
      subtitle={
        <p className="text-sm truncate text-muted-foreground">
          {isTyping ? (
            <TypingDots />
          ) : rawLastMessage ? (
            <>
              <span 
                // className="font-medium"
              >{prefix}</span>
              {lastMessageContent} ({convo.participants.length}) thành viên
            </>
          ) : (
            `${convo.participants.length} thành viên`
          )}
        </p>
      }
    />
  );
};

export default GroupChatCard;
