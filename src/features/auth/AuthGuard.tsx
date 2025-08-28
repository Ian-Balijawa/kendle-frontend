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
            <Image src={"/logo.png"} alt="logo" width={100} height={100} />
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
