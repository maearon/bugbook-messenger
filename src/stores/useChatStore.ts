import { create } from "zustand"
import { persist } from "zustand/middleware"
import chatService from "@/api/services/chatService"
import { Conversation } from "@/types/chat/models"
import { ChatState } from "@/types/store"
import { useAuthStore } from "./useAuthStore"

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {}, // { [conversationId]: { items: [], hasMore: true, nextCursor: string | null } }
      activeConversationId: null,
      conversationLoading: false,
      messageLoading: false,

      setActiveConversation: (id) => {
        set({ activeConversationId: id })
      },

      reset: () => {
        set({
          conversations: [],
          messages: {},
          activeConversationId: null,
          conversationLoading: false,
          messageLoading: false,
        })
      },

      // =============================
      // FETCH CONVERSATIONS
      // =============================
      fetchConversations: async () => {
        try {
          set({ conversationLoading: true })
          const result = await chatService.fetchConversations()

          let conversationsArray: Conversation[] = []

          if (Array.isArray(result)) {
            conversationsArray = result
          } else if (Array.isArray(result?.conversations)) {
            conversationsArray = result.conversations
          } else if (Array.isArray(result?.data?.conversations)) {
            conversationsArray = result.data.conversations
          } else if (Array.isArray(result?.data)) {
            conversationsArray = result.data
          } else {
            const maybeArray = Object.values(result || {}).find((v) => Array.isArray(v))
            conversationsArray = maybeArray ?? []
          }

          set({ conversations: conversationsArray })
        } catch (err) {
          console.error("Failed to fetch conversations:", err)
          set({ conversations: [] })
        } finally {
          set({ conversationLoading: false })
        }
      },

      // =============================
      // FETCH MESSAGES WITH PAGINATION
      // =============================
      fetchMessages: async (id, cursor) => {
        const user = useAuthStore.getState()?.user ?? null

        const conversationId = id || get().activeConversationId
        if (!conversationId) return

        const existing = get().messages[conversationId]

        // Không fetch lại nếu không còn trang kế tiếp
        if (existing?.nextCursor === null) return

        set({ messageLoading: true })

        try {
          const response = await chatService.fetchMessages(
            conversationId,
            existing?.nextCursor ?? ""
          )

          if (!response) return

          const { messages: fetched, cursor: next } = response

          const processed = fetched.map((msg) => ({
            ...msg,
            isOwn: msg.senderId === user?.id,
          }))

          set((state) => {
            const prevItems = state.messages[conversationId]?.items || []
            const merge = [...processed, ...prevItems]

            return {
              messages: {
                ...state.messages,
                [conversationId]: {
                  items: merge,
                  hasMore: !!next,
                  nextCursor: next ?? null,
                },
              },
            }
          })
        } catch (err) {
          console.error("Failed to fetch messages:", err)
        } finally {
          set({ messageLoading: false })
        }
      },

      // =============================
      // SEND MESSAGE (PRIVATE)
      // =============================
      sendMessage: async (recipientId, content, imgUrl) => {
        try {
          const { activeConversationId } = get()
          await chatService.sendMessage(
            recipientId,
            activeConversationId || undefined,
            content,
            imgUrl
          )

          // cập nhật UI (optional)
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === activeConversationId
                ? { ...c, seenBy: [] }
                : c
            ),
          }))
        } catch (err) {
          console.error("Failed to send message:", err)
        }
      },

      // =============================
      // SEND GROUP MESSAGE
      // =============================
      sendGroupMessage: async (conversationId, content, imgUrl) => {
        try {
          const { activeConversationId } = get()
          await chatService.sendGroupMessage(conversationId, content, imgUrl)

          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === activeConversationId
                ? { ...c, seenBy: [] }
                : c
            ),
          }))
        } catch (err) {
          console.error("Failed to send group message:", err)
        }
      },

      // =============================
      // ADD MESSAGE FROM SOCKETIO
      // =============================
      addMessage: async (message) => {
        const user = useAuthStore.getState()?.user
        const conversationId = message.conversationId

        message.isOwn = message.senderId === user?.id

        const state = get()
        const existing = state.messages[conversationId]

        // Nếu chưa load messages thì fetch 1 lần
        if (!existing) {
          await state.fetchMessages(conversationId)
        }

        set((s) => {
          const prev = s.messages[conversationId]?.items || []

          // Tránh duplicate message
          if (prev.some((m) => m._id === message._id)) return s

          return {
            messages: {
              ...s.messages,
              [conversationId]: {
                items: [...prev, message],
                hasMore: s.messages[conversationId]?.hasMore ?? false,
                nextCursor: s.messages[conversationId]?.nextCursor ?? null,
              },
            },
          }
        })
      },

      // =============================
      // UPDATE CONVERSATION (LAST MESSAGE, SEEN...)
      // =============================
      updateConversation: (conversation) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c._id === conversation._id ? { ...c, ...conversation } : c
          ),
        }))
      },
    }),

    {
      name: "chat-storage",
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
        messages: state.messages,
      }),
    }
  )
)
