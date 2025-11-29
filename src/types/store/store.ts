import { Conversation, Message } from './../chat/models';
import { user } from './../../db/schema';
export type Store = {
  id: string
  name: string
  address: string
  city: string
  distance: number
  coordinates: [number, number]
  hours: Record<string, string>
  phone: string
  features: string[]
}

export interface AuthState {
  signUp: {
    username: string
    email: string
    password: string  
    firstNme: string
    lastName: string
  },
  signIn: {username: string, password: string},
  signOut: Promise<void>,
  fetchMe: Promise<void>,
  refresh: Promise<void>,
}

export interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
}

export interface ChatState {
  conversations: Conversation[];
  messages: Record<string, {
    items: Message[];
    hasMore: boolean; // infinite scroll
    nextCursor?: string | null; // pagination cursor
  }>;
  activeConversationId: string | null;
  conversationLoading: boolean;
  messageLoading: boolean;
  reset: () => void;

  setActiveConversation: (id: string | null) => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string, cursor?: string) => Promise<void>;
  sendMessage: (recipientId: string, content: string, imgUrl?: string) => Promise<void>;
  sendGroupMessage: (conversationId: string, content: string, imgUrl?: string) => Promise<void>;
}