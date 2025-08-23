import { User } from "./auth";

export interface Post {
  id: string;
  content: string;
  location?: string;
  type: "text" | "image" | "video" | "poll" | "event" | "repost" | "quote" | "article" | "story";
  status: "draft" | "published";
  isPublic: boolean;
  allowComments: boolean;
  allowLikes: boolean;
  allowShares: boolean;
  allowBookmarks: boolean;
  allowVoting: boolean;
  isRepost: boolean;
  isQuote: boolean;
  isArticle: boolean;
  isStory: boolean;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  bookmarksCount: number;
  upvotesCount: number;
  downvotesCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  scheduledAt?: string;
  author: User;
  originalPost?: Post | null;
  repostContent?: string | null;
  pollQuestion?: string | null;
  pollOptions?: string[] | null;
  pollEndDate?: string | null;
  pollResults?: string | null;
  eventTitle?: string | null;
  eventDescription?: string | null;
  eventStartDate?: string | null;
  eventEndDate?: string | null;
  eventLocation?: string | null;
  eventCapacity?: number | null;
  eventAttendees?: any | null;
  
  // Legacy fields for backward compatibility
  media?: Media[];
  hashtags?: string[];
  likes?: Like[];
  comments?: Comment[];
  shares?: Share[];
  upvotes?: Vote[];
  downvotes?: Vote[];
  isLiked?: boolean;
  isShared?: boolean;
  isBookmarked?: boolean;
  isUpvoted?: boolean;
  isDownvoted?: boolean;
  _count?: {
    likes: number;
    comments: number;
    shares: number;
    upvotes: number;
    downvotes: number;
  };
}

export interface CreatePostData {
  content: string;
  media?: File[];
  hashtags?: string[];
  mentions?: string[];
}

export interface UpdatePostData {
  content?: string;
  media?: File[];
  hashtags?: string[];
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
  allowVoting: boolean;
  isRepost: boolean;
  isQuote: boolean;
  likesCount: number;
  repliesCount: number;
  sharesCount: number;
  bookmarksCount: number;
  upvotesCount: number;
  downvotesCount: number;
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
  _count?: {
    likes: number;
    replies: number;
  };
}

export interface Like {
  id: string;
  userId: string;
  postId?: string;
  commentId?: string;
  createdAt: string;
}

export interface Share {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export interface Vote {
  id: string;
  userId: string;
  postId: string;
  type: "upvote" | "downvote";
  createdAt: string;
}

export interface Media {
  id: string;
  url: string;
  type: "image" | "video";
  filename: string;
  size: number;
  createdAt: string;
}

export interface Hashtag {
  id: string;
  name: string;
  postsCount: number;
}

export interface Mention {
  id: string;
  username: string;
  userId: string;
}
