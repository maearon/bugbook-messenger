import api from "@/api/client"
import { ConversationResponse, Message } from "@/types/chat";

interface FetchMessageProps {
  messages: Message[];
  cursor?: string;
}

const pageLimit = 50;

export const chatService = {
  async fetchConversations(): Promise<ConversationResponse> {
    try {
      const response = await api.get('/conversations');
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching conversations:", error);
      throw error;
    }
  },
  async fetchMessages(conversationId: string, cursor?: string): Promise<FetchMessageProps | undefined> {
    try {
      const response = await api.get<FetchMessageProps>(`/conversations/${conversationId}/messages`, {
        params: {
          limit: pageLimit,
          cursor,
        },
      });
      return { messages: response.data.messages, cursor: response.data.cursor };
      // return response.data;
    } catch (error: unknown) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  },
  async sendMessage(recipientId: string, conversationId?: string, content: string = "", imgUrl?: string): Promise<Message | undefined> {
    try {
      const response = await api.post<{ message: Message }>("/messages/direct", {
        recipientId,
        content,
        imgUrl,
        conversationId,
      });
      return response.data.message;
    } catch (error: unknown) {
      console.error("Error sending message:", error);
      throw error;
    }
  },
  async sendGroupMessage(conversationId: string, content: string = "", imgUrl?: string): Promise<Message | undefined> {
    try {
      const response = await api.post<{ message: Message }>("/messages/group", {
        conversationId,
        content,
        imgUrl,
      });
      return response.data.message;
    } catch (error: unknown) {
      console.error("Error sending group message:", error);
      throw error;
    }
  },
};

export default chatService;