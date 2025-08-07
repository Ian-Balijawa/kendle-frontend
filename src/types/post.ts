import { User } from './auth'

export interface Post {
  id: string
  content: string
  author: User
  media?: Media[]
  likes: Like[]
  comments: Comment[]
  shares: Share[]
  isLiked: boolean
  isShared: boolean
  isBookmarked: boolean
  createdAt: string
  updatedAt: string
  _count: {
    likes: number
    comments: number
    shares: number
  }
}

export interface CreatePostData {
  content: string
  media?: File[]
  hashtags?: string[]
  mentions?: string[]
}

export interface UpdatePostData {
  content?: string
  media?: File[]
  hashtags?: string[]
  mentions?: string[]
}

export interface Comment {
  id: string
  content: string
  author: User
  postId: string
  parentId?: string
  replies: Comment[]
  likes: Like[]
  createdAt: string
  updatedAt: string
  _count: {
    likes: number
    replies: number
  }
}

export interface Like {
  id: string
  userId: string
  postId?: string
  commentId?: string
  createdAt: string
}

export interface Share {
  id: string
  userId: string
  postId: string
  createdAt: string
}

export interface Media {
  id: string
  url: string
  type: 'image' | 'video'
  filename: string
  size: number
  createdAt: string
}

export interface Hashtag {
  id: string
  name: string
  postsCount: number
}

export interface Mention {
  id: string
  username: string
  userId: string
}
