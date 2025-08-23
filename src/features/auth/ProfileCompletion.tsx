import {
  Alert,
  Box,
  Button,
  Center,
  Container,
  Grid,
  Group,
  LoadingOverlay,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconAlertCircle,
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandTwitter,
  IconBrandWhatsapp,
  IconMail,
  IconUser,
} from "@tabler/icons-react";
import { zodResolver } from "mantine-form-zod-resolver";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useCompleteUserProfile } from "../../hooks/useUser";
import { CompleteProfileRequest } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";

const profileSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address").optional(),
  whatsapp: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid WhatsApp number")
    .optional(),
  twitterLink: z
    .string()
    .regex(
      /^https?:\/\/(www\.)?twitter\.com\/\w+/,
      "Please enter a valid Twitter profile URL"
    )
    .optional(),
  tiktokLink: z
    .string()
    .regex(
      /^https?:\/\/(www\.)?tiktok\.com\/@\w+/,
      "Please enter a valid TikTok profile URL"
    )
    .optional(),
  instagramLink: z
    .string()
    .regex(
      /^https?:\/\/(www\.)?instagram\.com\/\w+/,
      "Please enter a valid Instagram profile URL"
    )
    .optional(),
  bio: z.string().optional(),
});

export function ProfileCompletion() {
  const navigate = useNavigate();
  const { user, error, clearError } = useAuthStore();
  const completeProfileMutation = useCompleteUserProfile();

  const isSubmitting = completeProfileMutation.isPending;

  const form = useForm<CompleteProfileRequest>({
    mode: "uncontrolled",
    initialValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      whatsapp: "",
      twitterLink: "",
      tiktokLink: "",
      instagramLink: "",
      bio: "",
    },
    validate: zodResolver(profileSchema) as any,
  });

  const handleSubmit = async (values: CompleteProfileRequest) => {
    clearError();

    // Filter out empty optional fields
    const cleanedValues = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value,
      ])
    );

    completeProfileMutation.mutate(cleanedValues as CompleteProfileRequest, {
      onSuccess: () => {
        console.log("Profile completed!");
        navigate("/dashboard", { replace: true });
      },
      onError: (err) => {
        console.error("Profile completion failed:", err);
      },
    });
  };

  if (!user) {
    navigate("/", { replace: true });
    return null;
  }

  // If profile is already complete, redirect to dashboard
  if (user.isProfileComplete) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  return (
    <Box className="auth-container">
      <Container size="sm" style={{ width: "100%", maxWidth: "600px" }}>
        <Paper className="auth-paper" p="xl" withBorder>
          <LoadingOverlay visible={isSubmitting} />

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
                Complete Your Profile
              </Title>
              <Text c="dimmed" size="sm">
                Help us personalize your Kendle experience (optional)
              </Text>
            </div>

            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Profile Error"
                color="red"
                variant="light"
                radius="md"
              >
                {error}
              </Alert>
            )}

            <form onSubmit={form.onSubmit(handleSubmit as any)}>
              <Stack gap="lg">
                <Grid>
                  <Grid.Col span={6}>
                    <TextInput
                      placeholder="Enter your first name *"
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
                      placeholder="Enter your last name *"
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

                <Grid>
                  <Grid.Col span={12}>
                    <TextInput
                      placeholder="Enter your username *"
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
                  </Grid.Col>
                </Grid>

                <TextInput
                  placeholder="Enter your email address (optional)"
                  leftSection={<IconMail size={18} />}
                  size="md"
                  radius="md"
                  classNames={{
                    input: "auth-input",
                    label: "auth-label",
                  }}
                  {...form.getInputProps("email")}
                />

                <TextInput
                  placeholder="Enter your WhatsApp number (optional)"
                  leftSection={<IconBrandWhatsapp size={18} />}
                  size="md"
                  radius="md"
                  classNames={{
                    input: "auth-input",
                    label: "auth-label",
                  }}
                  {...form.getInputProps("whatsapp")}
                />

                <TextInput
                  placeholder="Enter your Twitter profile URL (optional)"
                  leftSection={<IconBrandTwitter size={18} />}
                  size="md"
                  radius="md"
                  classNames={{
                    input: "auth-input",
                    label: "auth-label",
                  }}
                  {...form.getInputProps("twitterLink")}
                />

                <TextInput
                  placeholder="Enter your TikTok profile URL (optional)"
                  leftSection={<IconBrandTiktok size={18} />}
                  size="md"
                  radius="md"
                  classNames={{
                    input: "auth-input",
                    label: "auth-label",
                  }}
                  {...form.getInputProps("tiktokLink")}
                />

                <TextInput
                  placeholder="Enter your Instagram profile URL (optional)"
                  leftSection={<IconBrandInstagram size={18} />}
                  size="md"
                  radius="md"
                  classNames={{
                    input: "auth-input",
                    label: "auth-label",
                  }}
                  {...form.getInputProps("instagramLink")}
                />

                <TextInput
                  placeholder="Enter your bio (optional)"
                  leftSection={<IconUser size={18} />}
                  size="md"
                  radius="md"
                  classNames={{
                    input: "auth-input",
                    label: "auth-label",
                  }}
                  {...form.getInputProps("bio")}
                />

                <Group gap="sm" style={{ width: "100%" }}>
                  <Button
                    type="submit"
                    size="sm"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    className="auth-button"
                    style={{ flex: 1 }}
                  >
                    Complete Profile
                  </Button>
                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => navigate("/dashboard", { replace: true })}
                    disabled={isSubmitting}
                    className="auth-button"
                  >
                    Skip for Now
                  </Button>
                </Group>
              </Stack>
            </form>

            <Text size="xs" c="dimmed" ta="center">
              You can complete your profile now or skip and update these details
              later in your profile settings
            </Text>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
