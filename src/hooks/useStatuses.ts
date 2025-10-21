import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import {
  apiService,
  CreateStatusRequest,
  GetStatusesParams,
  UpdateStatusRequest,
  StatusReactionRequest,
  StatusReplyRequest,
} from "../services/api";
import { CreateStatusData } from "../types/status";
import { useAuthStore } from "../stores/authStore";
import {
  Status,
  StatusesResponse,
  StatusReply,
  StatusRepliesResponse,
} from "../types";

export const statusKeys = {
  all: ["statuses"] as const,
  lists: () => [...statusKeys.all, "list"] as const,
  list: (params: GetStatusesParams) => [...statusKeys.lists(), params] as const,
  details: () => [...statusKeys.all, "detail"] as const,
  detail: (id: string) => [...statusKeys.details(), id] as const,
  user: (userId: string) => [...statusKeys.all, "user", userId] as const,
  me: () => [...statusKeys.all, "me"] as const,
  replies: (statusId: string) =>
    [...statusKeys.all, "replies", statusId] as const,
  analytics: (statusId: string) =>
    [...statusKeys.all, "analytics", statusId] as const,
};

export function useInfiniteStatuses(params: GetStatusesParams = {}) {
  return useInfiniteQuery({
    queryKey: statusKeys.list(params),
    queryFn: ({ pageParam = 1 }) =>
      apiService.getStatuses({ ...params, page: pageParam }),
    getNextPageParam: (lastPage: StatusesResponse) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.limit);
      if (lastPage.page < totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

export function useStatus(id: string) {
  return useQuery({
    queryKey: statusKeys.detail(id),
    queryFn: () => apiService.getStatus(id),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserStatuses(
  userId: string,
  params: { page?: number; limit?: number } = {},
) {
  return useInfiniteQuery({
    queryKey: [...statusKeys.user(userId), params],
    queryFn: ({ pageParam = 1 }) =>
      apiService.getUserStatuses(userId, { ...params, page: pageParam }),
    getNextPageParam: (lastPage: StatusesResponse) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.limit);
      if (lastPage.page < totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

export function useMyStatuses(params: { page?: number; limit?: number } = {}) {
  return useInfiniteQuery({
    queryKey: [...statusKeys.me(), params],
    queryFn: ({ pageParam = 1 }) =>
      apiService.getMyStatuses({ ...params, page: pageParam }),
    getNextPageParam: (lastPage: StatusesResponse) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.limit);
      if (lastPage.page < totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

export function useStatusReplies(
  statusId: string,
  params: { page?: number; limit?: number } = {},
) {
  return useInfiniteQuery({
    queryKey: [...statusKeys.replies(statusId), params],
    queryFn: ({ pageParam = 1 }) =>
      apiService.getStatusReplies(statusId, { ...params, page: pageParam }),
    getNextPageParam: (lastPage: StatusRepliesResponse) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.limit);
      if (lastPage.page < totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

export function useStatusAnalytics(statusId: string) {
  return useQuery({
    queryKey: statusKeys.analytics(statusId),
    queryFn: () => apiService.getStatusAnalytics(statusId),
  });
}

export function useCreateStatus() {
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (data: CreateStatusData) => {
      const requestData: CreateStatusRequest = {
        content: data.content,
        type: data.type,
        privacy: data.privacy,
        media: data.media,
        thumbnail: data.thumbnail,
        location: data.location,
        musicTrack: data.musicTrack,
        musicArtist: data.musicArtist,
        stickers: data.stickers,
        pollQuestion: data.pollQuestion,
        pollOptions: data.pollOptions,
        highlightTitle: data.highlightTitle,
        closeFriends: data.closeFriends,
        expirationHours: data.expirationHours ?? 24,
      };
      return apiService.createStatus(requestData);
    },
    onMutate: async (newStatus) => {
      await queryClient.cancelQueries({ queryKey: statusKeys.lists() });

      const optimisticStatus: Status = {
        id: `temp-${Date.now()}`,
        content: newStatus.content,
        type: newStatus.type,
        privacy: newStatus.privacy,
        status: "active",
        media: newStatus.media?.map((file, index) => ({
          id: `temp-media-${index}`,
          url: URL.createObjectURL(file),
          mediaType: newStatus.type === "text" ? "image" : newStatus.type,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          order: index,
          status: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
        })),
        location: newStatus.location,
        musicTrack: newStatus.musicTrack,
        musicArtist: newStatus.musicArtist,
        stickers: newStatus.stickers,
        pollQuestion: newStatus.pollQuestion,
        pollOptions: newStatus.pollOptions,
        highlightTitle: newStatus.highlightTitle,
        closeFriends: newStatus.closeFriends,
        expirationHours: newStatus.expirationHours ?? 24,
        viewsCount: 0,
        views: [],
        repliesCount: 0,
        reactionsCount: 0,
        sharesCount: 0,
        isViewed: false,
        isReacted: false,
        isReplied: false,
        isShared: false,
        reactions: [],
        replies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: new Date(
          Date.now() + (newStatus.expirationHours ?? 24) * 60 * 60 * 1000,
        ).toISOString(),
        isExpired: false,
        author: user
          ? {
              ...user,
              firstName: user.firstName || undefined,
              lastName: user.lastName || undefined,
              username: user.username || undefined,
              phoneNumber: user.phoneNumber || "",
              email: user.email || undefined,
              isVerified: user.isVerified || false,
              avatar: user.avatar || undefined,
              bio: user.bio || undefined,
              followersCount: user.followersCount || 0,
              followingCount: user.followingCount || 0,
              postsCount: user.postsCount || 0,
              isProfileComplete: user.isProfileComplete || false,
              status: user.status || "active",
              createdAt: user.createdAt || new Date().toISOString(),
              updatedAt: user.updatedAt || new Date().toISOString(),
            }
          : {
              id: "unknown",
              firstName: undefined,
              lastName: undefined,
              username: undefined,
              phoneNumber: "",
              email: undefined,
              isVerified: false,
              avatar: undefined,
              bio: undefined,
              followersCount: 0,
              followingCount: 0,
              postsCount: 0,
              isProfileComplete: false,
              status: "active",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
      };

      queryClient.setQueriesData(
        { queryKey: statusKeys.lists() },
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page: StatusesResponse, index: number) => {
              if (index === 0) {
                const existingCollection = page.groupedStatuses.find(
                  (collection) =>
                    collection.author.id === optimisticStatus.author.id,
                );

                if (existingCollection) {
                  existingCollection.statuses.unshift(optimisticStatus);
                } else {
                  page.groupedStatuses.unshift({
                    author: optimisticStatus.author,
                    statuses: [optimisticStatus],
                    hasUnviewed: false,
                    lastUpdated: optimisticStatus.createdAt,
                  });
                }

                return {
                  ...page,
                  total: page.total + 1,
                };
              }
              return page;
            }),
          };
        },
      );

      return { optimisticStatus };
    },
    onError: (_, __, context) => {
      if (context?.optimisticStatus) {
        queryClient.setQueriesData(
          { queryKey: statusKeys.lists() },
          (old: any) => {
            if (!old) return old;

            return {
              ...old,
              pages: old.pages.map((page: StatusesResponse, index: number) => {
                if (index === 0) {
                  page.groupedStatuses.forEach((collection) => {
                    collection.statuses = collection.statuses.filter(
                      (status: Status) =>
                        status.id !== context.optimisticStatus.id,
                    );
                  });

                  page.groupedStatuses = page.groupedStatuses.filter(
                    (collection) => collection.statuses.length > 0,
                  );

                  return {
                    ...page,
                    total: Math.max(0, page.total - 1),
                  };
                }
                return page;
              }),
            };
          },
        );
      }
    },
    onSuccess: (newStatus, _, context) => {
      if (context?.optimisticStatus) {
        queryClient.setQueriesData(
          { queryKey: statusKeys.lists() },
          (old: any) => {
            if (!old) return old;

            return {
              ...old,
              pages: old.pages.map((page: StatusesResponse, index: number) => {
                if (index === 0) {
                  page.groupedStatuses.forEach((collection) => {
                    collection.statuses = collection.statuses.map(
                      (status: Status) =>
                        status.id === context.optimisticStatus.id
                          ? newStatus
                          : status,
                    );
                  });

                  return page;
                }
                return page;
              }),
            };
          },
        );
      }

      queryClient.invalidateQueries({ queryKey: statusKeys.lists() });
      queryClient.invalidateQueries({ queryKey: statusKeys.me() });
    },
  });
}

export function useUpdateStatus() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStatusRequest }) =>
      apiService.updateStatus(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: statusKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: statusKeys.lists() });

      const previousStatus = queryClient.getQueryData(statusKeys.detail(id));

      queryClient.setQueryData(
        statusKeys.detail(id),
        (old: Status | undefined) => {
          if (!old) return old;
          return {
            ...old,
            ...data,
            updatedAt: new Date().toISOString(),
          };
        },
      );

      queryClient.setQueriesData(
        { queryKey: statusKeys.lists() },
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page: StatusesResponse) => ({
              ...page,
              groupedStatuses: page.groupedStatuses.map((collection) => ({
                ...collection,
                statuses: collection.statuses.map((status: Status) =>
                  status.id === id
                    ? {
                        ...status,
                        ...data,
                        updatedAt: new Date().toISOString(),
                      }
                    : status,
                ),
              })),
            })),
          };
        },
      );

      return { previousStatus };
    },
    onError: (_, { id }, context) => {
      if (context?.previousStatus) {
        queryClient.setQueryData(statusKeys.detail(id), context.previousStatus);
      }
      queryClient.invalidateQueries({ queryKey: statusKeys.lists() });
    },
    onSuccess: (updatedStatus, { id }) => {
      queryClient.setQueryData(statusKeys.detail(id), updatedStatus);
      queryClient.invalidateQueries({ queryKey: statusKeys.lists() });
    },
  });
}

