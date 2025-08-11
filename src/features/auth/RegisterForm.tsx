import {
  Alert,
  Anchor,
  Box,
  Button,
  Center,
  Container,
  Divider,
  Grid,
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
  IconCheck,
  IconLock,
  IconMail,
  IconPhone,
  IconUser,
} from "@tabler/icons-react";
import { zodResolver } from "mantine-form-zod-resolver";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RegisterFormData, registerSchema } from "../../lib/schemas";
import { useAuthStore } from "../../stores/authStore";

export function RegisterForm() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegisterFormData>({
    mode: "uncontrolled",
    initialValues: {
      username: "",
      email: "",
      phoneNumber: "",
      password: "",
      firstName: "",
      lastName: "",
    },
    validate: zodResolver(registerSchema),
  });

  const handleSubmit = async (values: RegisterFormData) => {
    setIsSubmitting(true);
    clearError();

    try {
      await register(values);
      notifications.show({
        title: "Account created!",
        message:
          "Welcome to Kendle! Your account has been created successfully.",
        color: "green",
        icon: <IconCheck size={16} />,
      });
      navigate("/", { replace: true });
    } catch (err) {
      notifications.show({
        title: "Registration failed",
        message: "Please check your information and try again.",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box className="auth-container">
      <Container size="sm" style={{ width: "100%", maxWidth: "500px" }}>
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
                Join Kendle
              </Title>
              <Text c="dimmed" size="sm">
                Create your account to get started
              </Text>
            </div>

            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Registration Error"
                color="red"
                variant="light"
                radius="md"
              >
                {error}
              </Alert>
            )}

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="lg">
                <Grid>
                  <Grid.Col span={6}>
                    <TextInput
                      label="First Name"
                      placeholder="John"
                      leftSection={<IconUser size={18} />}
                      required
                      size="md"
                      radius="md"
                      classNames={{
                        input: "auth-input",
                        label: "auth-label",
                      }}
                      {...form.getInputProps("firstName")}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput
                      label="Last Name"
                      placeholder="Doe"
                      leftSection={<IconUser size={18} />}
                      required
                      size="md"
                      radius="md"
                      classNames={{
                        input: "auth-input",
                        label: "auth-label",
                      }}
                      {...form.getInputProps("lastName")}
                    />
                  </Grid.Col>
                </Grid>

                <TextInput
                  label="Username"
                  placeholder="johndoe"
                  leftSection={<IconUser size={18} />}
                  required
                  size="md"
                  radius="md"
                  classNames={{
                    input: "auth-input",
                    label: "auth-label",
                  }}
                  {...form.getInputProps("username")}
                />

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

                <TextInput
                  label="Phone Number"
                  placeholder="+1234567890"
                  leftSection={<IconPhone size={18} />}
                  required
                  size="md"
                  radius="md"
                  classNames={{
                    input: "auth-input",
                    label: "auth-label",
                  }}
                  {...form.getInputProps("phoneNumber")}
                />

                <PasswordInput
                  label="Password"
                  placeholder="Create a strong password"
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

                <Alert
                  color="blue"
                  variant="light"
                  radius="md"
                  icon={<IconCheck size={16} />}
                >
                  <Text size="xs">
                    Password must be at least 8 characters long and contain
                    uppercase, lowercase, and numbers.
                  </Text>
                </Alert>

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={isSubmitting}
                  disabled={isLoading}
                  className="auth-button"
                >
                  Create Account
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

            <Group justify="center" gap="xs">
              <Text size="sm" c="dimmed">
                Already have an account?
              </Text>
              <Anchor
                component={Link}
                to="/login"
                size="sm"
                className="auth-link"
              >
                Sign in
              </Anchor>
            </Group>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
