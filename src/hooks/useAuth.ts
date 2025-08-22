import { useMutation, useQuery } from "@tanstack/react-query";
import {
  apiService,
  SendOTPRequest,
  VerifyOTPRequest,
  ResendOTPRequest,
  LoginRequest,
  CompleteProfileRequest,
} from "../services/api";
import { AuthResponse, User } from "../types";
import { useAuthStore } from "../stores/authStore";
import { queryClient } from "../lib/queryClient";

// Query keys
export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
  user: () => [...authKeys.all, "user"] as const,
};

// Get current authenticated user
export function useCurrentUser() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => apiService.getCurrentUser(),
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}

// Send OTP mutation
export function useSendOTP() {
  const { setOTPSent, setPhoneNumber, setLoading, setError } = useAuthStore();

  return useMutation({
    mutationFn: (data: SendOTPRequest) => apiService.sendOTP(data),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (_response, variables) => {
      setOTPSent(true);
      setPhoneNumber(variables.phoneNumber);
      setLoading(false);
    },
    onError: (error: any, _variables) => {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to send OTP";
      setError(errorMessage);
      setLoading(false);
    },
  });
}

// Verify OTP mutation
export function useVerifyOTP() {
  const { setLoading, setError, updateProfile } = useAuthStore();

  return useMutation({
    mutationFn: (data: VerifyOTPRequest) => apiService.verifyOTP(data),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (response: AuthResponse) => {
      // Update auth store with user data and tokens
      updateProfile({
        user: response.user,
        token: response.token,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
      });

      // Cache the user data
      queryClient.setQueryData(authKeys.me(), response.user);

      setLoading(false);
      return response;
    },
    onError: (error: any, _variables) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "OTP verification failed";
      setError(errorMessage);
      setLoading(false);
    },
  });
}

// Resend OTP mutation
export function useResendOTP() {
  const { setLoading, setError } = useAuthStore();

  return useMutation({
    mutationFn: (data: ResendOTPRequest) => apiService.resendOTP(data),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: () => {
      setLoading(false);
    },
    onError: (error: any, _variables) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to resend OTP";
      setError(errorMessage);
      setLoading(false);
    },
  });
}

// Login mutation
export function useLogin() {
  const { setLoading, setError, updateProfile } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginRequest) => apiService.login(data),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (response: AuthResponse) => {
      // Update auth store with user data and tokens
      updateProfile({
        user: response.user,
        token: response.token,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
      });

      // Cache the user data
      queryClient.setQueryData(authKeys.me(), response.user);

      setLoading(false);
      return response;
    },
    onError: (error: any, _variables) => {
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      setError(errorMessage);
      setLoading(false);
    },
  });
}

// Complete profile mutation
export function useCompleteProfile() {
  const { user, setLoading, setError, updateProfile } = useAuthStore();

  return useMutation({
    mutationFn: (data: CompleteProfileRequest) =>
      apiService.completeProfile(data),
    onMutate: async (profileData) => {
      setLoading(true);
      setError(null);

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: authKeys.me() });

      // Snapshot the previous value
      const previousUser = queryClient.getQueryData(authKeys.me());

      // Optimistically update the user profile
      if (user) {
        const updatedUser: User = {
          ...user,
          ...profileData,
          isProfileComplete: true,
          updatedAt: new Date().toISOString(),
        };

        queryClient.setQueryData(authKeys.me(), updatedUser);
        updateProfile({ user: updatedUser });
      }

      return { previousUser };
    },
    onError: (_error: any, _variables, context) => {
      // Revert the optimistic update
      if (context?.previousUser) {
        queryClient.setQueryData(authKeys.me(), context.previousUser);
        updateProfile({ user: context.previousUser as User });
      }

      const errorMessage =
        _error.response?.data?.message ||
        _error.message ||
        "Profile completion failed";
      setError(errorMessage);
      setLoading(false);
    },
    onSuccess: (updatedUser) => {
      // Update with the server response
      queryClient.setQueryData(authKeys.me(), updatedUser);
      updateProfile({ user: updatedUser });
      setLoading(false);
    },
  });
}

// Logout mutation
export function useLogout() {
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      // Here you could call a logout endpoint if needed
      // await apiService.logout();
      return Promise.resolve();
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();

      // Update auth store
      logout();
    },
  });
}
