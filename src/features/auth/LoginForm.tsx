import {
  Alert,
  Anchor,
  Box,
  Button,
  Center,
  Container,
  Divider,
  Group,
  LoadingOverlay,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconAlertCircle,
  IconBrandTwitter,
  IconLock,
  IconMail,
} from "@tabler/icons-react";
import { zodResolver } from "mantine-form-zod-resolver";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LoginFormData, loginSchema } from "../../lib/schemas";
import { useAuthStore } from "../../stores/authStore";

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormData>({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
    },
    validate: zodResolver(loginSchema),
  });

  const handleSubmit = async (values: LoginFormData) => {
    setIsSubmitting(true);
    clearError();

    try {
      await login(values);
      notifications.show({
        title: "Welcome back!",
        message: "You have successfully logged in.",
        color: "green",
      });

      // Redirect to the page they were trying to access or home
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err) {
      notifications.show({
        title: "Login failed",
        message: "Please check your credentials and try again.",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box className="auth-container">
      <Container size="xs" style={{ width: "100%", maxWidth: "400px" }}>
        <Paper className="auth-paper" p="xl" withBorder>
          <LoadingOverlay visible={isSubmitting} />

          {/* Decorative background elements */}
          <Box
            className="auth-decoration"
            style={{
              top: "-50px",
              right: "-50px",
              width: "100px",
              height: "100px",
              background:
                "linear-gradient(135deg, var(--mantine-color-primary-2), var(--mantine-color-primary-3))",
            }}
          />
          <Box
            className="auth-decoration"
            style={{
              bottom: "-30px",
              left: "-30px",
              width: "60px",
              height: "60px",
              background:
                "linear-gradient(135deg, var(--mantine-color-secondary-2), var(--mantine-color-secondary-3))",
            }}
          />

          <Stack
            gap="xl"
            style={{ position: "relative", zIndex: 1 }}
            className="auth-form"
          >
            <Center>
              <Box className="auth-logo">
                <IconBrandTwitter size={32} color="white" />
              </Box>
            </Center>

            <div style={{ textAlign: "center" }}>
              <Title
                order={1}
                size="h2"
                className="text-gradient"
                style={{ marginBottom: "var(--mantine-spacing-xs)" }}
              >
                Welcome Back
              </Title>
              <Text c="dimmed" size="sm">
                Sign in to your Kendle account to continue
              </Text>
            </div>

            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Authentication Error"
                color="red"
                variant="light"
                radius="md"
              >
                {error}
              </Alert>
            )}

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="lg">
                <TextInput
                  label="Email Address"
                  placeholder="your@email.com"
                  leftSection={<IconMail size={18} />}
                  required
                  size="md"
                  radius="md"
                  classNames={{
                    input: "auth-input",
                    label: "auth-label",
                  }}
                  {...form.getInputProps("email")}
                />

                <PasswordInput
                  label="Password"
                  placeholder="Enter your password"
                  leftSection={<IconLock size={18} />}
                  required
                  size="md"
                  radius="md"
                  classNames={{
                    input: "auth-input",
                    label: "auth-label",
                  }}
                  {...form.getInputProps("password")}
                />

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={isSubmitting}
                  disabled={isLoading}
                  className="auth-button"
                >
                  Sign In
                </Button>
              </Stack>
            </form>

            <Divider
              label="or"
              labelPosition="center"
              style={{
                borderColor: "var(--mantine-color-gray-3)",
                "--divider-color": "var(--mantine-color-gray-3)",
              }}
            />

            <Stack gap="md">
              <Group justify="center" gap="xs">
                <Text size="sm" c="dimmed">
                  Don't have an account?
                </Text>
                <Anchor
                  component={Link}
                  to="/register"
                  size="sm"
                  className="auth-link"
                >
                  Create account
                </Anchor>
              </Group>

              <Center>
                <Anchor
                  component={Link}
                  to="/forgot-password"
                  size="sm"
                  style={{
                    color: "var(--mantine-color-gray-6)",
                    textDecoration: "none",
                    "&:hover": {
                      color: "var(--mantine-color-gray-8)",
                      textDecoration: "underline",
                    },
                  }}
                >
                  Forgot your password?
                </Anchor>
              </Center>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
