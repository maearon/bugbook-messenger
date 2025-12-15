import { useChatStore } from "@/stores/useChatStore";
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import ChatWindowSkeleton from "./ChatWindowSkeleton";
import { SidebarInset } from "../ui/sidebar";
import ChatWindowHeader from "./ChatWindowHeader";
import ChatWindowBody from "./ChatWindowBody";
import MessageInput from "./MessageInput";

const ChatWindowLayout = () => {
  const { activeConversationId, conversations, messageLoading: loading } = useChatStore();

  const selectedConversation = conversations.find(c => c._id === activeConversationId) ?? null;

  if (!selectedConversation) {
    return <ChatWelcomeScreen />;
  }

  if (loading) {
    return <ChatWindowSkeleton />;
  }

  return (
    <SidebarInset className="flex flex-col h-full flex-1 overflow-hidden rounded-sm shadow-md">
      
      {/* Header */}
      <ChatWindowHeader chat={selectedConversation} />

      {/* Body */}
      <div className="flex-1 overflow-y-auto bg-primary-foreground">
        <ChatWindowBody conversation={selectedConversation} />
      </div>

      {/* Footer */}
      <MessageInput selectedConversation={selectedConversation} />
    </SidebarInset>
  );
};

export default ChatWindowLayout;
