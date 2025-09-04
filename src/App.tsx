import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
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

import "./styles/globals.css";

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <Notifications position="top-right" />
        <Router>
          <Routes>
            {/* Public routes */}
            <Route
              path="/auth"
              element={
                isAuthenticated ? (
                  user?.isProfileComplete ? (
                    <Navigate to="/" replace />
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
                isAuthenticated ? (
                  user?.isProfileComplete ? (
                    <Navigate to="/" replace />
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
                    <Navigate to="/" replace />
                  ) : (
                    <ProfileCompletion />
                  )
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  user?.isProfileComplete ? (
                    <AuthGuard>
                      <AppShell />
                    </AuthGuard>
                  ) : (
                    <Navigate to="/complete-profile" replace />
                  )
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            >
              <Route index element={<HomePage />} />
              <Route path="explore" element={<ExplorePage />} />
              <Route path="statuses" element={<StatusesPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="profile/:userId" element={<ProfilePage />} />
              <Route path="post/:postId" element={<PostDetail />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;
