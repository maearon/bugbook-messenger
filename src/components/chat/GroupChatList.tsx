import { useChatStore } from '@/stores/useChatStore';
import React from 'react'
import GroupChatCard from './GroupChatCard';

const GroupChatList = () => {
  // Lấy đúng field bằng selector
  const conversations = useChatStore(state => state.conversations);

  // Bảo vệ kiểu dữ liệu (trong trường hợp persist còn dữ liệu sai)
  if (!Array.isArray(conversations)) {
    // bạn có thể hiện placeholder hoặc spinner nếu muốn
    return null;
  }

  const groupChats = conversations.filter(conversation => conversation.type === "group");

  if (groupChats.length === 0) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {groupChats.map((conversation) => (
        <GroupChatCard key={conversation._id} conversation={conversation} />
      ))}
    </div>
  )
}

export default GroupChatList
