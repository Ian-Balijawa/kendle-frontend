import { notifications } from "@mantine/notifications";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { useAuthStore } from "../stores/authStore";
import {
  ApiResponse,
  AuthResponse,
  Comment,
  CommentsResponse, Notification,
  Post,
  PostsResponse, UpdateUserData,
  User,
  UsersResponse
} from "../types";

// API request/response types based on the provided endpoints
export interface CreatePostRequest {
  content: string;
  media?: {
    type: 'image' | 'video';
    url: string;
    thumbnailUrl?: string;
    altText?: string;
    caption?: string;
    fileSize?: number;
    duration?: number;
    width?: number;
    height?: number;
    format?: string;
  }[];
  location?: string;
  tags?: {
    name: string;
    description?: string;
  }[];
  mentions?: {
    mentionedUserId: string;
    postId?: string;
    commentId?: string;
  }[];
  type?: 'text' | 'image' | 'video' | 'poll' | 'event' | 'repost' | 'quote' | 'article' | 'story';
  isPublic?: boolean;
  allowComments?: boolean;
  allowLikes?: boolean;
  allowShares?: boolean;
  allowBookmarks?: boolean;
  allowVoting?: boolean;
  isRepost?: boolean;
  isQuote?: boolean;
  isArticle?: boolean;
  isStory?: boolean;
  pollQuestion?: string;
  pollOptions?: string[];
  pollEndDate?: string;
  eventTitle?: string;
  eventDescription?: string;
  eventStartDate?: string;
  eventEndDate?: string;
  eventLocation?: string;
  eventCapacity?: number;
  originalPostId?: string;
  repostContent?: string;
  scheduledAt?: string;
}

export interface UpdatePostRequest {
  content?: string;
  media?: {
    type: 'image' | 'video';
    url: string;
    thumbnailUrl?: string;
    altText?: string;
    caption?: string;
    fileSize?: number;
    duration?: number;
    width?: number;
    height?: number;
    format?: string;
  }[];
  location?: string;
  tags?: {
    name: string;
    description?: string;
  }[];
  mentions?: {
    mentionedUserId: string;
    postId?: string;
    commentId?: string;
  }[];
  status?: 'draft' | 'published';
  isPublic?: boolean;
  allowComments?: boolean;
  allowLikes?: boolean;
  allowShares?: boolean;
  allowBookmarks?: boolean;
  allowVoting?: boolean;
  isRepost?: boolean;
  isQuote?: boolean;
  isArticle?: boolean;
  isStory?: boolean;
}

export interface CreateCommentRequest {
  content: string;
  media?: {
    type: 'image' | 'video';
    url: string;
    thumbnailUrl?: string;
    altText?: string;
    caption?: string;
    fileSize?: number;
    duration?: number;
    width?: number;
    height?: number;
    format?: string;
  }[];
  parentCommentId?: string;
  mentions?: {
    mentionedUserId: string;
    postId?: string;
    commentId?: string;
  }[];
  isRepost?: boolean;
  isQuote?: boolean;
}

export interface UpdateCommentRequest {
  content?: string;
  media?: {
    type: 'image' | 'video';
    url: string;
    thumbnailUrl?: string;
    altText?: string;
    caption?: string;
    fileSize?: number;
    duration?: number;
    width?: number;
    height?: number;
    format?: string;
  }[];
  mentions?: {
    mentionedUserId: string;
    postId?: string;
    commentId?: string;
  }[];
  isRepost?: boolean;
  isQuote?: boolean;
}

export interface GetPostsParams {
  page?: number;
  limit?: number;
  authorId?: string;
  type?: 'text' | 'image' | 'video' | 'poll' | 'event' | 'repost' | 'quote' | 'article' | 'story';
  search?: string;
  tag?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetCommentsParams {
  page?: number;
  limit?: number;
  parentCommentId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface VoteRequest {
  voteType: 'upvote' | 'downvote';
}

export interface ShareRequest {
  shareContent?: string;
  platform?: string;
}

export interface BookmarkRequest {
  note?: string;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create( {
      baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    } );

    this.api.interceptors.request.use(
      ( config ) => {
        const token = useAuthStore.getState().token;
        if ( token ) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        notifications.show( {
          title: "Request",
          message: config.url,
          color: "blue",
        } );
        return config;
      },
      ( error ) => {
        notifications.show( {
          title: "Error",
          message: error.response?.data.message,
          color: "red",
        } );
        return Promise.reject( error );
      }
    );

    this.api.interceptors.response.use(
      ( response ) => response,
      ( error ) => {
        if ( error.response?.status === 401 ) {
          useAuthStore.getState().logout();
        }
        return Promise.reject( error );
      }
    );
  }

  async login( credentials: any ): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> =
      await this.api.post( "/auth/login", credentials );
    return response.data.data;
  }

