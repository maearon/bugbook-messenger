import api from "@/api/client"
import { ConversationResponse, Message } from "@/types/chat";

interface FetchMessageProps {
  messages: Message[];
  cursor?: string;
}

interface CreateGroupPayload {
  type: "group";
  name: string;
  memberIds: string[];
}

export interface CreateGroupResponse {
  _id: string;
  type: "group";
  title: string;
  createdAt: string;
  updatedAt: string;
  group: {
    id: string;
    name: string;
    avatarUrl?: string;
    createdBy: string;
    createdAt: string;
  };
  participants: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }[];
}

interface CreateDirectChatPayload {
  type: "direct";
  memberIds: string[];
}

export interface CreateDirectChatResponse {
  _id: string;
  type: "direct";
  createdAt: string;
  updatedAt: string;
  participants: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }[];
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
  };
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
  async createGroupChat(data: CreateGroupPayload): Promise<{ conversation: CreateGroupResponse } | undefined> {
    try {
      const response = await api.post<{ conversation: CreateGroupResponse }>("/conversations", data);
      return response.data;
    } catch (error: unknown) {
      console.error("Error creating group chat:", error);
      throw error;
    }
  },
  async createDirectChat(data: CreateDirectChatPayload): Promise<{ conversation: CreateDirectChatResponse } | undefined> {
    try {
      const response = await api.post<{ conversation: CreateDirectChatResponse }>("/conversations", data);
      return response.data;
    } catch (error: unknown) {
      console.error("Error creating group chat:", error);
      throw error;
    }
  },
};

export default chatService;