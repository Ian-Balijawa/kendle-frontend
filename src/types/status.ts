import { User } from "./auth";

export interface Status {
  id: string;
  author: User;
  content: string;
  type: "image" | "video" | "text";
  privacy: "public" | "followers" | "close_friends" | "private";
  media?: StatusMedia[];
  location?: string;
  musicTrack?: string;
  musicArtist?: string;
  stickers?: string[];
  pollQuestion?: string;
  pollOptions?: string[];
  highlightTitle?: string;
  allowReplies: boolean;
  allowReactions: boolean;
  allowShares: boolean;
  allowScreenshots: boolean;
  closeFriends?: string[];
  expirationHours?: number;
  viewsCount: number;
  views: StatusView[];
  repliesCount: number;
  reactionsCount: number;
  sharesCount: number;
  isViewed: boolean;
  isReacted: boolean;
  isReplied: boolean;
  isShared: boolean;
  reactions: StatusReaction[];
  replies: StatusReply[];
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  isExpired: boolean;
}

export interface StatusMedia {
  id: string;
  url: string;
  thumbnailUrl?: string;
  mediaType: "image" | "video";
  fileName: string;
  fileSize: number;
  mimeType: string;
  duration?: number;
  width?: number;
  height?: number;
  order: number;
  createdAt: string;
}

export interface StatusView {
  id: string;
  userId: string;
  statusId: string;
  viewDuration?: number;
  deviceType?: string;
  location?: string;
  viewedAt: string;
}

export interface StatusReaction {
  id: string;
  userId: string;
  statusId: string;
  reactionType: "like" | "love" | "laugh" | "wow" | "sad" | "angry";
  createdAt: string;
}

export interface StatusReply {
  id: string;
  author: User;
  statusId: string;
  content: string;
  media?: StatusMedia[];
  location?: string;
  reactionsCount: number;
  isReacted: boolean;
  reactions: StatusReaction[];
  createdAt: string;
  updatedAt: string;
}

export interface StatusAnalytics {
  statusId: string;
  viewsCount: number;
  uniqueViewsCount: number;
  repliesCount: number;
  reactionsCount: number;
  sharesCount: number;
  screenshotsCount: number;
  averageViewDuration: number;
  topReactions: {
    reactionType: string;
    count: number;
  }[];
  viewsByDevice: {
    deviceType: string;
    count: number;
  }[];
  viewsByLocation: {
    location: string;
    count: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateStatusData {
  content: string;
  type: "image" | "video" | "text";
  privacy: "public" | "followers" | "close_friends" | "private";
  media?: File[];
  location?: string;
  musicTrack?: string;
  musicArtist?: string;
  stickers?: string[];
  pollQuestion?: string;
  pollOptions?: string[];
  highlightTitle?: string;
  allowReplies?: boolean;
  allowReactions?: boolean;
  allowShares?: boolean;
  allowScreenshots?: boolean;
  closeFriends?: string[];
  expirationHours?: number;
}

export interface StatusCollection {
  author: User;
  statuses: Status[];
  hasUnviewed: boolean;
  lastUpdated: string;
}

export interface StatusesResponse {
  statuses: Status[];
  total: number;
  page: number;
  limit: number;
}

export interface StatusRepliesResponse {
  replies: StatusReply[];
  total: number;
  page: number;
  limit: number;
}