  // Posts API methods
  async getPosts( params: GetPostsParams = {} ): Promise<PostsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries( params ).forEach( ( [key, value] ) => {
      if ( value !== undefined && value !== null ) {
        searchParams.append( key, String( value ) );
      }
    } );

    const response: AxiosResponse<ApiResponse<PostsResponse>> =
      await this.api.get( `/v1/posts?${searchParams.toString()}` );
    return response.data.data;
  }

  async getPost( id: string ): Promise<Post> {
    const response: AxiosResponse<ApiResponse<Post>> = await this.api.get(
      `/v1/posts/${id}`
    );
    return response.data.data;
  }

  async createPost( data: CreatePostRequest ): Promise<Post> {
    const response: AxiosResponse<ApiResponse<Post>> = await this.api.post(
      "/v1/posts",
      data
    );
    return response.data.data;
  }

  async updatePost( id: string, data: UpdatePostRequest ): Promise<Post> {
    const response: AxiosResponse<ApiResponse<Post>> = await this.api.put(
      `/v1/posts/${id}`,
      data
    );
    return response.data.data;
  }

  async deletePost( id: string ): Promise<void> {
    await this.api.delete( `/v1/posts/${id}` );
  }

  async likePost( id: string ): Promise<void> {
    await this.api.post( `/v1/posts/${id}/like` );
  }

  async unlikePost( id: string ): Promise<void> {
    await this.api.delete( `/v1/posts/${id}/like` );
  }

  async bookmarkPost( id: string, data?: BookmarkRequest ): Promise<void> {
    await this.api.post( `/v1/posts/${id}/bookmark`, data );
  }

  async unbookmarkPost( id: string ): Promise<void> {
    await this.api.delete( `/v1/posts/${id}/bookmark` );
  }

  async votePost( id: string, data: VoteRequest ): Promise<void> {
    await this.api.post( `/v1/posts/${id}/vote`, data );
  }

  async removeVotePost( id: string ): Promise<void> {
    await this.api.delete( `/v1/posts/${id}/vote` );
  }

  async sharePost( id: string, data?: ShareRequest ): Promise<void> {
    await this.api.post( `/v1/posts/${id}/share`, data );
  }

  async getUserPosts( userId: string, params: { page?: number; limit?: number } = {} ): Promise<PostsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries( params ).forEach( ( [key, value] ) => {
      if ( value !== undefined && value !== null ) {
        searchParams.append( key, String( value ) );
      }
    } );

    const response: AxiosResponse<ApiResponse<PostsResponse>> =
      await this.api.get( `/v1/posts/user/${userId}?${searchParams.toString()}` );
    return response.data.data;
  }

  async getLikedPosts( params: { page?: number; limit?: number } = {} ): Promise<PostsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries( params ).forEach( ( [key, value] ) => {
      if ( value !== undefined && value !== null ) {
        searchParams.append( key, String( value ) );
      }
    } );

    const response: AxiosResponse<ApiResponse<PostsResponse>> =
      await this.api.get( `/v1/posts/user/liked?${searchParams.toString()}` );
    return response.data.data;
  }

  async getBookmarkedPosts( params: { page?: number; limit?: number } = {} ): Promise<PostsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries( params ).forEach( ( [key, value] ) => {
      if ( value !== undefined && value !== null ) {
        searchParams.append( key, String( value ) );
      }
    } );

    const response: AxiosResponse<ApiResponse<PostsResponse>> =
      await this.api.get( `/v1/posts/user/bookmarked?${searchParams.toString()}` );
    return response.data.data;
  }

  async getMyPosts( params: { page?: number; limit?: number } = {} ): Promise<PostsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries( params ).forEach( ( [key, value] ) => {
      if ( value !== undefined && value !== null ) {
        searchParams.append( key, String( value ) );
      }
    } );

    const response: AxiosResponse<ApiResponse<PostsResponse>> =
      await this.api.get( `/v1/posts/user/me?${searchParams.toString()}` );
    return response.data.data;
  }

  // Comments API methods
  async getComments( postId: string, params: GetCommentsParams = {} ): Promise<CommentsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries( params ).forEach( ( [key, value] ) => {
      if ( value !== undefined && value !== null ) {
        searchParams.append( key, String( value ) );
      }
    } );

    const response: AxiosResponse<ApiResponse<CommentsResponse>> =
      await this.api.get( `/v1/comments/post/${postId}?${searchParams.toString()}` );
    return response.data.data;
  }

  async getComment( id: string ): Promise<Comment> {
    const response: AxiosResponse<ApiResponse<Comment>> = await this.api.get(
      `/v1/comments/${id}`
    );
    return response.data.data;
  }

  async createComment( postId: string, data: CreateCommentRequest ): Promise<Comment> {
    const response: AxiosResponse<ApiResponse<Comment>> = await this.api.post(
      `/v1/comments/post/${postId}`,
      data
    );
    return response.data.data;
  }

  async updateComment( id: string, data: UpdateCommentRequest ): Promise<Comment> {
    const response: AxiosResponse<ApiResponse<Comment>> = await this.api.put(
      `/v1/comments/${id}`,
      data
    );
    return response.data.data;
  }

  async deleteComment( commentId: string ): Promise<void> {
    await this.api.delete( `/v1/comments/${commentId}` );
  }

  async likeComment( id: string ): Promise<void> {
    await this.api.post( `/v1/comments/${id}/like` );
  }

  async unlikeComment( id: string ): Promise<void> {
    await this.api.delete( `/v1/comments/${id}/like` );
  }

  async getMyComments( params: { page?: number; limit?: number } = {} ): Promise<CommentsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries( params ).forEach( ( [key, value] ) => {
      if ( value !== undefined && value !== null ) {
        searchParams.append( key, String( value ) );
      }
    } );

    const response: AxiosResponse<ApiResponse<CommentsResponse>> =
      await this.api.get( `/v1/comments/user/me?${searchParams.toString()}` );
    return response.data.data;
  }

  async getUserComments( userId: string, params: { page?: number; limit?: number } = {} ): Promise<CommentsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries( params ).forEach( ( [key, value] ) => {
      if ( value !== undefined && value !== null ) {
        searchParams.append( key, String( value ) );
      }
    } );

    const response: AxiosResponse<ApiResponse<CommentsResponse>> =
      await this.api.get( `/v1/comments/user/${userId}?${searchParams.toString()}` );
    return response.data.data;
  }

  async getLikedComments( params: { page?: number; limit?: number } = {} ): Promise<CommentsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries( params ).forEach( ( [key, value] ) => {
      if ( value !== undefined && value !== null ) {
        searchParams.append( key, String( value ) );
      }
    } );

    const response: AxiosResponse<ApiResponse<CommentsResponse>> =
      await this.api.get( `/v1/comments/user/liked?${searchParams.toString()}` );
    return response.data.data;
  }

  async searchComments( params: { q: string; postId?: string; page?: number; limit?: number } ): Promise<CommentsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries( params ).forEach( ( [key, value] ) => {
      if ( value !== undefined && value !== null ) {
        searchParams.append( key, String( value ) );
      }
    } );

    const response: AxiosResponse<ApiResponse<CommentsResponse>> =
      await this.api.get( `/v1/comments/search?${searchParams.toString()}` );
    return response.data.data;
  }

  async getCommentStats( postId: string ): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(
      `/v1/comments/stats/post/${postId}`
    );
    return response.data.data;
  }

  async hideComment( id: string, reason?: string ): Promise<void> {
    await this.api.post( `/v1/comments/${id}/hide`, { reason } );
  }

  async unhideComment( id: string ): Promise<void> {
    await this.api.post( `/v1/comments/${id}/unhide` );
  }

  async getUser( id: string ): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get(
      `/users/${id}`
    );
    return response.data.data;
  }

  async updateUser( id: string, data: UpdateUserData ): Promise<User> {
    const formData = new FormData();

    Object.entries( data ).forEach( ( [key, value] ) => {
      if ( value !== undefined ) {
        if ( value instanceof File ) {
          formData.append( key, value );
        } else {
          formData.append( key, String( value ) );
        }
      }
    } );

    const response: AxiosResponse<ApiResponse<User>> = await this.api.put(
      `/users/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  }

  async followUser( userId: string ): Promise<void> {
    await this.api.post( `/users/${userId}/follow` );
  }

  async unfollowUser( userId: string ): Promise<void> {
    await this.api.delete( `/users/${userId}/follow` );
  }

  async getNotifications( page = 1, limit = 20 ): Promise<Notification[]> {
    const response: AxiosResponse<ApiResponse<Notification[]>> =
      await this.api.get( `/notifications?page=${page}&limit=${limit}` );
    return response.data.data;
  }

  async markNotificationAsRead( id: string ): Promise<void> {
    await this.api.put( `/notifications/${id}/read` );
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.api.put( "/notifications/read-all" );
  }

  async searchUsers(
    query: string,
    page = 1,
    limit = 10
  ): Promise<UsersResponse> {
    const response: AxiosResponse<ApiResponse<UsersResponse>> =
      await this.api.get(
        `/search/users?q=${encodeURIComponent( query )}&page=${page}&limit=${limit}`
      );
    return response.data.data;
  }

  async searchPosts(
    query: string,
    page = 1,
    limit = 10
  ): Promise<PostsResponse> {
    const response: AxiosResponse<ApiResponse<PostsResponse>> =
      await this.api.get(
        `/search/posts?q=${encodeURIComponent( query )}&page=${page}&limit=${limit}`
      );
    return response.data.data;
  }
}

export const apiService = new ApiService();
