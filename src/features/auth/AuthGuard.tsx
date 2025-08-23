import { Box, Center, Loader, Stack, Text } from "@mantine/core";
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
      <Box
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, var(--mantine-color-primary-0) 0%, var(--mantine-color-secondary-0) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Center>
          <Stack gap="md" align="center">
            <Loader
              size="lg"
              color="var(--mantine-color-primary-6)"
              type="dots"
            />
            <Text size="lg" c="dimmed" style={{ fontWeight: 500 }}>
              Authenticating...
            </Text>
            <Text size="sm" c="dimmed" style={{ textAlign: "center" }}>
              Please wait while we verify your credentials
            </Text>
          </Stack>
        </Center>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
