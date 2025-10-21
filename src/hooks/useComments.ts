import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import {
  apiService,
  CreateCommentRequest,
  GetCommentsParams,
  UpdateCommentRequest,
} from "../services/api";
import { Comment, CommentsResponse } from "../types";
import { useAuthStore } from "../stores/authStore";
import { postKeys } from "./usePosts";
import { queryClient } from "../lib/queryClient";

export const commentKeys = {
  all: ["comments"] as const,
  lists: () => [...commentKeys.all, "list"] as const,
  list: (postId: string, params?: GetCommentsParams) =>
    [...commentKeys.lists(), postId, params] as const,
  details: () => [...commentKeys.all, "detail"] as const,
  detail: (id: string) => [...commentKeys.details(), id] as const,
  user: (userId: string) => [...commentKeys.all, "user", userId] as const,
  liked: () => [...commentKeys.all, "liked"] as const,
  me: () => [...commentKeys.all, "me"] as const,
  search: (query: string, params?: any) =>
    [...commentKeys.all, "search", query, params] as const,
  stats: (postId: string) => [...commentKeys.all, "stats", postId] as const,
};

export function useInfiniteComments(
  postId: string,
  params: GetCommentsParams = {},
) {
  return useInfiniteQuery({
    queryKey: commentKeys.list(postId, params),
    queryFn: ({ pageParam = 1 }) =>
      apiService.getComments(postId, { ...params, page: pageParam }),
    getNextPageParam: (lastPage: CommentsResponse) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.limit);
      if (lastPage.page < totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useComments(postId: string, params: GetCommentsParams = {}) {
  return useQuery({
    queryKey: commentKeys.list(postId, params),
    queryFn: () => apiService.getComments(postId, params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useComment(id: string) {
  return useQuery({
    queryKey: commentKeys.detail(id),
    queryFn: () => apiService.getComment(id),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyComments(params: { page?: number; limit?: number } = {}) {
  return useInfiniteQuery({
    queryKey: [...commentKeys.me(), params],
    queryFn: ({ pageParam = 1 }) =>
      apiService.getMyComments({ ...params, page: pageParam }),
    getNextPageParam: (lastPage: CommentsResponse) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.limit);
      if (lastPage.page < totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

export function useUserComments(
  userId: string,
  params: { page?: number; limit?: number } = {},
) {
  return useInfiniteQuery({
    queryKey: [...commentKeys.user(userId), params],
    queryFn: ({ pageParam = 1 }) =>
      apiService.getUserComments(userId, { ...params, page: pageParam }),
    getNextPageParam: (lastPage: CommentsResponse) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.limit);
      if (lastPage.page < totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

export function useLikedComments(
  params: { page?: number; limit?: number } = {},
) {
  return useInfiniteQuery({
    queryKey: [...commentKeys.liked(), params],
    queryFn: ({ pageParam = 1 }) =>
      apiService.getLikedComments({ ...params, page: pageParam }),
    getNextPageParam: (lastPage: CommentsResponse) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.limit);
      if (lastPage.page < totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

export function useSearchComments(params: {
  q: string;
  postId?: string;
  page?: number;
  limit?: number;
}) {
  return useInfiniteQuery({
    queryKey: commentKeys.search(params.q, params),
    queryFn: ({ pageParam = 1 }) =>
      apiService.searchComments({ ...params, page: pageParam }),
    getNextPageParam: (lastPage: CommentsResponse) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.limit);
      if (lastPage.page < totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!params.q.trim(),
  });
}

export function useCommentStats(postId: string) {
  return useQuery({
    queryKey: commentKeys.stats(postId),
    queryFn: () => apiService.getCommentStats(postId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateComment() {
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({
      postId,
      data,
    }: {
      postId: string;
      data: CreateCommentRequest;
    }) => apiService.createComment(postId, data),
    onMutate: async ({ postId, data }) => {
      await queryClient.cancelQueries({ queryKey: commentKeys.list(postId) });
      await queryClient.cancelQueries({ queryKey: postKeys.detail(postId) });
      await queryClient.cancelQueries({ queryKey: postKeys.lists() });

      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,
        content: data.content,
        author: user!,
        postId,
        parentId: data.parentCommentId,
        location: undefined,
        type: "text",
        status: "active",
        isPublic: true,
        allowReplies: true,
        allowLikes: true,
        allowShares: true,
        allowBookmarks: true,
        allowReactions: true,
        isRepost: false,
        isQuote: false,
        likesCount: 0,
        dislikesCount: 0,
        repliesCount: 0,
        sharesCount: 0,
        bookmarksCount: 0,
        viewsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: undefined,
        originalComment: null,
        repostContent: null,
        pollQuestion: null,
        pollOptions: null,
        pollEndDate: null,
        pollResults: null,
        replies: [],
        likes: [],
        isLiked: false,
        isDisliked: false,
        _count: {
          likes: 0,
          dislikes: 0,
          replies: 0,
        },
      };

      const allCommentQueries = queryClient.getQueriesData({
        queryKey: commentKeys.lists(),
      });

      allCommentQueries.forEach(([queryKey]) => {
        if (queryKey.includes(postId)) {
          queryClient.setQueryData(queryKey, (old: any) => {
            if (!old) return old;

            if (old.pages) {
              return {
                ...old,
                pages: old.pages.map(
                  (page: CommentsResponse, index: number) => {
                    if (index === 0) {
                      return {
                        ...page,
                        comments: [optimisticComment, ...page.comments],
                        total: page.total + 1,
                      };
                    }
                    return page;
                  },
                ),
              };
            }

            return {
              ...old,
              comments: [optimisticComment, ...old.comments],
              total: old.total + 1,
            };
          });
        }
      });

      queryClient.setQueryData(postKeys.detail(postId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          commentsCount: old.commentsCount + 1,
          _count: {
            ...old._count,
            comments: (old._count?.comments || 0) + 1,
          },
        };
      });

      queryClient.setQueriesData({ queryKey: postKeys.lists() }, (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: any) =>
              post.id === postId
                ? {
                    ...post,
                    commentsCount: post.commentsCount + 1,
                    _count: {
                      ...post._count,
                      comments: (post._count?.comments || 0) + 1,
                    },
                  }
                : post,
            ),
          })),
        };
      });

      return { optimisticComment };
    },
    onError: (_err, { postId }, context) => {
      if (context?.optimisticComment) {
        const allCommentQueries = queryClient.getQueriesData({
          queryKey: commentKeys.lists(),
        });

        allCommentQueries.forEach(([queryKey]) => {
          if (queryKey.includes(postId)) {
            queryClient.setQueryData(queryKey, (old: any) => {
              if (!old) return old;

              if (old.pages) {
                return {
                  ...old,
                  pages: old.pages.map(
                    (page: CommentsResponse, index: number) => {
                      if (index === 0) {
                        return {
                          ...page,
                          comments: page.comments.filter(
                            (comment: Comment) =>
                              comment.id !== context.optimisticComment.id,
                          ),
                          total: Math.max(0, page.total - 1),
                        };
                      }
                      return page;
                    },
                  ),
                };
              }

              // Handle regular query
              return {
                ...old,
                comments: old.comments.filter(
                  (comment: Comment) =>
                    comment.id !== context.optimisticComment.id,
                ),
                total: Math.max(0, old.total - 1),
              };
            });
          }
        });

        // Revert post comment count
        queryClient.setQueryData(postKeys.detail(postId), (old: any) => {
          if (!old) return old;
          return {
            ...old,
            commentsCount: Math.max(0, old.commentsCount - 1),
            _count: {
              ...old._count,
              comments: Math.max(0, (old._count?.comments || 0) - 1),
            },
          };
        });
      }
    },
    onSuccess: (newComment, { postId }, context) => {
      if (context?.optimisticComment) {
        const allCommentQueries = queryClient.getQueriesData({
          queryKey: commentKeys.lists(),
        });

        allCommentQueries.forEach(([queryKey]) => {
          if (queryKey.includes(postId)) {
            queryClient.setQueryData(queryKey, (old: any) => {
              if (!old) return old;

              // Handle infinite query
              if (old.pages) {
                return {
                  ...old,
                  pages: old.pages.map(
                    (page: CommentsResponse, index: number) => {
                      if (index === 0) {
                        return {
                          ...page,
                          comments: page.comments.map((comment: Comment) =>
                            comment.id === context.optimisticComment.id
                              ? newComment
                              : comment,
                          ),
                        };
                      }
                      return page;
                    },
                  ),
                };
              }

              return {
                ...old,
                comments: old.comments.map((comment: Comment) =>
                  comment.id === context.optimisticComment.id
                    ? newComment
                    : comment,
                ),
              };
            });
          }
        });
      }

      queryClient.invalidateQueries({ queryKey: commentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.invalidateQueries({ queryKey: commentKeys.me() });
    },
  });
}

export function useUpdateComment() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCommentRequest }) =>
      apiService.updateComment(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: commentKeys.detail(id) });

      const previousComment = queryClient.getQueryData(commentKeys.detail(id));

      queryClient.setQueryData(
        commentKeys.detail(id),
        (old: Comment | undefined) => {
          if (!old) return old;
          return {
            ...old,
            ...data,
            updatedAt: new Date().toISOString(),
          };
        },
      );

      queryClient.setQueriesData(
        { queryKey: commentKeys.lists() },
        (old: any) => {
          if (!old) return old;

          if (old.pages) {
            return {
              ...old,
              pages: old.pages.map((page: CommentsResponse) => ({
                ...page,
                comments: page.comments.map((comment: Comment) =>
                  comment.id === id
                    ? {
                        ...comment,
                        ...data,
                        updatedAt: new Date().toISOString(),
                      }
                    : comment,
                ),
              })),
            };
          }

          return {
            ...old,
            comments: old.comments.map((comment: Comment) =>
              comment.id === id
                ? { ...comment, ...data, updatedAt: new Date().toISOString() }
                : comment,
            ),
          };
        },
      );

      return { previousComment };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousComment) {
        queryClient.setQueryData(
          commentKeys.detail(id),
          context.previousComment,
        );
      }
      queryClient.invalidateQueries({ queryKey: commentKeys.lists() });
    },
    onSuccess: (updatedComment, { id }) => {
      queryClient.setQueryData(commentKeys.detail(id), updatedComment);
      queryClient.invalidateQueries({ queryKey: commentKeys.lists() });
    },
  });
}

export function useDeleteComment() {
  return useMutation({
    mutationFn: (id: string) => apiService.deleteComment(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: commentKeys.lists() });

      let postId: string | null = null;
      const commentQueries = queryClient.getQueriesData({
        queryKey: commentKeys.lists(),
      });

      for (const [_queryKey, data] of commentQueries) {
        if (data && typeof data === "object") {
          const queryData = data as any;
          const pages = queryData.pages || [queryData];

          for (const page of pages) {
            const comment = page.comments?.find((c: Comment) => c.id === id);
            if (comment) {
              postId = comment.postId;
              break;
            }
          }
          if (postId) break;
        }
      }

      const previousData = queryClient.getQueriesData({
        queryKey: commentKeys.lists(),
      });

      queryClient.setQueriesData(
        { queryKey: commentKeys.lists() },
        (old: any) => {
          if (!old) return old;

          if (old.pages) {
            return {
              ...old,
              pages: old.pages.map((page: CommentsResponse) => ({
                ...page,
                comments: page.comments.filter(
                  (comment: Comment) => comment.id !== id,
                ),
                total: Math.max(0, page.total - 1),
              })),
            };
          }

          return {
            ...old,
            comments: old.comments.filter(
              (comment: Comment) => comment.id !== id,
            ),
            total: Math.max(0, old.total - 1),
          };
        },
      );

      if (postId) {
        queryClient.setQueryData(postKeys.detail(postId), (old: any) => {
          if (!old) return old;
          return {
            ...old,
            commentsCount: Math.max(0, old.commentsCount - 1),
            _count: {
              ...old._count,
              comments: Math.max(0, (old._count?.comments || 0) - 1),
            },
          };
        });

        queryClient.setQueriesData(
          { queryKey: postKeys.lists() },
          (old: any) => {
            if (!old) return old;

            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                posts: page.posts.map((post: any) =>
                  post.id === postId
                    ? {
                        ...post,
                        commentsCount: Math.max(0, post.commentsCount - 1),
                        _count: {
                          ...post._count,
                          comments: Math.max(
                            0,
                            (post._count?.comments || 0) - 1,
                          ),
                        },
                      }
                    : post,
                ),
              })),
            };
          },
        );
      }

      return { previousData, postId };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      if (context?.postId) {
        queryClient.invalidateQueries({
          queryKey: postKeys.detail(context.postId),
        });
        queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      }
    },
    onSuccess: (_, id, context) => {
      queryClient.removeQueries({ queryKey: commentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: commentKeys.lists() });

      if (context?.postId) {
        queryClient.invalidateQueries({
          queryKey: postKeys.detail(context.postId),
        });
        queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      }
    },
  });
}

export function useReactToComment() {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { reactionType: "like" | "dislike" };
    }) => apiService.reactToComment(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: commentKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: commentKeys.lists() });

      const updateComment = (comment: Comment) => {
        const isLike = data.reactionType === "like";
        const isDislike = data.reactionType === "dislike";

        let newLikesCount = comment.likesCount;
        let newDislikesCount = comment.dislikesCount;
        let newIsLiked = comment.isLiked;
        let newIsDisliked = comment.isDisliked;

        if (isLike) {
          if (comment.isDisliked) {
            newDislikesCount = Math.max(0, comment.dislikesCount - 1);
            newIsDisliked = false;
          }
          if (!comment.isLiked) {
            newLikesCount = comment.likesCount + 1;
            newIsLiked = true;
          }
        } else if (isDislike) {
          if (comment.isLiked) {
            newLikesCount = Math.max(0, comment.likesCount - 1);
            newIsLiked = false;
          }
          if (!comment.isDisliked) {
            newDislikesCount = comment.dislikesCount + 1;
            newIsDisliked = true;
          }
        }

        return {
          ...comment,
          isLiked: newIsLiked,
          isDisliked: newIsDisliked,
          likesCount: newLikesCount,
          dislikesCount: newDislikesCount,
          _count: {
            ...comment._count,
            likes: newLikesCount,
            dislikes: newDislikesCount,
          },
        };
      };

      queryClient.setQueryData(
        commentKeys.detail(id),
        (old: Comment | undefined) => {
          if (!old) return old;
          return updateComment(old);
        },
      );

      queryClient.setQueriesData(
        { queryKey: commentKeys.lists() },
        (old: any) => {
          if (!old) return old;

          if (old.pages) {
            return {
              ...old,
              pages: old.pages.map((page: CommentsResponse) => ({
                ...page,
                comments: page.comments.map((comment: Comment) =>
                  comment.id === id ? updateComment(comment) : comment,
                ),
              })),
            };
          }

          return {
            ...old,
            comments: old.comments.map((comment: Comment) =>
              comment.id === id ? updateComment(comment) : comment,
            ),
          };
        },
      );
    },
    onError: (_err, { id }) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: commentKeys.lists() });
    },
  });
}

