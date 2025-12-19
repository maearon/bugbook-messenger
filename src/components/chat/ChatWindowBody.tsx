"use client"

import { useChatStore } from "@/stores/useChatStore";
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import MessageItem from "./MessageItem";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useSocketStore } from "@/stores/useSocketStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { LoadingDots } from "../products/enhanced-product-form";
import TypingIndicatorMessage from "./TypingIndicatorMessage";

const ChatWindowBody = () => {
  const { user } = useAuthStore();
  const { typingUsers } = useSocketStore(); 
  const {
    activeConversationId,
    conversations,
    messages: allMessages,
    fetchMessages,
  } = useChatStore();
  const [lastMessageStatus, setLastMessageStatus] = useState<"delivered" | "seen">(
    "delivered"
  );

  const messages = allMessages[activeConversationId!]?.items ?? [];
  const reversedMessages = [...messages].reverse();
  const hasMore = allMessages[activeConversationId!]?.hasMore ?? false;
  const selectedConvo = conversations.find((c) => c._id === activeConversationId);
  const key = `chat-scroll-${activeConversationId}`;

  // ref
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("typingUsers:", typingUsers);
    console.log("activeConversationId:", activeConversationId);
  }, [typingUsers, activeConversationId]);

  // seen status
  useEffect(() => {
    const lastMessage = selectedConvo?.lastMessage;
    if (!lastMessage) {
      return;
    }

    const seenBy = selectedConvo?.seenBy ?? [];

    setLastMessageStatus(seenBy.length > 0 ? "seen" : "delivered");
  }, [selectedConvo]);

  // kéo xuống dưới khi load convo
  useLayoutEffect(() => {
    if (!messagesEndRef.current) return;

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeConversationId]);

  const fetchMoreMessages = async () => {
    if (!activeConversationId) {
      return;
    }

    try {
      await fetchMessages(activeConversationId);
    } catch (error) {
      console.error("Lỗi xảy ra khi fetch thêm tin", error);
    }
  };

  const handleScrollSave = () => {
    const container = containerRef.current;
    if (!container || !activeConversationId) {
      return;
    }

    sessionStorage.setItem(
      key,
      JSON.stringify({
        scrollTop: container.scrollTop,
        scrollHeight: container.scrollHeight,
      })
    );
  };

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const item = sessionStorage.getItem(key);

    if (item) {
      const { scrollTop } = JSON.parse(item);
      requestAnimationFrame(() => {
        container.scrollTop = scrollTop;
      });
    }
  }, [messages.length]);

  // const typingUserIds =
  //   typingUsers[activeConversationId ?? ""] ?? [];

  // const isTyping = typingUserIds.length > 0;

  // const typingUserIds =
  //   (typingUsers[activeConversationId ?? ""] ?? []).filter(
  //     (id) => id !== user?._id
  //   );

  // const isTyping = typingUserIds.length > 0;

  // const typingUserIds = typingUsers[convo._id] || [];
  // const isTyping = typingUserIds.length > 0;

  const typingUserIds =
    (typingUsers[activeConversationId ?? ""] ?? []).filter(
      (id) => id !== user?._id // không hiển thị mình đang gõ
    );

  const isTyping = typingUserIds.length > 0;

  if (!selectedConvo) {
    return <ChatWelcomeScreen />;
  }

  if (!messages?.length) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground ">
        Chưa có tin nhắn nào trong cuộc trò chuyện này.
      </div>
    );
  }

  return (
    <div className="p-4 bg-primary-foreground h-full flex flex-col overflow-hidden">
      <div
        id="scrollableDiv"
        ref={containerRef}
        onScroll={handleScrollSave}
        className="flex flex-col-reverse overflow-y-auto overflow-x-hidden beautiful-scrollbar"
      >
        <div ref={messagesEndRef}></div>
        {/* ✅ typing indicator đặt TRƯỚC */}
  {/* {isTyping && (
    <div className="px-2 py-1 text-sm italic text-muted-foreground border-4 border-border/50 rounded-md mb-2">
      <LoadingDots />
    </div>
  )} */}
        <InfiniteScroll
        loader={<p>Đang tải...</p>}
  dataLength={messages.length}
  next={fetchMoreMessages}
  hasMore={hasMore}
  scrollableTarget="scrollableDiv"
  inverse
  style={{
    display: "flex",
    flexDirection: "column-reverse",
    overflow: "visible",
  }}
>
  {/* ✅ Typing indicator như 1 message */}
  {isTyping && (
    <TypingIndicatorMessage
      userName={
        selectedConvo.participants.find(
          (p) => p._id === typingUserIds[0]
        )?.displayName
      }
      avatarUrl={
        selectedConvo.participants.find(
          (p) => p._id === typingUserIds[0]
        )?.avatarUrl || undefined
      }
    />
  )}

  {reversedMessages.map((message, index) => (
    <MessageItem
      key={message._id ?? index}
      message={message}
      index={index}
      messages={reversedMessages}
      selectedConvo={selectedConvo}
      lastMessageStatus={lastMessageStatus}
    />
  ))}
</InfiniteScroll>

        {/* ✅ typing indicator PHẢI ở đây */}
        {/* {isTyping && (
          <div className="px-2 py-1 text-sm italic text-muted-foreground">
            <LoadingDots />
          </div>
        )} */}
      </div>
    </div>
  );
};

export default ChatWindowBody;
