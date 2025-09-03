import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import {
  apiService,
  UpdateProfileRequest,
  UserProfileCompleteRequest,
} from "../services/api";
import { useAuthStore } from "../stores/authStore";
import { User } from "../types";

// Query keys
export const userKeys = {
  all: ["users"] as const,
  profile: () => [...userKeys.all, "profile"] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  username: (username: string) =>
    [...userKeys.all, "username", username] as const,
};

// Get current user profile
export function useUserProfile() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => apiService.getCurrentUserProfile(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// Get user by ID
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => apiService.getUser(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get user by username
export function useUserByUsername(username: string) {
  return useQuery({
    queryKey: userKeys.username(username),
    queryFn: () => apiService.getUserByUsername(username),
    enabled: !!username,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Update user profile mutation
export function useUpdateProfile() {
  const { user, updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) =>
      apiService.updateUserProfile(data),
    onMutate: async (updateData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.profile() });

      // Snapshot the previous value
      const previousUser = queryClient.getQueryData(userKeys.profile());

      // Optimistically update the user profile
      if (user) {
        const updatedUser: User = {
          ...user,
          ...updateData,
          bio: updateData.bio || undefined,
          updatedAt: new Date().toISOString(),
        };

        queryClient.setQueryData(userKeys.profile(), updatedUser);
        updateUser(updatedUser);

        // Also update in user detail cache if it exists
        queryClient.setQueryData(userKeys.detail(user.id), updatedUser);

        // Update in username cache if username is being updated
        if (updateData.username) {
          queryClient.setQueryData(
            userKeys.username(updateData.username),
            updatedUser
          );
        }
      }

      return { previousUser };
    },
    onError: (_error: any, _variables, context) => {
      // Revert the optimistic update
      if (context?.previousUser) {
        queryClient.setQueryData(userKeys.profile(), context.previousUser);
        updateUser(context.previousUser as User);
      }
    },
    onSuccess: (updatedUser) => {
      // Update with the server response
      queryClient.setQueryData(userKeys.profile(), updatedUser);
      updateUser(updatedUser);

      // Update related caches
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);
      if (updatedUser.username) {
        queryClient.setQueryData(
          userKeys.username(updatedUser.username),
          updatedUser
        );
      }

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

// Complete user profile mutation
export function useCompleteUserProfile() {
  const { user, updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: UserProfileCompleteRequest) =>
      apiService.completeUserProfile(data),
    onMutate: async (profileData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.profile() });

      // Snapshot the previous value
      const previousUser = queryClient.getQueryData(userKeys.profile());

      // Optimistically update the user profile
      if (user) {
        const updatedUser: User = {
          ...user,
          ...profileData,
          email: profileData.email ?? undefined,
          whatsapp: profileData.whatsapp ?? undefined,
          twitterLink: profileData.twitterLink ?? undefined,
          tiktokLink: profileData.tiktokLink ?? undefined,
          instagramLink: profileData.instagramLink ?? undefined,
          bio: profileData.bio ?? undefined,
          isProfileComplete: true,
          updatedAt: new Date().toISOString(),
        };

        queryClient.setQueryData(userKeys.profile(), updatedUser);
        updateUser(updatedUser);

        // Also update in user detail cache
        queryClient.setQueryData(userKeys.detail(user.id), updatedUser);
      }

      return { previousUser };
    },
    onError: (_error: any, _variables, context) => {
      // Revert the optimistic update
      if (context?.previousUser) {
        queryClient.setQueryData(userKeys.profile(), context.previousUser);
        updateUser(context.previousUser as User);
      }
    },
    onSuccess: (updatedUser) => {
      // Update with the server response
      queryClient.setQueryData(userKeys.profile(), updatedUser);
      updateUser(updatedUser);

      // Update related caches
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);
      if (updatedUser.username) {
        queryClient.setQueryData(
          userKeys.username(updatedUser.username),
          updatedUser
        );
      }

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