export function useRemoveReaction() {
  return useMutation({
    mutationFn: (id: string) => apiService.removeCommentReaction(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: commentKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: commentKeys.lists() });

      const updateComment = (comment: Comment) => ({
        ...comment,
        isLiked: false,
        isDisliked: false,
        likesCount: comment.isLiked
          ? Math.max(0, comment.likesCount - 1)
          : comment.likesCount,
        dislikesCount: comment.isDisliked
          ? Math.max(0, comment.dislikesCount - 1)
          : comment.dislikesCount,
        _count: {
          ...comment._count,
          likes: comment.isLiked
            ? Math.max(0, (comment._count?.likes || 0) - 1)
            : comment._count?.likes || 0,
          dislikes: comment.isDisliked
            ? Math.max(0, (comment._count?.dislikes || 0) - 1)
            : comment._count?.dislikes || 0,
        },
      });

      queryClient.setQueryData(
        commentKeys.detail(id),
        (old: Comment | undefined) => {
          if (!old) return old;
          return updateComment(old);
        },
      );

      queryClient.setQueriesData(
        { queryKey: commentKeys.lists() },
        (old: any) => {
          if (!old) return old;

          if (old.pages) {
            return {
              ...old,
              pages: old.pages.map((page: CommentsResponse) => ({
                ...page,
                comments: page.comments.map((comment: Comment) =>
                  comment.id === id ? updateComment(comment) : comment,
                ),
              })),
            };
          }

          return {
            ...old,
            comments: old.comments.map((comment: Comment) =>
              comment.id === id ? updateComment(comment) : comment,
            ),
          };
        },
      );
    },
    onError: (_err, id) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: commentKeys.lists() });
    },
  });
}

export function useHideComment() {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      apiService.hideComment(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: commentKeys.lists() });
    },
  });
}

export function useUnhideComment() {
  return useMutation({
    mutationFn: (id: string) => apiService.unhideComment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: commentKeys.lists() });
    },
  });
}
