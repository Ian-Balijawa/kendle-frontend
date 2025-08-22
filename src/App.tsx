import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { useAuthStore } from "./stores/authStore";
import { theme } from "./theme";

import { AppShell } from "./components/layout/AppShell";

import { AuthGuard } from "./features/auth/AuthGuard";
import { OTPVerification } from "./features/auth/OTPVerification";
import { PhoneAuth } from "./features/auth/PhoneAuth";
import { ProfileCompletion } from "./features/auth/ProfileCompletion";

import { NotificationsPage } from "./features/notifications/NotificationsPage";
import { HomePage } from "./features/posts/HomePage";
import { PostDetail } from "./features/posts/PostDetail";
import { ProfilePage } from "./features/profile/ProfilePage";
import { ExplorePage } from "./features/search/ExplorePage";
import { StatusesPage } from "./features/statuses/StatusesPage";
import { ChatPage } from "./features/chat/ChatPage";

import "./styles/globals.css";

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <Notifications position="top-right" />
        <Router>
          <Routes>
            {/* Public routes - Phone Authentication Flow */}
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  user?.isProfileComplete ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Navigate to="/complete-profile" replace />
                  )
                ) : (
                  <PhoneAuth />
                )
              }
            />
            <Route
              path="/verify-otp"
              element={
                !isAuthenticated ? (
                  !user?.isProfileComplete ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Navigate to="/complete-profile" replace />
                  )
                ) : (
                  <OTPVerification />
                )
              }
            />
            <Route
              path="/complete-profile"
              element={
                isAuthenticated ? (
                  user?.isProfileComplete ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <ProfileCompletion />
                  )
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            {/* Public Dashboard - Accessible to all users */}
            <Route path="/dashboard" element={<AppShell />}>
              <Route index element={<HomePage />} />
              <Route path="explore" element={<ExplorePage />} />
              <Route path="statuses" element={<StatusesPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="post/:postId" element={<PostDetail />} />
            </Route>

            {/* Protected routes - Require authentication */}
            <Route
              path="/protected"
              element={
                <AuthGuard>
                  <AppShell />
                </AuthGuard>
              }
            >
              <Route
                path="create-post"
                element={<div>Create Post (Protected)</div>}
              />
              <Route
                path="edit-profile"
                element={<div>Edit Profile (Protected)</div>}
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </MantineProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
