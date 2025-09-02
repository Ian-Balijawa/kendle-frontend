import { Box, Center, Image, Stack } from "@mantine/core";
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useAuth";
import { useAuthStore } from "../../stores/authStore";

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { isLoading: userLoading } = useCurrentUser();
  const location = useLocation();
  
  const loading = isLoading || userLoading;
  
  if (loading) {
    return (
      <Box h="100vh" w="100vw" pos="relative">
        <Center h="100%">
          <Stack align="center" gap="md">
            <Image
              src="/logo.png"
              alt="Loading"
              w={120}
              h={120}
            />
          </Stack>
        </Center>
      </Box>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
}
