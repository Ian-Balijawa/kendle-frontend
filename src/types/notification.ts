import { User } from '.'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  userId: string
  actorId?: string
  actor?: User
  postId?: string
  commentId?: string
  chatId?: string
  isRead: boolean
  createdAt: string
}

export type NotificationType =
  | 'like'
  | 'comment'
  | 'follow'
  | 'mention'
  | 'message'
  | 'share'
  | 'system'

export interface NotificationSettings {
  likes: boolean
  comments: boolean
  follows: boolean
  mentions: boolean
  messages: boolean
  shares: boolean
  system: boolean
}
