import { useChatStore } from '@/stores/useChatStore';
import { Conversation } from '@/types/chat/chat'
import React from 'react'
import ChatCard from './ChatCard';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import UserAvatar from './UserAvatar';
import StatusBadge from './StatusBadge';
import UnreadCountBadge from './UnreadCountBadge';
// import { useAuthStore } from '@/stores/useAuthStore';

const DirectMessageCard = ({conversation}: {conversation: Conversation}) => {
  // const { user } = useAuthStore();
  const { data: sessionClient, isPending } = authClient.useSession();
  const user = sessionClient?.user ?? null;
  const { activeConversationId, setActiveConversation, messages, fetchMessages } = useChatStore();
  if (!user) {
    return null;
  }
  const otherUser = conversation.participants.find(participant => participant.id !== user.id);
  if (!otherUser) {
    return null;
  }
  const unreadCount = conversation.unreadCounts[user.id] || 0;
  const lastMessage = conversation.lastMessage?.content || "No messages yet";
  const handleSelectConversation = async (id: string) => {
    setActiveConversation(id);
    if (!messages[id]) {
      await fetchMessages(id);
    }
  };
  const conversations = useChatStore();
  if (!conversations) {
    return;
  }
  const groupChats = conversations.conversations.filter(conv => conv.type === "group");
  return (
    <ChatCard
      key={conversation._id}
      conversationId={conversation._id}
      name={otherUser.displayName ?? "Unknown User"}
      timeStamp={
        conversation.lastMessage?.createdAt 
          ? new Date(conversation.lastMessage.createdAt) 
          : undefined
      }
      isActive={activeConversationId === conversation._id}
      unreadCount={unreadCount}
      onSelect={() => handleSelectConversation(conversation._id)}
      leftSection={
        <>
          <UserAvatar type="sidebar" name={otherUser.displayName ?? ""} 
            avatarUrl={otherUser.avatarUrl ?? undefined}
          />
          <StatusBadge status={"offline"} />
          {
            unreadCount && unreadCount > 0 && (
              <UnreadCountBadge unreadCount={unreadCount} />
            )
          }
        </>
      }
      subtitle={
        <p className={cn("text-sm truncate", unreadCount && unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground")}>
          {lastMessage}
        </p>
      }
    />
  )
}

export default DirectMessageCard
