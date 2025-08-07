import { User } from './auth'
import { Media } from './post'

export interface Chat {
  id: string
  participants: User[]
  lastMessage?: Message
  unreadCount: number
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  content: string
  sender: User
  chatId: string
  media?: Media[]
  isRead: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateMessageData {
  content: string
  chatId: string
  media?: File[]
}

export interface ChatMessage {
  id: string
  content: string
  senderId: string
  chatId: string
  media?: Media[]
  isRead: boolean
  createdAt: string
}

export interface OnlineUser {
  userId: string
  isOnline: boolean
  lastSeen: string
}
