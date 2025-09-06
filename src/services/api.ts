import { notifications } from "@mantine/notifications";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { useAuthStore } from "../stores/authStore";
import {
  ApiResponse,
  AuthResponse,
  Comment,
  CommentsResponse,
  Conversation,
  Message,
  Notification,
  Post,
  PostsResponse,
  UpdateUserData,
  User,
  UsersResponse,
  Status,
  StatusesResponse,
  StatusReply,
  StatusRepliesResponse,
  StatusAnalytics,
} from "../types";

// API request/response types based on the provided endpoints
export interface CreatePostRequest {
  content: string;
  media?: {
    type: "image" | "video";
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
  type?:
    | "text"
    | "image"
    | "video"
    | "poll"
    | "event"
    | "repost"
    | "quote"
    | "article"
    | "story";
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
    type: "image" | "video";
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
  status?: "draft" | "published";
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
}

export interface CreateCommentRequest {
  content: string;
  media?: {
    type: "image" | "video";
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
    type: "image" | "video";
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
  type?:
    | "text"
    | "image"
    | "video"
    | "poll"
    | "event"
    | "repost"
    | "quote"
    | "article"
    | "story";
  search?: string;
  tag?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GetCommentsParams {
  page?: number;
  limit?: number;
  parentCommentId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
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

// Status request/response types
export interface CreateStatusRequest {
  content: string;
  type: "image" | "video" | "text";
  privacy: "public" | "followers" | "close_friends" | "private";
  media?: {
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
  }[];
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

export interface UpdateStatusRequest {
  content?: string;
  privacy?: "public" | "followers" | "close_friends" | "private";
  location?: string;
  allowReplies?: boolean;
  allowReactions?: boolean;
  allowShares?: boolean;
  allowScreenshots?: boolean;
  highlightTitle?: string;
  closeFriends?: string[];
}

export interface GetStatusesParams {
  page?: number;
  limit?: number;
  authorId?: string;
  type?: "image" | "video" | "text";
  privacy?: "public" | "followers" | "close_friends" | "private";
  search?: string;
  location?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface StatusReactionRequest {
  reactionType: "like" | "love" | "laugh" | "wow" | "sad" | "angry";
}

export interface StatusReplyRequest {
  content: string;
  media?: {
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
  }[];
  location?: string;
}

export interface StatusViewRequest {
  viewDuration?: number;
  deviceType?: string;
  location?: string;
}

// Authentication request/response types
export interface SendOTPRequest {
  phoneNumber: string;
}

export interface VerifyOTPRequest {
  phoneNumber: string;
  otp: string;
}

export interface ResendOTPRequest {
  phoneNumber: string;
}

export interface LoginRequest {
  phoneNumber: string;
}

export interface CompleteProfileRequest {
  firstName: string;
  lastName: string;
  email: string | null;
  whatsapp: string | null;
  twitterLink: string | null;
  tiktokLink: string | null;
  instagramLink: string | null;
  bio: string | null;
}

// User profile request/response types
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string | null;
  username?: string;
  email?: string;
  whatsapp?: string;
  twitterLink?: string;
  tiktokLink?: string;
  instagramLink?: string;
}

export interface UserProfileCompleteRequest {
  firstName: string;
  lastName: string;
  email: string | null;
  whatsapp: string | null;
  twitterLink: string | null;
  tiktokLink: string | null;
  instagramLink: string | null;
  bio: string | null;
}

// Chat request/response types
export interface CreateConversationRequest {
  participantIds: string[];
  name?: string;
  description?: string;
}

export interface UpdateConversationRequest {
  isArchived?: boolean;
  isMuted?: boolean;
  isPinned?: boolean;
  name?: string;
  description?: string;
}

export interface SendMessageRequest {
  content: string;
  receiverId: string;
  conversationId: string;
  messageType?: "text" | "image" | "video" | "audio" | "file";
  replyToId?: string;
  metadata?: any;
}

export interface UpdateMessageRequest {
  content: string;
}

export interface AddReactionRequest {
  emoji: string;
  messageId: string;
}

export interface GetMessagesParams {
  limit?: number;
  offset?: number;
}

export interface UnreadCountResponse {
  count: number;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        notifications.show({
          title: "Error",
          message: error.response?.data?.message || "Request failed",
          color: "red",
        });
        return Promise.reject(error);
      },
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          useAuthStore.getState().logout();
        }
        return Promise.reject(error);
      },
    );
  }

