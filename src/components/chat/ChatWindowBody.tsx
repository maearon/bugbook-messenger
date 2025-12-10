import { useChatStore } from '@/stores/useChatStore';
import ChatWelcomeScreen from './ChatWelcomeScreen';
import MessageItem from './MessageItem';
import { useEffect, useRef } from 'react';

const ChatWindowBody = () => {
  const {activeConversationId, conversations, messages: allMessages} = useChatStore();  
  const messages = activeConversationId ? allMessages[activeConversationId!].items : [];
  const selectedConversation = conversations.find(c => c._id === activeConversationId);

  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (!selectedConversation) {
    return <ChatWelcomeScreen />;
  }
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
        <h2 className="text-2xl font-semibold mb-2">No messages yet</h2>
        <p className="text-gray-500">Start the conversation by sending a message!</p>
      </div>
    );
  }
  
  return (
    <div className="px-4 bg-primary-foreground h-full flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden beautiful-scrollbar">
        {messages.map((message, index) => (
          // <div key={message.id} className="mb-4">
          //   {/* <div className="text-sm text-gray-500 mb-1">{message.senderName}</div> */}
          //   <div className="bg-white p-2 rounded shadow">
          //     {message.content}
          //   </div>
          //   <div className="text-xs text-gray-400 mt-1">{new Date(message.createdAt).toLocaleTimeString()}</div>
          // </div>
          <MessageItem
            key={message._id ?? index}
            message={message}
            index={index}
            messages={messages}
            selectedConversation={selectedConversation}
            lastMessageStatus='delivered'
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

export default ChatWindowBody
