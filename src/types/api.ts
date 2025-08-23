import { Post } from "./post";
import { User } from "./auth";
import { Comment } from "./post";

export interface ApiResponse<T> {
  data: T;
  message: string | null;
  success: boolean;
  error?: any;
  timestamp?: string;
  path?: string;
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  filter?: Record<string, any>;
}
