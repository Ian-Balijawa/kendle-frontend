import { User } from "./auth";

export interface Post {
  id: string;
  content: string;
  location?: string;
  type: "text" | "image" | "video";
  status: "draft" | "published";
  isPublic: boolean;
  allowComments: boolean;
  allowLikes: boolean;
  allowShares: boolean;
  allowBookmarks: boolean;
  allowReactions: boolean;
  isRepost: boolean;
  isQuote: boolean;
  isArticle: boolean;
  isStory: boolean;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  sharesCount: number;
  bookmarksCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  scheduledAt?: string;
  author: User;
  originalPost?: Post | null;
  repostContent?: string | null;

  // Media and content
  media?: Media[];
  tags?: Tag[];
  mentions?: Mention[];

  // Legacy fields for backward compatibility
  hashtags?: string[];
  likes?: Like[];
  comments?: Comment[];
  shares?: Share[];
  isLiked?: boolean;
  isDisliked?: boolean;
  isShared?: boolean;
  isBookmarked?: boolean;
  _count?: {
    likes: number;
    dislikes: number;
    comments: number;
    shares: number;
  };
}

export interface CreatePostData {
  content: string;
  media?: MediaInput[];
  location?: string;
  tags?: TagInput[];
  mentions?: MentionInput[];
  type?: "text" | "image" | "video";
  isPublic?: boolean;
  allowComments?: boolean;
  allowLikes?: boolean;
  allowShares?: boolean;
  allowBookmarks?: boolean;
  allowReactions?: boolean;
  isRepost?: boolean;
  isQuote?: boolean;
  isArticle?: boolean;
  isStory?: boolean;
  originalPostId?: string;
  repostContent?: string;
  scheduledAt?: string;
}

export interface MediaInput {
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string;
  altText?: string;
  caption?: string;
  fileSize: number;
  duration?: number;
  width?: number;
  height?: number;
  format?: string;
}

export interface TagInput {
  name: string;
  description?: string;
}

export interface MentionInput {
  mentionedUserId: string;
  postId?: string;
  commentId?: string;
}

export interface UpdatePostData {
  content?: string;
  media?: File[];
  tags?: string[];
  mentions?: string[];
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  postId: string;
  parentId?: string;
  location?: string;
  type: "text" | "image" | "video" | "poll" | "repost" | "quote";
  status: "active" | "hidden" | "deleted";
  isPublic: boolean;
  allowReplies: boolean;
  allowLikes: boolean;
  allowShares: boolean;
  allowBookmarks: boolean;
  allowReactions: boolean;
  isRepost: boolean;
  isQuote: boolean;
  likesCount: number;
  dislikesCount: number;
  repliesCount: number;
  sharesCount: number;
  bookmarksCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  originalComment?: Comment | null;
  repostContent?: string | null;
  pollQuestion?: string | null;
  pollOptions?: string[] | null;
  pollEndDate?: string | null;
  pollResults?: string | null;

  // Legacy fields for backward compatibility
  replies?: Comment[];
  likes?: Like[];
  isLiked?: boolean;
  isDisliked?: boolean;
  _count?: {
    likes: number;
    dislikes: number;
    replies: number;
  };
}

export interface Like {
  id: string;
  userId: string;
  postId?: string;
  commentId?: string;
  reactionType: "like" | "dislike";
  createdAt: string;
}

export interface Share {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export interface Media {
  id: string;
  url: string;
  type: "image" | "video";
  filename: string;
  size: number;
  thumbnailUrl?: string;
  altText?: string;
  caption?: string;
  duration?: number;
  width?: number;
  height?: number;
  format?: string;
  createdAt: string;
  // Optional fields from media-only endpoints
  streamingUrl?: string | null;
  originalUrl?: string | null;
  mediaType?: "image" | "video";
}

export interface Tag {
  id: string;
  name: string;
  description?: string;
  postsCount: number;
}

export interface Mention {
  id: string;
  mentionedUserId: string;
  postId?: string;
  commentId?: string;
  username: string;
  userId: string;
}

export interface ReactionRequest {
  reactionType: "like" | "dislike";
}

export interface BookmarkRequest {
  note?: string;
}

export interface ShareRequest {
  shareContent?: string;
  platform?: string;
}

export interface PostEngagement {
  hasLiked: boolean;
  hasDisliked: boolean;
  hasBookmarked: boolean;
  hasViewed: boolean;
  reactionType?: "like" | "dislike" | null;
  bookmarkNote?: string | null;
  lastViewedAt?: string | null;
}
