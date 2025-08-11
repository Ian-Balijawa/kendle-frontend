import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Box, Center, Loader, Text, Stack } from '@mantine/core'
import { useAuthStore } from '../../stores/authStore'

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore()
  const location = useLocation()

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Box
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, var(--mantine-color-primary-0) 0%, var(--mantine-color-secondary-0) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Center>
          <Stack gap="md" align="center">
            <Loader 
              size="lg" 
              color="var(--mantine-color-primary-6)"
              type="dots"
            />
            <Text 
              size="lg" 
              c="dimmed"
              style={{ fontWeight: 500 }}
            >
              Authenticating...
            </Text>
            <Text 
              size="sm" 
              c="dimmed"
              style={{ textAlign: 'center' }}
            >
              Please wait while we verify your credentials
            </Text>
          </Stack>
        </Center>
      </Box>
    )
  }

  // Redirect to phone auth if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  // If user is authenticated but profile is incomplete, redirect to profile completion
  if (user && !user.isProfileComplete) {
    return <Navigate to="/complete-profile" replace />
  }

  return <>{children}</>
}