export function useDeleteStatus() {
  return useMutation({
    mutationFn: (id: string) => apiService.deleteStatus(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: statusKeys.lists() });

      const previousData = queryClient.getQueriesData({
        queryKey: statusKeys.lists(),
      });

      queryClient.setQueriesData(
        { queryKey: statusKeys.lists() },
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page: StatusesResponse) => {
              page.groupedStatuses.forEach((collection) => {
                collection.statuses = collection.statuses.filter(
                  (status: Status) => status.id !== id,
                );
              });

              page.groupedStatuses = page.groupedStatuses.filter(
                (collection) => collection.statuses.length > 0,
              );

              return {
                ...page,
                total: Math.max(0, page.total - 1),
              };
            }),
          };
        },
      );

      return { previousData };
    },
    onError: (_, __, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: statusKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: statusKeys.lists() });
    },
  });
}

export function useReactToStatus() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StatusReactionRequest }) =>
      apiService.reactToStatus(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: statusKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: statusKeys.lists() });

      const updateStatus = (status: Status) => ({
        ...status,
        isReacted: true,
        reactionsCount: status.reactionsCount + 1,
        reactions: [
          ...(status.reactions || []),
          {
            id: `temp-reaction-${Date.now()}`,
            userId: useAuthStore.getState().user?.id || "",
            statusId: id,
            reactionType: data.reactionType,
            createdAt: new Date().toISOString(),
          },
        ],
      });

      queryClient.setQueryData(
        statusKeys.detail(id),
        (old: Status | undefined) => {
          if (!old) return old;
          return updateStatus(old);
        },
      );

      queryClient.setQueriesData(
        { queryKey: statusKeys.lists() },
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page: StatusesResponse) => ({
              ...page,
              groupedStatuses: page.groupedStatuses.map((collection) => ({
                ...collection,
                statuses: collection.statuses.map((status: Status) =>
                  status.id === id ? updateStatus(status) : status,
                ),
              })),
            })),
          };
        },
      );
    },
    onError: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: statusKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: statusKeys.lists() });
    },
  });
}

