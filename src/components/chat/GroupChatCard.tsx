import { authClient } from '@/lib/auth-client';
import { useChatStore } from '@/stores/useChatStore';
import { Conversation } from '@/types/chat/chat'
import React from 'react'
import ChatCard from './ChatCard';
import UnreadCountBadge from './UnreadCountBadge';
import GroupChatAvatar from './GroupChatAvatar';

const GroupChatCard = ({conversation}: {conversation: Conversation}) => {
  // const { user } = useAuthStore();
  const { data: sessionClient, isPending } = authClient.useSession();
  const user = sessionClient?.user ?? null;
  const { activeConversationId, setActiveConversation, messages, fetchMessages } = useChatStore();
  if (!user) {
    return null;
  }
  const unreadCount = conversation.unreadCounts[user.id] || 0;
  const name = conversation.group?.name || "Unnamed Group";
  const handleSelectConversation = async (id: string) => {
    setActiveConversation(id);
    if (!messages[id]) {
      await fetchMessages(id);
    }
  };
  return (
    <ChatCard
      key={conversation._id}
      conversationId={conversation._id}
      name={name ?? "Unnamed Group"}
      timeStamp={
        conversation.lastMessage?.createdAt 
          ? new Date(conversation.lastMessage.createdAt) 
          : undefined
      }
      isActive={activeConversationId === conversation._id}
      unreadCount={unreadCount}
      onSelect={() => handleSelectConversation}
      unreadCount={unreadCount}
      leftSection={
        <>
          {
            unreadCount && unreadCount > 0 && (
              <UnreadCountBadge unreadCount={unreadCount} />
            )
          }
          <GroupChatAvatar 
            participants={conversation.participants}
            type="chat"
            name={name} 
            avatarUrls={conversation.participants
              .filter(participant => participant._id !== user.id)
              .map(participant => participant.avatarUrl ?? undefined)
            }

          />
        </>
        // You can customize the group avatar or use a default one
      }
      subtitle={
        <p className="text-sm text-muted-foreground truncate">
          {conversation.participants.length} members
        </p>
      }
    />
  )
}

export default GroupChatCard
