import { User } from "./auth";

export interface Status {
  id: string;
  author: User;
  media: StatusMedia;
  content?: string;
  viewsCount: number;
  views: StatusView[];
  isViewed: boolean;
  createdAt: string;
  expiresAt: string;
  isExpired: boolean;
}

export interface StatusMedia {
  id: string;
  url: string;
  type: "image" | "video";
  filename: string;
  size: number;
  duration?: number; // for videos in seconds
  createdAt: string;
}

export interface StatusView {
  id: string;
  userId: string;
  statusId: string;
  viewedAt: string;
}

export interface CreateStatusData {
  media: File;
  content?: string;
}

export interface StatusCollection {
  author: User;
  statuses: Status[];
  hasUnviewed: boolean;
  lastUpdated: string;
}
