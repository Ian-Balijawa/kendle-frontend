import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  Group,
  LoadingOverlay,
  Paper,
  Progress,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
  Stack,
  Card,
  Badge,
  Avatar,
  ActionIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconAlertCircle,
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandTwitter,
  IconBrandWhatsapp,
  IconCheck,
  IconInfoCircle,
  IconMail,
  IconUser,
  IconArrowRight,
} from "@tabler/icons-react";
import { zodResolver } from "mantine-form-zod-resolver";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useCompleteUserProfile } from "../../hooks/useUser";
import { CompleteProfileRequest } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .nullable()
    .optional(),
  whatsapp: z.string().nullable().optional(),
  twitterLink: z.string().nullable().optional(),
  tiktokLink: z.string().nullable().optional(),
  instagramLink: z.string().nullable().optional(),
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .nullable()
    .optional(),
});

export function ProfileCompletion() {
  const navigate = useNavigate();
  const { user, error, clearError } = useAuthStore();
  const completeProfileMutation = useCompleteUserProfile();
  const isSubmitting = completeProfileMutation.isPending;

  const form = useForm<CompleteProfileRequest>({
    mode: "uncontrolled",
    initialValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || null,
      whatsapp: user?.phoneNumber || null,
      twitterLink: user?.twitterLink || null,
      tiktokLink: user?.tiktokLink || null,
      instagramLink: user?.instagramLink || null,
      bio: user?.bio || null,
    },
    validate: zodResolver(profileSchema) as any,
  });

  const getCompletionProgress = () => {
    const values = form.getValues();
    const requiredFields = ["firstName", "lastName"] as const;
    const optionalFields = [
      "email",
      "whatsapp",
      "twitterLink",
      "tiktokLink",
      "instagramLink",
      "bio",
    ] as const;

    const completedRequired = requiredFields.filter((field) =>
      values[field]?.trim(),
    ).length;
    const completedOptional = optionalFields.filter(
      (field) => values[field] && values[field]?.trim(),
    ).length;

    const requiredProgress = (completedRequired / requiredFields.length) * 70;
    const optionalProgress = (completedOptional / optionalFields.length) * 30;

    return Math.round(requiredProgress + optionalProgress);
  };

  const handleSubmit = async (values: CompleteProfileRequest) => {
    clearError();

    const cleanedValues: CompleteProfileRequest = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email?.trim() || null,
      whatsapp: values.whatsapp?.trim() || null,
      twitterLink: values.twitterLink?.trim() || null,
      tiktokLink: values.tiktokLink?.trim() || null,
      instagramLink: values.instagramLink?.trim() || null,
      bio: values.bio?.trim() || null,
    };

    completeProfileMutation.mutate(cleanedValues, {
      onSuccess: () => {
        navigate("/", { replace: true });
      },
      onError: (err) => {
        console.error(err);
      },
    });
  };

  if (!user) {
    navigate("/", { replace: true });
    return null;
  }

  if (user.isProfileComplete) {
    navigate("/", { replace: true });
    return null;
  }

  const progress = getCompletionProgress();

  return (
    <Box
      style={{
        minHeight: "100vh",
        padding: "2rem 1rem",
      }}
    >
      <Container size="xs">
        <LoadingOverlay
          visible={isSubmitting}
          overlayProps={{
            blur: 2,
            backgroundOpacity: 0.1,
          }}
        />

        <Box mb="xl" ta="center">
          <Avatar
            size={80}
            radius="xl"
            color="blue"
            style={{
              margin: "0 auto 1.5rem",
              boxShadow: "0 4px 20px rgba(34, 139, 230, 0.15)",
            }}
          >
            <IconUser size={40} />
          </Avatar>

          <Title order={1} size="h2" fw={700} mb="xs">
            Complete Your Profile
          </Title>

          <Text size="lg" mb="xl">
            Help others get to know you better
          </Text>

          <Card withBorder radius="lg" p="sm" mb="xl">
            <Group justify="space-between" mb="sm">
              <Text size="sm" fw={600}>
                Profile Completion
              </Text>
              <Badge color="blue" variant="light" size="sm">
                {progress}%
              </Badge>
            </Group>
            <Progress value={progress} size="md" radius="xl" color="blue" />
          </Card>
        </Box>

        <Paper withBorder radius="lg" p="sm">
          {error && (
            <Alert
              icon={<IconAlertCircle size={18} />}
              title="Error"
              color="red"
              variant="light"
              radius="md"
              mb="xl"
            >
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit as any)}>
            <Stack gap="sm">
              <Box>
                <Group align="center" mb="lg" gap="xs">
                  <IconUser size={20} color="var(--mantine-color-blue-6)" />
                  <Text fw={600} size="lg">
                    Basic Information
                  </Text>
                  <Badge color="red" variant="light" size="xs">
                    Required
                  </Badge>
                </Group>

                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      placeholder="Enter your first name"
                      required
                      size="md"
                      radius="md"
                      styles={{
                        label: {
                          fontWeight: 600,
                          color: "var(--mantine-color-gray-7)",
                          marginBottom: "0.5rem",
                        },
                        input: {
                          border: "1px solid var(--mantine-color-gray-3)",
                          "&:focus": {
                            borderColor: "var(--mantine-color-blue-6)",
                            boxShadow: "0 0 0 2px var(--mantine-color-blue-1)",
                          },
                        },
                      }}
                      {...form.getInputProps("firstName")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      placeholder="Enter your last name"
                      required
                      size="md"
                      radius="md"
                      styles={{
                        label: {
                          fontWeight: 600,
                          color: "var(--mantine-color-gray-7)",
                          marginBottom: "0.5rem",
                        },
                        input: {
                          border: "1px solid var(--mantine-color-gray-3)",
                          "&:focus": {
                            borderColor: "var(--mantine-color-blue-6)",
                            boxShadow: "0 0 0 2px var(--mantine-color-blue-1)",
                          },
                        },
                      }}
                      {...form.getInputProps("lastName")}
                    />
                  </Grid.Col>
                </Grid>
              </Box>

              <Box>
                <Group align="center" mb="lg" gap="xs">
                  <IconMail size={20} color="var(--mantine-color-blue-6)" />
                  <Text fw={600} size="lg">
                    Contact Information
                  </Text>
                  <Badge color="blue" variant="light" size="xs">
                    Optional
                  </Badge>
                  <Tooltip
                    label="This helps others find and connect with you"
                    radius="md"
                  >
                    <ActionIcon variant="subtle" color="gray" size="sm">
                      <IconInfoCircle size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>

                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      placeholder="your.email@example.com"
                      leftSection={
                        <IconMail
                          size={18}
                          color="var(--mantine-color-gray-5)"
                        />
                      }
                      size="md"
                      radius="md"
                      styles={{
                        label: {
                          fontWeight: 600,
                          color: "var(--mantine-color-gray-7)",
                          marginBottom: "0.5rem",
                        },
                        input: {
                          border: "1px solid var(--mantine-color-gray-3)",
                          "&:focus": {
                            borderColor: "var(--mantine-color-blue-6)",
                            boxShadow: "0 0 0 2px var(--mantine-color-blue-1)",
                          },
                        },
                      }}
                      {...form.getInputProps("email")}
                      value={form.getValues().email || ""}
                      onChange={(e) =>
                        form.setFieldValue("email", e.target.value || null)
                      }
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      placeholder="+1234567890"
                      leftSection={
                        <IconBrandWhatsapp
                          size={18}
                          color="var(--mantine-color-green-6)"
                        />
                      }
                      size="md"
                      radius="md"
                      styles={{
                        label: {
                          fontWeight: 600,
                          color: "var(--mantine-color-gray-7)",
                          marginBottom: "0.5rem",
                        },
                        input: {
                          border: "1px solid var(--mantine-color-gray-3)",
                          "&:focus": {
                            borderColor: "var(--mantine-color-blue-6)",
                            boxShadow: "0 0 0 2px var(--mantine-color-blue-1)",
                          },
                        },
                      }}
                      {...form.getInputProps("whatsapp")}
                      value={form.getValues().whatsapp || ""}
                      onChange={(e) =>
                        form.setFieldValue("whatsapp", e.target.value || null)
                      }
                    />
                  </Grid.Col>
                </Grid>
              </Box>

              <Box>
                <Text fw={600} size="md" mb="sm">
                  About You
                </Text>
                <Textarea
                  placeholder="Tell us a bit about yourself..."
                  autosize
                  minRows={3}
                  maxRows={4}
                  size="md"
                  radius="md"
                  styles={{
                    input: {
                      border: "1px solid var(--mantine-color-gray-3)",
                      "&:focus": {
                        borderColor: "var(--mantine-color-blue-6)",
                        boxShadow: "0 0 0 2px var(--mantine-color-blue-1)",
                      },
                    },
                  }}
                  {...form.getInputProps("bio")}
                  value={form.getValues().bio || ""}
                  onChange={(e) =>
                    form.setFieldValue("bio", e.target.value || null)
                  }
                />
              </Box>

              <Box>
                <Group align="center" mb="lg" gap="xs">
                  <IconBrandTwitter
                    size={20}
                    color="var(--mantine-color-blue-6)"
                  />
                  <Text fw={600} size="lg">
                    Socials
                  </Text>
                  <Badge color="blue" variant="light" size="xs">
                    Optional
                  </Badge>
                </Group>

                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      placeholder="https://twitter.com/yourusername"
                      leftSection={
                        <IconBrandTwitter
                          size={18}
                          color="var(--mantine-color-blue-5)"
                        />
                      }
                      size="md"
                      radius="md"
                      styles={{
                        label: {
                          fontWeight: 600,
                          color: "var(--mantine-color-gray-7)",
                          marginBottom: "0.5rem",
                        },
                        input: {
                          border: "1px solid var(--mantine-color-gray-3)",
                          "&:focus": {
                            borderColor: "var(--mantine-color-blue-6)",
                            boxShadow: "0 0 0 2px var(--mantine-color-blue-1)",
                          },
                        },
                      }}
                      {...form.getInputProps("twitterLink")}
                      value={form.getValues().twitterLink || ""}
                      onChange={(e) =>
                        form.setFieldValue(
                          "twitterLink",
                          e.target.value || null,
                        )
                      }
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      placeholder="https://instagram.com/yourusername"
                      leftSection={
                        <IconBrandInstagram
                          size={18}
                          color="var(--mantine-color-pink-6)"
                        />
                      }
                      size="md"
                      radius="md"
                      styles={{
                        label: {
                          fontWeight: 600,
                          color: "var(--mantine-color-gray-7)",
                          marginBottom: "0.5rem",
                        },
                        input: {
                          border: "1px solid var(--mantine-color-gray-3)",
                          "&:focus": {
                            borderColor: "var(--mantine-color-blue-6)",
                            boxShadow: "0 0 0 2px var(--mantine-color-blue-1)",
                          },
                        },
                      }}
                      {...form.getInputProps("instagramLink")}
                      value={form.getValues().instagramLink || ""}
                      onChange={(e) =>
                        form.setFieldValue(
                          "instagramLink",
                          e.target.value || null,
                        )
                      }
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      placeholder="https://tiktok.com/@yourusername"
                      leftSection={
                        <IconBrandTiktok
                          size={18}
                          color="var(--mantine-color-gray-8)"
                        />
                      }
                      size="md"
                      radius="md"
                      styles={{
                        label: {
                          fontWeight: 600,
                          color: "var(--mantine-color-gray-7)",
                          marginBottom: "0.5rem",
                        },
                        input: {
                          border: "1px solid var(--mantine-color-gray-3)",
                          "&:focus": {
                            borderColor: "var(--mantine-color-blue-6)",
                            boxShadow: "0 0 0 2px var(--mantine-color-blue-1)",
                          },
                        },
                      }}
                      {...form.getInputProps("tiktokLink")}
                      value={form.getValues().tiktokLink || ""}
                      onChange={(e) =>
                        form.setFieldValue("tiktokLink", e.target.value || null)
                      }
                    />
                  </Grid.Col>
                </Grid>
              </Box>

              <Stack gap="sm" mt="xl">
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  leftSection={<IconCheck size={18} />}
                  rightSection={<IconArrowRight size={18} />}
                  color="blue"
                  radius="md"
                  fullWidth
                  style={{
                    height: "48px",
                    fontWeight: 600,
                  }}
                >
                  Complete Profile
                </Button>

                <Button
                  variant="subtle"
                  onClick={() => navigate("/", { replace: true })}
                  disabled={isSubmitting}
                  radius="md"
                  fullWidth
                  style={{
                    height: "40px",
                    fontWeight: 500,
                  }}
                >
                  Skip for Now
                </Button>
              </Stack>

              <Text size="sm" ta="center" mt="lg">
                You can always update these details later in your profile
                settings
              </Text>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
