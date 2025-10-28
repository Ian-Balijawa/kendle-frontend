
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

import { AppShell } from "./components/layout/AppShell";

import { AuthGuard } from "./features/auth/AuthGuard";
import { OTPVerification } from "./features/auth/OTPVerification";
import { PhoneAuth } from "./features/auth/PhoneAuth";
import { ProfileCompletion } from "./features/auth/ProfileCompletion";
import { HomePage } from "./features/posts/HomePage";
import { PostDetail } from "./features/posts/PostDetail";
import { ProfilePage } from "./features/profile/ProfilePage";
import { ExplorePage } from "./features/search/ExplorePage";
import { SettingsPage } from "./features/settings";
import { InboxPage } from "./features/inbox";

import "./styles/globals.css";
import { createTheme, MantineColorsTuple, MantineProvider } from "@mantine/core";

function AppContent() {
  const { isAuthenticated, user } = useAuthStore();


  return (
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
          <Route path="inbox" element={<InboxPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/:userId" element={<ProfilePage />} />
          <Route path="post/:postId" element={<PostDetail />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {

  const colors: MantineColorsTuple = [
    '#ecefff',
    '#d5dafb',
    '#a9b1f1',
    '#7a87e9',
    '#5362e1',
    '#3a4bdd',
    '#2c40dc',
    '#1f32c4',
    '#182cb0',
    '#0a259c'
  ];

  const theme = createTheme({
    colors: {
      colors,
    }
  });
  return (
    <MantineProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <Notifications position="top-right" />
        <AppContent />
      </QueryClientProvider>
    </MantineProvider>
  )
}

export default App;
