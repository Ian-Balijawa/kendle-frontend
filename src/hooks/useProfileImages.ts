import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { queryClient } from "../lib/queryClient";
import { apiService } from "../services/api";
import { useAuthStore } from "../stores/authStore";
import { authKeys } from "./useAuth";
import { userKeys } from "./useUser";

// Upload avatar mutation
export function useUploadAvatar() {
    const { user, updateUser } = useAuthStore();

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

            notifications.show({
                title: "Success",
                message: "Profile picture updated successfully",
                color: "green",
            });
        },
        onError: (error: any, _variables, context) => {
            // Revert the optimistic update
            if (context?.previousUser) {
                queryClient.setQueryData(authKeys.me(), context.previousUser);
                updateUser(context.previousUser as any);
            }

            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to upload profile picture";

            notifications.show({
                title: "Error",
                message: errorMessage,
                color: "red",
            });
        },
    });
}

// Delete avatar mutation
export function useDeleteAvatar() {
    const { user, updateUser } = useAuthStore();

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

            notifications.show({
                title: "Success",
                message: "Profile picture removed successfully",
                color: "green",
            });
        },
        onError: (error: any, _variables, context) => {
            // Revert the optimistic update
            if (context?.previousUser) {
                queryClient.setQueryData(authKeys.me(), context.previousUser);
                updateUser(context.previousUser as any);
            }

            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to remove profile picture";

            notifications.show({
                title: "Error",
                message: errorMessage,
                color: "red",
            });
        },
    });
}

// Upload background image mutation
export function useUploadBackgroundImage() {
    const { user, updateUser } = useAuthStore();

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

            notifications.show({
                title: "Success",
                message: "Background image updated successfully",
                color: "green",
            });
        },
        onError: (error: any, _variables, context) => {
            // Revert the optimistic update
            if (context?.previousUser) {
                queryClient.setQueryData(authKeys.me(), context.previousUser);
                updateUser(context.previousUser as any);
            }

            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to upload background image";

            notifications.show({
                title: "Error",
                message: errorMessage,
                color: "red",
            });
        },
    });
}

// Delete background image mutation
export function useDeleteBackgroundImage() {
    const { user, updateUser } = useAuthStore();

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

            notifications.show({
                title: "Success",
                message: "Background image removed successfully",
                color: "green",
            });
        },
        onError: (error: any, _variables, context) => {
            // Revert the optimistic update
            if (context?.previousUser) {
                queryClient.setQueryData(authKeys.me(), context.previousUser);
                updateUser(context.previousUser as any);
            }

            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to remove background image";

            notifications.show({
                title: "Error",
                message: errorMessage,
                color: "red",
            });
        },
    });
}
