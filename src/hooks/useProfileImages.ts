import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { apiService } from "../services/api";
import { useAuthStore } from "../stores/authStore";
import { authKeys } from "./useAuth";
import { userKeys } from "./useUser";

// Upload avatar mutation
export function useUploadAvatar() {
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (file: File) => apiService.uploadAvatar(file),
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: authKeys.me() });
      await queryClient.cancelQueries({ queryKey: userKeys.profile() });

      // Snapshot the previous value
      const previousUser = queryClient.getQueryData(authKeys.me());

      return { previousUser };
    },
    onSuccess: (updatedUser) => {
      // Update auth store
      updateUser(updatedUser);

      // Update all user-related caches
      queryClient.setQueryData(authKeys.me(), updatedUser);
      queryClient.setQueryData(userKeys.profile(), updatedUser);
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);

      if (updatedUser.username) {
        queryClient.setQueryData(
          userKeys.username(updatedUser.username),
          updatedUser,
        );
      }

      // Invalidate related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (_error: any, _variables, context) => {
      // Revert the optimistic update
      if (context?.previousUser) {
        queryClient.setQueryData(authKeys.me(), context.previousUser);
        updateUser(context.previousUser as any);
      }
    },
  });
}

// Delete avatar mutation
export function useDeleteAvatar() {
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: () => apiService.deleteAvatar(),
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: authKeys.me() });
      await queryClient.cancelQueries({ queryKey: userKeys.profile() });

      // Snapshot the previous value
      const previousUser = queryClient.getQueryData(authKeys.me());

      return { previousUser };
    },
    onSuccess: (updatedUser) => {
      // Update auth store
      updateUser(updatedUser);

      // Update all user-related caches
      queryClient.setQueryData(authKeys.me(), updatedUser);
      queryClient.setQueryData(userKeys.profile(), updatedUser);
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);

      if (updatedUser.username) {
        queryClient.setQueryData(
          userKeys.username(updatedUser.username),
          updatedUser,
        );
      }

      // Invalidate related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (_error: any, _variables, context) => {
      // Revert the optimistic update
      if (context?.previousUser) {
        queryClient.setQueryData(authKeys.me(), context.previousUser);
        updateUser(context.previousUser as any);
      }
    },
  });
}

// Upload background image mutation
export function useUploadBackgroundImage() {
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (file: File) => apiService.uploadBackgroundImage(file),
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: authKeys.me() });
      await queryClient.cancelQueries({ queryKey: userKeys.profile() });

      // Snapshot the previous value
      const previousUser = queryClient.getQueryData(authKeys.me());

      return { previousUser };
    },
    onSuccess: (updatedUser) => {
      // Update auth store
      updateUser(updatedUser);

      // Update all user-related caches
      queryClient.setQueryData(authKeys.me(), updatedUser);
      queryClient.setQueryData(userKeys.profile(), updatedUser);
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);

      if (updatedUser.username) {
        queryClient.setQueryData(
          userKeys.username(updatedUser.username),
          updatedUser,
        );
      }

      // Invalidate related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (_error: any, _variables, context) => {
      // Revert the optimistic update
      if (context?.previousUser) {
        queryClient.setQueryData(authKeys.me(), context.previousUser);
        updateUser(context.previousUser as any);
      }
    },
  });
}

// Delete background image mutation
export function useDeleteBackgroundImage() {
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: () => apiService.deleteBackgroundImage(),
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: authKeys.me() });
      await queryClient.cancelQueries({ queryKey: userKeys.profile() });

      // Snapshot the previous value
      const previousUser = queryClient.getQueryData(authKeys.me());

      return { previousUser };
    },
    onSuccess: (updatedUser) => {
      // Update auth store
      updateUser(updatedUser);

      // Update all user-related caches
      queryClient.setQueryData(authKeys.me(), updatedUser);
      queryClient.setQueryData(userKeys.profile(), updatedUser);
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);

      if (updatedUser.username) {
        queryClient.setQueryData(
          userKeys.username(updatedUser.username),
          updatedUser,
        );
      }

      // Invalidate related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (_error: any, _variables, context) => {
      // Revert the optimistic update
      if (context?.previousUser) {
        queryClient.setQueryData(authKeys.me(), context.previousUser);
        updateUser(context.previousUser as any);
      }
    },
  });
}
