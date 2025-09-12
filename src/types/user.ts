import { Post } from "./post";
import { User } from "./auth";

export interface UserProfile extends User {
  posts: Post[];
  followers: string[];
  following: string[];
  isFollowing: boolean;
  isBlocked: boolean;
  isBlockedBy: boolean;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
  avatar?: File;
  phoneNumber?: string;
}

export interface FollowData {
  userId: string;
  isFollowing: boolean;
}

export interface BlockData {
  userId: string;
  isBlocked: boolean;
}

export interface UserSearchResult {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isFollowing: boolean;
  isVerified: boolean;
}

export interface FollowStatus {
  isFollowing: boolean;
  followRelationship?: {
    id: string;
    followerId: string;
    followingId: string;
    createdAt: string;
  };
}

export interface FollowersResponse {
  followers: User[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export interface FollowingResponse {
  following: User[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export interface SuggestedUser extends User {
  mutualFollowersCount?: number;
  reason?: string; // e.g., "Followed by people you follow", "Popular in your area"
}
