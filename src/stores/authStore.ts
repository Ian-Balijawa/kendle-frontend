import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import { User } from "../types";

interface AuthStore {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  otpSent: boolean;
  phoneNumber: string | null;

  // Actions
  logout: () => void;
  updateProfile: (data: Partial<AuthStore>) => void;
  updateUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setOTPSent: (sent: boolean) => void;
  setPhoneNumber: (phone: string) => void;
  setAuthData: (user: User, accessToken: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      subscribeWithSelector(
        (set, _get) => ({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          otpSent: false,
          phoneNumber: null,

          logout: () => {
            set(
              {
                user: null,
                token: null,
                refreshToken: null,
                isAuthenticated: false,
                error: null,
                otpSent: false,
                phoneNumber: null,
              },
              false,
              "auth/logout"
            );
          },

          updateProfile: (data: Partial<AuthStore>) => {
            set(
              (state) => ({
                ...state,
                ...data,
              }),
              false,
              "auth/updateProfile"
            );
          },

          updateUser: (user: User) => {
            set({ user }, false, "auth/updateUser");
          },

          setLoading: (loading: boolean) => {
            set({ isLoading: loading }, false, "auth/setLoading");
          },

          setError: (error: string | null) => {
            set({ error }, false, "auth/setError");
          },

          clearError: () => {
            set({ error: null }, false, "auth/clearError");
          },

          setOTPSent: (sent: boolean) => {
            set({ otpSent: sent }, false, "auth/setOTPSent");
          },

          setPhoneNumber: (phone: string) => {
            set({ phoneNumber: phone }, false, "auth/setPhoneNumber");
          },

          setAuthData: (user: User, accessToken: string) => {
            set(
              {
                user,
                token: accessToken,
                isAuthenticated: true,
                otpSent: false,
                error: null,
              },
              false,
              "auth/setAuthData"
            );
          },
        })
      ),
      {
        name: "auth-storage",
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: "Auth Store",
      enabled: true,
    }
  )
);
