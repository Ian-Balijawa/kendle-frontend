import { create } from "zustand";
import { Post } from "../types";

interface PostStore {
  posts: Post[];
  selectedPost: Post | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  updatePost: (id: string, data: Partial<Post>) => void;
  deletePost: (id: string) => void;
  likePost: (id: string) => void;
  unlikePost: (id: string) => void;
  bookmarkPost: (id: string) => void;
  unbookmarkPost: (id: string) => void;
  sharePost: (id: string) => void;
  setSelectedPost: (post: Post | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const usePostStore = create<PostStore>((set, get) => ({
  posts: [],
  selectedPost: null,
  isLoading: false,
  error: null,

  setPosts: (posts: Post[]) => {
    set({ posts });
  },

  addPost: (post: Post) => {
    set((state) => ({
      posts: [post, ...state.posts],
    }));
  },

  updatePost: (id: string, data: Partial<Post>) => {
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === id
          ? { ...post, ...data, updatedAt: new Date().toISOString() }
          : post
      ),
      selectedPost:
        state.selectedPost?.id === id
          ? {
              ...state.selectedPost,
              ...data,
              updatedAt: new Date().toISOString(),
            }
          : state.selectedPost,
    }));
  },

  deletePost: (id: string) => {
    set((state) => ({
      posts: state.posts.filter((post) => post.id !== id),
      selectedPost: state.selectedPost?.id === id ? null : state.selectedPost,
    }));
  },

  likePost: (id: string) => {
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === id
          ? {
              ...post,
              isLiked: true,
              _count: {
                ...post._count,
                likes: post._count.likes + 1,
              },
            }
          : post
      ),
      selectedPost:
        state.selectedPost?.id === id
          ? {
              ...state.selectedPost,
              isLiked: true,
              _count: {
                ...state.selectedPost._count,
                likes: state.selectedPost._count.likes + 1,
              },
            }
          : state.selectedPost,
    }));
  },

  unlikePost: (id: string) => {
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === id
          ? {
              ...post,
              isLiked: false,
              _count: {
                ...post._count,
                likes: Math.max(0, post._count.likes - 1),
              },
            }
          : post
      ),
      selectedPost:
        state.selectedPost?.id === id
          ? {
              ...state.selectedPost,
              isLiked: false,
              _count: {
                ...state.selectedPost._count,
                likes: Math.max(0, state.selectedPost._count.likes - 1),
              },
            }
          : state.selectedPost,
    }));
  },

  bookmarkPost: (id: string) => {
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === id
          ? {
              ...post,
              isBookmarked: true,
            }
          : post
      ),
      selectedPost:
        state.selectedPost?.id === id
          ? {
              ...state.selectedPost,
              isBookmarked: true,
            }
          : state.selectedPost,
    }));
  },

  unbookmarkPost: (id: string) => {
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === id
          ? {
              ...post,
              isBookmarked: false,
            }
          : post
      ),
      selectedPost:
        state.selectedPost?.id === id
          ? {
              ...state.selectedPost,
              isBookmarked: false,
            }
          : state.selectedPost,
    }));
  },

  sharePost: (id: string) => {
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === id
          ? {
              ...post,
              isShared: true,
              _count: {
                ...post._count,
                shares: post._count.shares + 1,
              },
            }
          : post
      ),
      selectedPost:
        state.selectedPost?.id === id
          ? {
              ...state.selectedPost,
              isShared: true,
              _count: {
                ...state.selectedPost._count,
                shares: state.selectedPost._count.shares + 1,
              },
            }
          : state.selectedPost,
    }));
  },

  setSelectedPost: (post: Post | null) => {
    set({ selectedPost: post });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));
