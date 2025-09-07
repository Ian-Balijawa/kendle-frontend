import { User } from "./auth";

export interface Status {
  id: string;
  author: User;
  content: string;
  type: "image" | "video" | "text";
  privacy: "public" | "followers" | "close_friends" | "private";
  status: "active" | "inactive" | "expired";
  media?: StatusMedia[];
  location?: string;
  musicTrack?: string;
  musicArtist?: string;
  stickers?: string[];
  pollQuestion?: string;
  pollOptions?: string[];
  highlightTitle?: string;
  closeFriends?: string[];
  expirationHours?: number;
  viewsCount: number;
  repliesCount: number;
  reactionsCount: number;
  sharesCount: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  deletedAt?: string | null;
  parentStatus?: string | null;
  // Optional fields that might not be present in all API responses
  views?: StatusView[];
  isViewed?: boolean;
  isReacted?: boolean;
  isReplied?: boolean;
  isShared?: boolean;
  reactions?: StatusReaction[];
  replies?: StatusReply[];
  isExpired?: boolean;
}

export interface StatusMedia {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  mediaType: "image" | "video";
  fileName: string;
  fileSize: number;
  mimeType: string;
  duration?: number | null;
  width?: number | null;
  height?: number | null;
  order: number;
  createdAt: string;
  status: string; // Status ID reference
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
  thumbnail?: File[];
  location?: string;
  musicTrack?: string;
  musicArtist?: string;
  stickers?: string[];
  pollQuestion?: string;
  pollOptions?: string[];
  highlightTitle?: string;
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
