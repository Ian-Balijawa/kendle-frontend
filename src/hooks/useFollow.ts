import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../services/api";
import { useAuthStore } from "../stores/authStore";
import { User } from "../types/auth";

// Query keys
export const followKeys = {
  all: ["follow"] as const,
  status: () => [...followKeys.all, "status"] as const,
  statusForUser: (userId: string) => [...followKeys.status(), userId] as const,
  followers: () => [...followKeys.all, "followers"] as const,
  followersForUser: (userId: string) =>
    [...followKeys.followers(), userId] as const,
  following: () => [...followKeys.all, "following"] as const,
  followingForUser: (userId: string) =>
    [...followKeys.following(), userId] as const,
  suggestions: () => [...followKeys.all, "suggestions"] as const,
};

// Get follow status for a specific user
export function useFollowStatus(targetUserId: string) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: followKeys.statusForUser(targetUserId),
    queryFn: () => apiService.getFollowStatus(targetUserId),
    enabled: !!targetUserId && !!user && user.id !== targetUserId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Get followers for a user
export function useFollowers(userId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: [...followKeys.followersForUser(userId), page, limit],
    queryFn: () => apiService.getUserFollowers(userId, page, limit),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
  });
}

// Get following for a user
export function useFollowing(userId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: [...followKeys.followingForUser(userId), page, limit],
    queryFn: () => apiService.getUserFollowing(userId, page, limit),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
  });
}

// Get suggested users
export function useSuggestedUsers(limit = 10) {
  return useQuery({
    queryKey: [...followKeys.suggestions(), limit],
    queryFn: () => apiService.getSuggestedUsers(limit),
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => ({
      suggestions: data.suggestions || [],
      count: data.count || 0,
    }),
  });
}

// Get suggested users as a simple array (for easier usage in components)
export function useSuggestedUsersList(limit = 10) {
  return useQuery({
    queryKey: [...followKeys.suggestions(), limit],
    queryFn: () => apiService.getSuggestedUsers(limit),
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => data.suggestions || [],
  });
}

// Follow user mutation
export function useFollowUser() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (targetUserId: string) => apiService.followUser(targetUserId),
    onMutate: async (targetUserId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: followKeys.statusForUser(targetUserId),
      });

      // Snapshot the previous value
      const previousStatus = queryClient.getQueryData(
        followKeys.statusForUser(targetUserId)
      );

      // Optimistically update the follow status
      queryClient.setQueryData(followKeys.statusForUser(targetUserId), {
        isFollowing: true,
        followRelationship: {
          id: `temp-${Date.now()}`,
          followerId: user?.id,
          followingId: targetUserId,
          createdAt: new Date().toISOString(),
        },
      });

      // Update user profile cache if it exists
      const userProfile = queryClient.getQueryData([
        "users",
        "profile",
      ]) as unknown as User;
      if (userProfile && userProfile.followingCount) {
        queryClient.setQueryData(["users", "profile"], {
          ...userProfile,
          followingCount: (userProfile.followingCount || 0) + 1,
        });
      }

      return { previousStatus };
    },
    onError: (_error, targetUserId, context) => {
      // Revert the optimistic update
      if (context?.previousStatus) {
        queryClient.setQueryData(
          followKeys.statusForUser(targetUserId),
          context.previousStatus
        );
      }

      // Revert user profile count
      const userProfile = queryClient.getQueryData([
        "users",
        "profile",
      ]) as unknown as User;
      if (userProfile && userProfile.followingCount) {
        queryClient.setQueryData(["users", "profile"], {
          ...userProfile,
          followingCount: Math.max(0, (userProfile.followingCount || 0) - 1),
        });
      }
    },
    onSuccess: (_data, targetUserId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: followKeys.statusForUser(targetUserId),
      });
      queryClient.invalidateQueries({
        queryKey: followKeys.followingForUser(user?.id || ""),
      });
      queryClient.invalidateQueries({
        queryKey: followKeys.followersForUser(targetUserId),
      });
      queryClient.invalidateQueries({ queryKey: ["users", "profile"] });
      queryClient.invalidateQueries({ queryKey: followKeys.suggestions() });
    },
  });
}

// Unfollow user mutation
export function useUnfollowUser() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (targetUserId: string) => apiService.unfollowUser(targetUserId),
    onMutate: async (targetUserId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: followKeys.statusForUser(targetUserId),
      });

      // Snapshot the previous value
      const previousStatus = queryClient.getQueryData(
        followKeys.statusForUser(targetUserId)
      );

      // Optimistically update the follow status
      queryClient.setQueryData(followKeys.statusForUser(targetUserId), {
        isFollowing: false,
        followRelationship: undefined,
      });

      // Update user profile cache if it exists
      const userProfile = queryClient.getQueryData([
        "users",
        "profile",
      ]) as unknown as User;
      if (userProfile && userProfile.followingCount) {
        queryClient.setQueryData(["users", "profile"], {
          ...userProfile,
          followingCount: Math.max(0, (userProfile.followingCount || 0) - 1),
        });
      }

      return { previousStatus };
    },
    onError: (_error, targetUserId, context) => {
      // Revert the optimistic update
      if (context?.previousStatus) {
        queryClient.setQueryData(
          followKeys.statusForUser(targetUserId),
          context.previousStatus
        );
      }

      // Revert user profile count
      const userProfile = queryClient.getQueryData([
        "users",
        "profile",
      ]) as unknown as User;
      if (userProfile && userProfile.followingCount) {
        queryClient.setQueryData(["users", "profile"], {
          ...userProfile,
          followingCount: (userProfile.followingCount || 0) + 1,
        });
      }
    },
    onSuccess: (_data, targetUserId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: followKeys.statusForUser(targetUserId),
      });
      queryClient.invalidateQueries({
        queryKey: followKeys.followingForUser(user?.id || ""),
      });
      queryClient.invalidateQueries({
        queryKey: followKeys.followersForUser(targetUserId),
      });
      queryClient.invalidateQueries({ queryKey: ["users", "profile"] });
      queryClient.invalidateQueries({ queryKey: followKeys.suggestions() });
    },
  });
}

// Toggle follow/unfollow
export function useToggleFollow() {
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const toggleFollow = async (
    targetUserId: string,
    currentFollowStatus?: boolean
  ) => {
    if (currentFollowStatus) {
      await unfollowMutation.mutateAsync(targetUserId);
    } else {
      await followMutation.mutateAsync(targetUserId);
    }
  };

  return {
    toggleFollow,
    isLoading: followMutation.isPending || unfollowMutation.isPending,
    error: followMutation.error || unfollowMutation.error,
  };
}
