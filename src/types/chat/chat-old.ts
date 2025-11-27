// types/chat/chat.ts
export interface UserSummary {
  id: string
  name: string
  email?: string
  avatar?: string | null
}

export interface MessageSummary {
  id: string
  senderId: string
  content: string
  createdAt: string
}

// export interface ConversationWithDetails {
//   id: string
//   name?: string | null
//   type: "private" | "group"
//   avatar?: string | null
//   // người còn lại trong cuộc hội thoại (nếu là private)
//   otherParticipants?: UserSummary[]
//   // tin nhắn cuối cùng
//   lastMessage?: MessageSummary | null
//   // số tin nhắn chưa đọc (client tính hoặc backend gửi về)
//   unreadCount?: number
//   createdAt?: string
//   updatedAt?: string
// }

// export interface MessageWithSender {
//   id: string
//   conversationId: string
//   senderId: string
//   content: string
//   type: "text" | "image" | "file"
//   fileUrl?: string | null
//   fileName?: string | null
//   createdAt: string
//   updatedAt?: string
//   sender: {
//     id: string
//     name: string
//     email?: string
//     avatar?: string | null
//   }
// }

// Database Models for Moji Chat App
// These are TypeScript interfaces that can be used with MongoDB or PostgreSQL

export interface User {
  id: string
  username: string
  email: string
  password: string // hashed
  name: string
  avatar?: string
  bio?: string
  isOnline: boolean
  lastSeen: Date
  createdAt: Date
  updatedAt: Date
}

export interface FriendRequest {
  id: string
  senderId: string
  receiverId: string
  status: "pending" | "accepted" | "rejected"
  createdAt: Date
  updatedAt: Date
}

export interface Friend {
  id: string
  userId: string
  friendId: string
  createdAt: Date
}

export interface Conversation {
  id: string
  type: "direct" | "group"
  name?: string // for group chats
  avatar?: string // for group chats
  participantIds: string[]
  lastMessageId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  type: "text" | "image" | "file"
  fileUrl?: string
  fileName?: string
  seenBy: string[] // array of user IDs who have seen the message
  createdAt: Date
  updatedAt: Date
}

// DTOs for API responses
export interface UserDTO {
  id: string
  username: string
  email: string
  name: string
  avatar?: string
  bio?: string
  isOnline: boolean
  lastSeen: Date
}

export interface ConversationWithDetails extends Conversation {
  lastMessage?: Message
  unreadCount?: number
  otherParticipants?: UserDTO[]
}

export interface MessageWithSender extends Message {
  sender: UserDTO
}