export function useRemoveStatusReaction() {
  return useMutation({
    mutationFn: (id: string) => apiService.removeStatusReaction(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: statusKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: statusKeys.lists() });

      const updateStatus = (status: Status) => ({
        ...status,
        isReacted: false,
        reactionsCount: Math.max(0, status.reactionsCount - 1),
        reactions: (status.reactions || []).filter(
          (reaction) => reaction.userId !== useAuthStore.getState().user?.id,
        ),
      });

      queryClient.setQueryData(
        statusKeys.detail(id),
        (old: Status | undefined) => {
          if (!old) return old;
          return updateStatus(old);
        },
      );

      queryClient.setQueriesData(
        { queryKey: statusKeys.lists() },
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page: StatusesResponse) => ({
              ...page,
              groupedStatuses: page.groupedStatuses.map((collection) => ({
                ...collection,
                statuses: collection.statuses.map((status: Status) =>
                  status.id === id ? updateStatus(status) : status,
                ),
              })),
            })),
          };
        },
      );
    },
    onError: (_, id) => {
      queryClient.invalidateQueries({ queryKey: statusKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: statusKeys.lists() });
    },
  });
}

export function useReplyToStatus() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StatusReplyRequest }) =>
      apiService.replyToStatus(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: statusKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: statusKeys.replies(id) });

      const optimisticReply: StatusReply = {
        id: `temp-reply-${Date.now()}`,
        author: useAuthStore.getState().user!,
        statusId: id,
        content: data.content,
        media: data.media?.map((m, index) => ({
          id: `temp-reply-media-${index}`,
          url: m.url,
          thumbnailUrl: m.thumbnailUrl,
          mediaType: m.mediaType,
          fileName: m.fileName,
          fileSize: m.fileSize,
          mimeType: m.mimeType,
          duration: m.duration,
          width: m.width,
          height: m.height,
          order: m.order,
          status: `temp-reply-${Date.now()}`,
          createdAt: new Date().toISOString(),
        })),
        location: data.location,
        reactionsCount: 0,
        isReacted: false,
        reactions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData(
        statusKeys.detail(id),
        (old: Status | undefined) => {
          if (!old) return old;
          return {
            ...old,
            repliesCount: old.repliesCount + 1,
            isReplied: true,
            replies: [optimisticReply, ...(old.replies || [])],
          };
        },
      );

      queryClient.setQueriesData(
        { queryKey: statusKeys.replies(id) },
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map(
              (page: StatusRepliesResponse, index: number) => {
                if (index === 0) {
                  return {
                    ...page,
                    replies: [optimisticReply, ...page.replies],
                    total: page.total + 1,
                  };
                }
                return page;
              },
            ),
          };
        },
      );

      return { optimisticReply };
    },
    onError: (_, { id }, context) => {
      if (context?.optimisticReply) {
        queryClient.setQueryData(
          statusKeys.detail(id),
          (old: Status | undefined) => {
            if (!old) return old;
            return {
              ...old,
              repliesCount: Math.max(0, old.repliesCount - 1),
              isReplied: (old.replies || []).some(
                (reply) => reply.author.id === useAuthStore.getState().user?.id,
              ),
              replies: (old.replies || []).filter(
                (reply) => reply.id !== context.optimisticReply.id,
              ),
            };
          },
        );

        queryClient.setQueriesData(
          { queryKey: statusKeys.replies(id) },
          (old: any) => {
            if (!old) return old;

            return {
              ...old,
              pages: old.pages.map(
                (page: StatusRepliesResponse, index: number) => {
                  if (index === 0) {
                    return {
                      ...page,
                      replies: page.replies.filter(
                        (reply: StatusReply) =>
                          reply.id !== context.optimisticReply.id,
                      ),
                      total: Math.max(0, page.total - 1),
                    };
                  }
                  return page;
                },
              ),
            };
          },
        );
      }
    },
    onSuccess: (newReply, { id }, context) => {
      if (context?.optimisticReply) {
        queryClient.setQueryData(
          statusKeys.detail(id),
          (old: Status | undefined) => {
            if (!old) return old;
            return {
              ...old,
              replies: (old.replies || []).map((reply) =>
                reply.id === context.optimisticReply.id ? newReply : reply,
              ),
            };
          },
        );

        queryClient.setQueriesData(
          { queryKey: statusKeys.replies(id) },
          (old: any) => {
            if (!old) return old;

            return {
              ...old,
              pages: old.pages.map(
                (page: StatusRepliesResponse, index: number) => {
                  if (index === 0) {
                    return {
                      ...page,
                      replies: page.replies.map((reply: StatusReply) =>
                        reply.id === context.optimisticReply.id
                          ? newReply
                          : reply,
                      ),
                    };
                  }
                  return page;
                },
              ),
            };
          },
        );
      }

      queryClient.invalidateQueries({ queryKey: statusKeys.replies(id) });
    },
  });
}
