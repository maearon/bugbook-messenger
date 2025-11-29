import { useChatStore } from '@/stores/useChatStore'
import DirectMessageCard from './DirectMessageCard';

const DirectMessageList = () => {
  const conversations = useChatStore((state) => state.conversations);
  if (!conversations) {
    return;
  }
  const directMessages = conversations.filter(conversation => conversation.type === "direct");
  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {directMessages.map((conversation) => (
        <DirectMessageCard key={conversation._id} conversation={conversation} />
      ))}
    </div>
  )
}

export default DirectMessageList