  async sendOTP(data: SendOTPRequest): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post(
      "/auth/signin",
      data,
    );
    return response.data.data;
  }

  async verifyOTP(data: VerifyOTPRequest): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> =
      await this.api.post("/auth/verify-otp", data);
    return response.data.data;
  }

  async resendOTP(data: ResendOTPRequest): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post(
      "/auth/resend-otp",
      data,
    );
    return response.data.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> =
      await this.api.post("/auth/signin", data);
    return response.data.data;
  }

  async completeProfile(data: CompleteProfileRequest): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.post(
      "/auth/complete-profile",
      data,
    );
    return response.data.data;
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> =
      await this.api.get("/auth/me");
    return response.data.data.user;
  }

  // Posts API methods
  async getPosts(params: GetPostsParams = {}): Promise<PostsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const response: AxiosResponse<ApiResponse<PostsResponse>> =
      await this.api.get(`/posts?${searchParams.toString()}`);
    return response.data.data;
  }

  async getPost(id: string): Promise<Post> {
    const response: AxiosResponse<ApiResponse<{ post: Post }>> =
      await this.api.get(`/posts/${id}`);
    return response.data.data.post;
  }

  async createPost(data: CreatePostRequest): Promise<Post> {
    const response: AxiosResponse<ApiResponse<Post>> = await this.api.post(
      "/posts",
      data,
    );
    return response.data.data;
  }

  async updatePost(id: string, data: UpdatePostRequest): Promise<Post> {
    const response: AxiosResponse<ApiResponse<Post>> = await this.api.put(
      `/posts/${id}`,
      data,
    );
    return response.data.data;
  }

  async deletePost(id: string): Promise<void> {
    await this.api.delete(`/posts/${id}`);
  }

  async likePost(id: string): Promise<void> {
    await this.api.post(`/posts/${id}/like`);
  }

  async unlikePost(id: string): Promise<void> {
    await this.api.delete(`/posts/${id}/like`);
  }

  async bookmarkPost(id: string, data?: BookmarkRequest): Promise<void> {
    await this.api.post(`/posts/${id}/bookmark`, data);
  }

  async unbookmarkPost(id: string): Promise<void> {
    await this.api.delete(`/posts/${id}/bookmark`);
  }

  async reactToPost(id: string, data: ReactionRequest): Promise<void> {
    await this.api.post(`/posts/${id}/react`, data);
  }

  async removeReaction(id: string): Promise<void> {
    await this.api.delete(`/posts/${id}/react`);
  }

  async sharePost(id: string, data?: ShareRequest): Promise<void> {
    await this.api.post(`/posts/${id}/share`, data);
  }

  async getUserPosts(
    userId: string,
    params: { page?: number; limit?: number } = {},
  ): Promise<PostsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const response: AxiosResponse<ApiResponse<PostsResponse>> =
      await this.api.get(`/posts/user/${userId}?${searchParams.toString()}`);
    return response.data.data;
  }

  async getLikedPosts(
    params: { page?: number; limit?: number } = {},
  ): Promise<PostsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const response: AxiosResponse<ApiResponse<PostsResponse>> =
      await this.api.get(`/posts/user/liked?${searchParams.toString()}`);
    return response.data.data;
  }

  async getDislikedPosts(
    params: { page?: number; limit?: number } = {},
  ): Promise<PostsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const response: AxiosResponse<ApiResponse<PostsResponse>> =
      await this.api.get(`/posts/user/disliked?${searchParams.toString()}`);
    return response.data.data;
  }

  async getBookmarkedPosts(
    params: { page?: number; limit?: number } = {},
  ): Promise<PostsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const response: AxiosResponse<ApiResponse<PostsResponse>> =
      await this.api.get(`/posts/user/bookmarked?${searchParams.toString()}`);
    return response.data.data;
  }

  async getMyPosts(
    params: { page?: number; limit?: number } = {},
  ): Promise<PostsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const response: AxiosResponse<ApiResponse<PostsResponse>> =
      await this.api.get(`/posts/user/me?${searchParams.toString()}`);
    return response.data.data;
  }

  // Comments API methods
  async getComments(
    postId: string,
    params: GetCommentsParams = {},
  ): Promise<CommentsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const response: AxiosResponse<ApiResponse<CommentsResponse>> =
      await this.api.get(`/comments/post/${postId}?${searchParams.toString()}`);
    return response.data.data;
  }

  async getComment(id: string): Promise<Comment> {
    const response: AxiosResponse<ApiResponse<Comment>> = await this.api.get(
      `/comments/${id}`,
    );
    return response.data.data;
  }

  async createComment(
    postId: string,
    data: CreateCommentRequest,
  ): Promise<Comment> {
    const response: AxiosResponse<ApiResponse<Comment>> = await this.api.post(
      `/comments/post/${postId}`,
      data,
    );
    return response.data.data;
  }

  async updateComment(
    id: string,
    data: UpdateCommentRequest,
  ): Promise<Comment> {
    const response: AxiosResponse<ApiResponse<Comment>> = await this.api.put(
      `/comments/${id}`,
      data,
    );
    return response.data.data;
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.api.delete(`/comments/${commentId}`);
  }

  async reactToComment(id: string, data: ReactionRequest): Promise<void> {
    await this.api.post(`/comments/${id}/react`, data);
  }

  async removeCommentReaction(id: string): Promise<void> {
    await this.api.delete(`/comments/${id}/react`);
  }

  async getMyComments(
    params: { page?: number; limit?: number } = {},
  ): Promise<CommentsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const response: AxiosResponse<ApiResponse<CommentsResponse>> =
      await this.api.get(`/comments/user/me?${searchParams.toString()}`);
    return response.data.data;
  }

  async getUserComments(
    userId: string,
    params: { page?: number; limit?: number } = {},
  ): Promise<CommentsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const response: AxiosResponse<ApiResponse<CommentsResponse>> =
      await this.api.get(`/comments/user/${userId}?${searchParams.toString()}`);
    return response.data.data;
  }

  async getLikedComments(
    params: { page?: number; limit?: number } = {},
  ): Promise<CommentsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const response: AxiosResponse<ApiResponse<CommentsResponse>> =
      await this.api.get(`/comments/user/liked?${searchParams.toString()}`);
    return response.data.data;
  }

  async searchComments(params: {
    q: string;
    postId?: string;
    page?: number;
    limit?: number;
  }): Promise<CommentsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const response: AxiosResponse<ApiResponse<CommentsResponse>> =
      await this.api.get(`/comments/search?${searchParams.toString()}`);
    return response.data.data;
  }

  async getCommentStats(postId: string): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(
      `/comments/stats/post/${postId}`,
    );
    return response.data.data;
  }

  async hideComment(id: string, reason?: string): Promise<void> {
    await this.api.post(`/comments/${id}/hide`, { reason });
  }

  async unhideComment(id: string): Promise<void> {
    await this.api.post(`/comments/${id}/unhide`);
  }

  // Chat API methods
  async getConversations(): Promise<Conversation[]> {
    const response: AxiosResponse<ApiResponse<Conversation[]>> =
      await this.api.get("/chat/conversations");
    return response.data.data;
  }

  async getConversation(id: string): Promise<Conversation> {
    const response: AxiosResponse<ApiResponse<Conversation>> =
      await this.api.get(`/chat/conversations/${id}`);
    return response.data.data;
  }

  async createConversation(
    data: CreateConversationRequest,
  ): Promise<Conversation> {
    const response: AxiosResponse<ApiResponse<Conversation>> =
      await this.api.post("/chat/conversations", data);
    return response.data.data;
  }

  async updateConversation(
    id: string,
    data: UpdateConversationRequest,
  ): Promise<Conversation> {
    const response: AxiosResponse<ApiResponse<Conversation>> =
      await this.api.put(`/chat/conversations/${id}`, data);
    return response.data.data;
  }

  async getMessages(
    conversationId: string,
    params: GetMessagesParams = {},
  ): Promise<Message[]> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const response: AxiosResponse<ApiResponse<Message[]>> = await this.api.get(
      `/chat/conversations/${conversationId}/messages?${searchParams.toString()}`,
    );
    return response.data.data;
  }

  async sendMessage(
    conversationId: string,
    data: SendMessageRequest,
  ): Promise<Message> {
    const response: AxiosResponse<ApiResponse<Message>> = await this.api.post(
      `/chat/conversations/${conversationId}/messages`,
      data,
    );
    return response.data.data;
  }

  async updateMessage(
    id: string,
    data: UpdateMessageRequest,
  ): Promise<Message> {
    const response: AxiosResponse<ApiResponse<Message>> = await this.api.put(
      `/chat/messages/${id}`,
      data,
    );
    return response.data.data;
  }

  async deleteMessage(id: string): Promise<void> {
    await this.api.delete(`/chat/messages/${id}`);
  }

  async markMessageAsRead(id: string): Promise<Message> {
    const response: AxiosResponse<ApiResponse<Message>> = await this.api.put(
      `/chat/messages/${id}/read`,
    );
    return response.data.data;
  }

  async markConversationAsRead(id: string): Promise<void> {
    await this.api.put(`/chat/conversations/${id}/read`);
  }

  async addMessageReaction(
    id: string,
    data: AddReactionRequest,
  ): Promise<void> {
    await this.api.post(`/chat/messages/${id}/reactions`, data);
  }

  async getUnreadCount(): Promise<UnreadCountResponse> {
    const response: AxiosResponse<ApiResponse<UnreadCountResponse>> =
      await this.api.get("/chat/unread-count");
    return response.data.data;
  }

  async findOrCreateDirectConversation(
    participantId: string,
  ): Promise<Conversation> {
    const response: AxiosResponse<ApiResponse<Conversation>> =
      await this.api.post("/chat/conversations/direct", {
        participantId,
      });
    return response.data.data;
  }

  // User API methods
  async getCurrentUserProfile(): Promise<User> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> =
      await this.api.get("/user/profile");
    return response.data.data.user;
  }

  async updateUserProfile(data: UpdateProfileRequest): Promise<User> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> =
      await this.api.put("/user/profile", data);
    return response.data.data.user;
  }

  async completeUserProfile(data: UserProfileCompleteRequest): Promise<User> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> =
      await this.api.post("/user/profile/complete", data);
    return response.data.data.user;
  }

  async getUser(id: string): Promise<User> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> =
      await this.api.get(`/user/${id}`);
    return response.data.data.user;
  }

  async getUserByUsername(username: string): Promise<User> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> =
      await this.api.get(`/user/username/${username}`);
    return response.data.data.user;
  }

  // Legacy method for backward compatibility
  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response: AxiosResponse<ApiResponse<User>> = await this.api.put(
      `/users/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data.data;
  }

  async getNotifications(page = 1, limit = 20): Promise<Notification[]> {
    const response: AxiosResponse<ApiResponse<Notification[]>> =
      await this.api.get(`/notifications?page=${page}&limit=${limit}`);
    return response.data.data;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await this.api.put(`/notifications/${id}/read`);
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.api.put("/notifications/read-all");
  }

  async searchUsers(
    query: string,
    page = 1,
    limit = 10,
  ): Promise<UsersResponse> {
    const response: AxiosResponse<ApiResponse<UsersResponse>> =
      await this.api.get(
        `/search/users?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
      );
    return response.data.data;
  }

  async searchPosts(
    query: string,
    page = 1,
    limit = 10,
  ): Promise<PostsResponse> {
    const response: AxiosResponse<ApiResponse<PostsResponse>> =
      await this.api.get(
        `/search/posts?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
      );
    return response.data.data;
  }

  // Follow/Unfollow API methods
  async followUser(targetUserId: string): Promise<void> {
    await this.api.post("/user/follow", { targetUserId });
  }

  async unfollowUser(targetUserId: string): Promise<void> {
    await this.api.delete("/user/unfollow", { data: { targetUserId } });
  }

  async getUserFollowers(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    followers: User[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  }> {
    const response: AxiosResponse<
      ApiResponse<{
        followers: User[];
        totalCount: number;
        currentPage: number;
        totalPages: number;
        limit: number;
      }>
    > = await this.api.get(
      `/user/${userId}/followers?page=${page}&limit=${limit}`,
    );
    return response.data.data;
  }

  async getUserFollowing(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    following: User[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  }> {
    const response: AxiosResponse<
      ApiResponse<{
        following: User[];
        totalCount: number;
        currentPage: number;
        totalPages: number;
        limit: number;
      }>
    > = await this.api.get(
      `/user/${userId}/following?page=${page}&limit=${limit}`,
    );
    return response.data.data;
  }

  async getFollowStatus(targetUserId: string): Promise<{
    isFollowing: boolean;
    followRelationship: any;
  }> {
    const response: AxiosResponse<
      ApiResponse<{
        isFollowing: boolean;
        followRelationship: any;
      }>
    > = await this.api.get(`/user/${targetUserId}/follow-status`);
    return response.data.data;
  }

  async getUserLikedPosts(
    userId: string,
    params: { page?: number; limit?: number } = {},
  ): Promise<PostsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const response: AxiosResponse<ApiResponse<PostsResponse>> =
      await this.api.get(
        `/posts/user/${userId}/liked?${searchParams.toString()}`,
      );
    return response.data.data;
  }

  async getUserDislikedPosts(
    userId: string,
    params: { page?: number; limit?: number } = {},
  ): Promise<PostsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const response: AxiosResponse<ApiResponse<PostsResponse>> =
      await this.api.get(
        `/posts/user/${userId}/disliked?${searchParams.toString()}`,
      );
    return response.data.data;
  }

  async getUserBookmarkedPosts(
    userId: string,
    params: { page?: number; limit?: number } = {},
  ): Promise<PostsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const response: AxiosResponse<ApiResponse<PostsResponse>> =
      await this.api.get(
        `/posts/user/${userId}/bookmarked?${searchParams.toString()}`,
      );
    return response.data.data;
  }

  async getSuggestedUsers(
    limit = 10,
  ): Promise<{ suggestions: User[]; count: number }> {
    const response: AxiosResponse<
      ApiResponse<{ suggestions: User[]; count: number }>
    > = await this.api.get(`/user/suggestions?limit=${limit}`);
    return response.data.data;
  }

  // Status API methods
  async createStatus(data: CreateStatusRequest): Promise<Status> {
    const response: AxiosResponse<ApiResponse<Status>> = await this.api.post(
      "/statuses",
      data,
    );
    return response.data.data;
  }

  async getStatuses(params: GetStatusesParams = {}): Promise<StatusesResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const response: AxiosResponse<ApiResponse<StatusesResponse>> =
      await this.api.get(`/statuses?${searchParams.toString()}`);
    return response.data.data;
  }

  async getStatus(id: string): Promise<Status> {
    const response: AxiosResponse<ApiResponse<Status>> = await this.api.get(
      `/statuses/${id}`,
    );
    return response.data.data;
  }

  async updateStatus(id: string, data: UpdateStatusRequest): Promise<Status> {
    const response: AxiosResponse<ApiResponse<Status>> = await this.api.put(
      `/statuses/${id}`,
      data,
    );
    return response.data.data;
  }

  async deleteStatus(id: string): Promise<void> {
    await this.api.delete(`/statuses/${id}`);
  }

  async reactToStatus(id: string, data: StatusReactionRequest): Promise<void> {
    await this.api.post(`/statuses/${id}/react`, data);
  }

  async removeStatusReaction(id: string): Promise<void> {
    await this.api.delete(`/statuses/${id}/react`);
  }

  async replyToStatus(id: string, data: StatusReplyRequest): Promise<StatusReply> {
    const response: AxiosResponse<ApiResponse<StatusReply>> = await this.api.post(
      `/statuses/${id}/reply`,
      data,
    );
    return response.data.data;
  }

  async viewStatus(id: string, data: StatusViewRequest): Promise<void> {
    await this.api.post(`/statuses/${id}/view`, data);
  }

  async getStatusAnalytics(id: string): Promise<StatusAnalytics> {
    const response: AxiosResponse<ApiResponse<StatusAnalytics>> =
      await this.api.get(`/statuses/${id}/analytics`);
    return response.data.data;
  }

  async getUserStatuses(
    userId: string,
    params: { page?: number; limit?: number } = {},
  ): Promise<StatusesResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const response: AxiosResponse<ApiResponse<StatusesResponse>> =
      await this.api.get(`/statuses/user/${userId}?${searchParams.toString()}`);
    return response.data.data;
  }

  async getMyStatuses(
    params: { page?: number; limit?: number } = {},
  ): Promise<StatusesResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const response: AxiosResponse<ApiResponse<StatusesResponse>> =
      await this.api.get(`/statuses/user/me?${searchParams.toString()}`);
    return response.data.data;
  }

  async getStatusReplies(
    id: string,
    params: { page?: number; limit?: number } = {},
  ): Promise<StatusRepliesResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const response: AxiosResponse<ApiResponse<StatusRepliesResponse>> =
      await this.api.get(`/statuses/${id}/replies?${searchParams.toString()}`);
    return response.data.data;
  }
}

export const apiService = new ApiService();
