import chatService from '@/api/services/chatService';
import { ChatState } from '@/types/store';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// import { useAuthStore } from './useAuthStore';
import { Conversation } from '@/types/chat/models';
import { authClient } from '@/lib/auth-client';

export const useChatStore = create<ChatState>()(
  persist(
    (set,get) => ({
        conversations: [],
        messages: {},
        activeConversationId: null,
        conversationLoading: false, // conversations loading state
        messageLoading: false, // messages loading state

        setActiveConversation: (id: string | null) => {
          set({ activeConversationId: id });
        },

        reset: () => {
          set({
            conversations: [],
            messages: {},
            activeConversationId: null,
            conversationLoading: false,
          });
        },
        fetchConversations: async () => {
          try {
            set({ conversationLoading: true });
            const conversations = await chatService.fetchConversations();
            set({ conversations });
          } catch (error) {
            console.error("Failed to fetch conversations:", error);
          } finally {
            set({ 
              conversationLoading: false,
              messageLoading: false
            });
          }
        },
        fetchMessages: async (id: string, cursor?: string) => {
          const { activeConversationId, messages } = get();
          // const { user } = useAuthStore.getState();
          const { data: sessionClient, isPending } = authClient.useSession();
          const user = sessionClient?.user ?? null;
          // if (activeConversationId !== conversationId) {
          //   return;
          // }
          const conversationId = id ?? activeConversationId;
          if (!conversationId) {
            return;
          }
          const currentMessages = messages[conversationId];
          if (currentMessages && !currentMessages.hasMore) {
            return;
          }
          const nextCursor = currentMessages?.nextCursor === undefined ? "" : currentMessages.nextCursor;
          if (nextCursor === null) {
            return;
          }
          set({ messageLoading: true });
          try {    
            const response = await chatService.fetchMessages(conversationId, nextCursor);
            
            // if (response) {
            //   const existingMessages = get().messages[conversationId]?.items || []; 
            //   const updatedMessages = [...existingMessages, ...response.messages];
            //   set({
            //     messages: {
            //       ...get().messages,
            //       [conversationId]: {
            //         items: updatedMessages, 
            //         hasMore: response.messages.length === 50,
            //         nextCursor: response.cursor,
            //       },  
            //     },
            //   });
            // }
            if (response) {
              const { messages: fetched , cursor } = response;
              const processed = fetched.map(msg => {
                if (msg.senderId === user?.id) {
                  return { ...msg, isOwn: true };
                }
                return msg;
              });
              set((state) => {
                const prev = state.messages[conversationId]?.items || [];
                const merged = prev.length > 0 
                  ? [...processed, ...prev] 
                  : processed;
                return {
                  messages: {
                    ...state.messages,
                    [conversationId]: {
                      items: merged,
                      // hasMore: fetched.length === 50,
                      hasMore: !!cursor,
                      nextCursor: cursor ?? null,
                    },
                  },
                };
              });
            }
          } catch (error) {
            console.error("Failed to fetch messages:", error);
          } finally {
            set({ messageLoading: false });
          } 
        },
        sendMessage: async (recipientId: string, content: string, imgUrl: string) => {
          try {
            const { activeConversationId } = get();
            // Optimistic UI update can be implemented here
            await chatService.sendMessage(recipientId, content, imgUrl, activeConversationId || undefined );
            // Optionally refetch messages or update state accordingly
            set((state: ChatState): Partial<ChatState> => ({
              conversations: state.conversations.map((c: Conversation) => c.id === activeConversationId ? {...c, seenBy: []} : c), // trigger state update
            })); // trigger state update
          } catch (error) {
            console.error("Failed to send message:", error);
          }
        },
        sendGroupMessage: async (conversationId: string, content: string, imgUrl: string) => {
          try {
            const { activeConversationId } = get();   
            // Optimistic UI update can be implemented here
            await chatService.sendGroupMessage(conversationId, content, imgUrl);    
            // Optionally refetch messages or update state accordingly
            set((state: ChatState): Partial<ChatState> => ({
              conversations: state.conversations.map((c: Conversation) => c.id === activeConversationId ? {...c, seenBy: []} : c), // trigger state update
            })); // trigger state update
          } catch (error) {
            console.error("Failed to send group message:", error);
          }   
        },
    }),
    {
      name: 'chat-storage', // name of the item in the storage (should be unique)
      partialize: (state) => ({conversations: state.conversations}),
    }
  )
);  