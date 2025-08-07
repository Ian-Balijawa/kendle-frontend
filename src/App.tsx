import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Notifications } from '@mantine/notifications'
import { theme } from './theme'
import { queryClient } from './lib/queryClient'
import { useAuthStore } from './stores/authStore'

// Layout components
import { AppShell } from './components/layout/AppShell'

// Auth components
import { LoginForm } from './features/auth/LoginForm'
import { RegisterForm } from './features/auth/RegisterForm'
import { ForgotPassword } from './features/auth/ForgotPassword'
import { AuthGuard } from './features/auth/AuthGuard'

// Feature components
import { HomePage } from './features/posts/HomePage'
import { ExplorePage } from './features/search/ExplorePage'
import { ProfilePage } from './features/profile/ProfilePage'
import { ChatPage } from './features/chat/ChatPage'
import { NotificationsPage } from './features/notifications/NotificationsPage'

// Global styles
import './styles/globals.css'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <Notifications position="top-right" />
        <Router>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                isAuthenticated ? <Navigate to="/" replace /> : <LoginForm />
              }
            />
            <Route
              path="/register"
              element={
                isAuthenticated ? <Navigate to="/" replace /> : <RegisterForm />
              }
            />
            <Route
              path="/forgot-password"
              element={
                isAuthenticated ? <Navigate to="/" replace /> : <ForgotPassword />
              }
            />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <AuthGuard>
                  <AppShell />
                </AuthGuard>
              }
            >
              <Route index element={<HomePage />} />
              <Route path="explore" element={<ExplorePage />} />
              <Route path="profile/:userId?" element={<ProfilePage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </MantineProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
