import { Post } from "./post";
import { User } from "./auth";
import { Comment } from "./post";

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PostsResponse extends PaginatedResponse<Post> {}

export interface UsersResponse extends PaginatedResponse<User> {}

export interface CommentsResponse extends PaginatedResponse<Comment> {}

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
