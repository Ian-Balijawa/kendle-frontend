import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import {
  apiService,
  UpdateProfileRequest,
  UserProfileCompleteRequest,
} from "../services/api";
import { useAuthStore } from "../stores/authStore";
import { User } from "../types";

export const userKeys = {
  all: ["users"] as const,
  profile: () => [...userKeys.all, "profile"] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  username: (username: string) =>
    [...userKeys.all, "username", username] as const,
};

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

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => apiService.getUser(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUserByUsername(username: string) {
  return useQuery({
    queryKey: userKeys.username(username),
    queryFn: () => apiService.getUserByUsername(username),
    enabled: !!username,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUpdateProfile() {
  const { user, updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) =>
      apiService.updateUserProfile(data),
    onMutate: async (updateData) => {
      await queryClient.cancelQueries({ queryKey: userKeys.profile() });

      const previousUser = queryClient.getQueryData(userKeys.profile());

      if (user) {
        const updatedUser: User = {
          ...user,
          ...updateData,
          bio: updateData.bio || undefined,
          updatedAt: new Date().toISOString(),
        };

        queryClient.setQueryData(userKeys.profile(), updatedUser);
        updateUser(updatedUser);

        queryClient.setQueryData(userKeys.detail(user.id), updatedUser);

        if (updateData.username) {
          queryClient.setQueryData(
            userKeys.username(updateData.username),
            updatedUser,
          );
        }
      }

      return { previousUser };
    },
    onError: (_error: any, _variables, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(userKeys.profile(), context.previousUser);
        updateUser(context.previousUser as User);
      }
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(userKeys.profile(), updatedUser);
      updateUser(updatedUser);

      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);
      if (updatedUser.username) {
        queryClient.setQueryData(
          userKeys.username(updatedUser.username),
          updatedUser,
        );
      }

      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useCompleteUserProfile() {
  const { user, updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: UserProfileCompleteRequest) =>
      apiService.completeUserProfile(data),
    onMutate: async (profileData) => {
      await queryClient.cancelQueries({ queryKey: userKeys.profile() });

      const previousUser = queryClient.getQueryData(userKeys.profile());

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

        queryClient.setQueryData(userKeys.detail(user.id), updatedUser);
      }

      return { previousUser };
    },
    onError: (_error: any, _variables, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(userKeys.profile(), context.previousUser);
        updateUser(context.previousUser as User);
      }
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(userKeys.profile(), updatedUser);
      updateUser(updatedUser);

      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);
      if (updatedUser.username) {
        queryClient.setQueryData(
          userKeys.username(updatedUser.username),
          updatedUser,
        );
      }

      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
