import { notifications } from "@mantine/notifications";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { useAuthStore } from "../stores/authStore";
import {
  ApiResponse,
  AuthResponse,
  Chat,
  Comment,
  CommentsResponse,
  CreateMessageData,
  CreatePostData,
  Message,
  Notification,
  Post,
  PostsResponse,
  UpdatePostData,
  UpdateUserData,
  User,
  UsersResponse,
} from "../types";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
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
        notifications.show({
          title: "Request",
          message: config.url,
          color: "blue",
        });
        return config;
      },
      (error) => {
        notifications.show({
          title: "Error",
          message: error.response?.data.message,
          color: "red",
        });
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          useAuthStore.getState().logout();
        }
        return Promise.reject(error);
      }
    );
  }

  async login(credentials: any): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> =
      await this.api.post("/auth/login", credentials);
    return response.data.data;
  }

  async getPosts(page = 1, limit = 10): Promise<PostsResponse> {
    const response: AxiosResponse<ApiResponse<PostsResponse>> =
      await this.api.get(`/posts?page=${page}&limit=${limit}`);
    return response.data.data;
  }

  async getPost(id: string): Promise<Post> {
    const response: AxiosResponse<ApiResponse<Post>> = await this.api.get(
      `/posts/${id}`
    );
    return response.data.data;
  }

  async createPost(data: CreatePostData): Promise<Post> {
    const formData = new FormData();
    formData.append("content", data.content);

    if (data.media) {
      data.media.forEach((file) => {
        formData.append("media", file);
      });
    }

    if (data.hashtags) {
      formData.append("hashtags", JSON.stringify(data.hashtags));
    }

    if (data.mentions) {
      formData.append("mentions", JSON.stringify(data.mentions));
    }

    const response: AxiosResponse<ApiResponse<Post>> = await this.api.post(
      "/posts",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  }

  async updatePost(id: string, data: UpdatePostData): Promise<Post> {
    const response: AxiosResponse<ApiResponse<Post>> = await this.api.put(
      `/posts/${id}`,
      data
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

  async getComments(
    postId: string,
    page = 1,
    limit = 10
  ): Promise<CommentsResponse> {
    const response: AxiosResponse<ApiResponse<CommentsResponse>> =
      await this.api.get(
        `/posts/${postId}/comments?page=${page}&limit=${limit}`
      );
    return response.data.data;
  }

  async createComment(
    postId: string,
    content: string,
    parentId?: string
  ): Promise<Comment> {
    const response: AxiosResponse<ApiResponse<Comment>> = await this.api.post(
      `/posts/${postId}/comments`,
      { content, parentId }
    );
    return response.data.data;
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.api.delete(`/comments/${commentId}`);
  }

  async getUser(id: string): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get(
      `/users/${id}`
    );
    return response.data.data;
  }

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
      }
    );
    return response.data.data;
  }

  async followUser(userId: string): Promise<void> {
    await this.api.post(`/users/${userId}/follow`);
  }

  async unfollowUser(userId: string): Promise<void> {
    await this.api.delete(`/users/${userId}/follow`);
  }

  async getChats(): Promise<Chat[]> {
    const response: AxiosResponse<ApiResponse<Chat[]>> =
      await this.api.get("/chats");
    return response.data.data;
  }

  async getMessages(chatId: string, page = 1, limit = 50): Promise<Message[]> {
    const response: AxiosResponse<ApiResponse<Message[]>> = await this.api.get(
      `/chats/${chatId}/messages?page=${page}&limit=${limit}`
    );
    return response.data.data;
  }

  async sendMessage(data: CreateMessageData): Promise<Message> {
    const formData = new FormData();
    formData.append("content", data.content);
    formData.append("chatId", data.chatId);

    if (data.media) {
      data.media.forEach((file) => {
        formData.append("media", file);
      });
    }

    const response: AxiosResponse<ApiResponse<Message>> = await this.api.post(
      "/messages",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
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
    limit = 10
  ): Promise<UsersResponse> {
    const response: AxiosResponse<ApiResponse<UsersResponse>> =
      await this.api.get(
        `/search/users?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
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
        `/search/posts?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      );
    return response.data.data;
  }
}

export const apiService = new ApiService();
