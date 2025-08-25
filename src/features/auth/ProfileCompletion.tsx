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
  Progress,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconAlertCircle,
  IconBrandWhatsapp,
  IconCheck,
  IconInfoCircle,
  IconMail,
  IconSparkles,
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
  whatsapp: z.string().optional(),
  twitterLink: z.string().optional(),
  tiktokLink: z.string().optional(),
  instagramLink: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
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

  const getCompletionProgress = () => {
    const values = form.getValues();
    const requiredFields = ["username", "firstName", "lastName"] as const;
    const optionalFields = [
      "email",
      "whatsapp",
      "twitterLink",
      "tiktokLink",
      "instagramLink",
      "bio",
    ] as const;

    const completedRequired = requiredFields.filter((field) =>
      values[field]?.trim()
    ).length;
    const completedOptional = optionalFields.filter((field) =>
      values[field]?.trim()
    ).length;

    const requiredProgress = (completedRequired / requiredFields.length) * 70;
    const optionalProgress = (completedOptional / optionalFields.length) * 30;

    return Math.round(requiredProgress + optionalProgress);
  };

  const handleSubmit = async (values: CompleteProfileRequest) => {
    clearError();
    const cleanedValues = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value,
      ])
    );

    completeProfileMutation.mutate(
      cleanedValues as unknown as CompleteProfileRequest,
      {
        onSuccess: () => {
          console.log("Profile completed!");
          navigate("/dashboard", { replace: true });
        },
        onError: (err) => {
          console.error("Profile completion failed:", err);
        },
      }
    );
  };

  if (!user) {
    navigate("/", { replace: true });
    return null;
  }

  if (user.isProfileComplete) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const progress = getCompletionProgress();

  return (
    <Container p={4} size="sm">
      <Paper
        shadow="xl"
        radius="xl"
        p={0}
        style={{
          overflow: "hidden",
          background: "white",
          position: "relative",
        }}
      >
        <LoadingOverlay visible={isSubmitting} overlayProps={{ blur: 2 }} />

        <Box
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "2rem",
            color: "white",
            textAlign: "center",
            position: "relative",
          }}
        >
          <Center mb="md">
            <Box
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              <IconSparkles size={28} />
            </Box>
          </Center>

          <Title order={1} size="h2" mb="xs" fw={600}>
            Complete Your Profile
          </Title>

          <Text size="sm" opacity={0.9} mb="lg">
            Let's personalize your Kendle experience
          </Text>

          <Box style={{ maxWidth: "300px", margin: "0 auto" }}>
            <Group justify="space-between" mb="xs">
              <Text size="xs" opacity={0.8}>
                Progress
              </Text>
              <Text size="xs" opacity={0.8}>
                {progress}%
              </Text>
            </Group>
            <Progress
              value={progress}
              size="sm"
              radius="xl"
              style={{
                "& .mantine-Progress-bar": {
                  background: "rgba(255, 255, 255, 0.9)",
                },
              }}
            />
          </Box>
        </Box>

        <Box p="2rem">
          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Profile Error"
              color="red"
              variant="light"
              radius="md"
              mb="xl"
            >
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit as any)}>
            <Group align="center" my="xs">
              <IconUser size={18} style={{ color: "#667eea" }} />
              <Text fw={600} size="sm" c="gray.8">
                Basic Information
              </Text>
              <Text size="xs" c="red.6">
                Required
              </Text>
            </Group>

            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="First Name"
                  placeholder="Enter your first name"
                  required
                  size="md"
                  radius="md"
                  styles={{
                    label: { marginBottom: "0.5rem", fontWeight: 500 },
                    input: {
                      border: "1px solid #e9ecef",
                      "&:focus": {
                        borderColor: "#667eea",
                        boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.1)",
                      },
                    },
                  }}
                  {...form.getInputProps("firstName")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Last Name"
                  placeholder="Enter your last name"
                  required
                  size="md"
                  radius="md"
                  styles={{
                    label: { marginBottom: "0.5rem", fontWeight: 500 },
                    input: {
                      border: "1px solid #e9ecef",
                      "&:focus": {
                        borderColor: "#667eea",
                        boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.1)",
                      },
                    },
                  }}
                  {...form.getInputProps("lastName")}
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label="Username"
              placeholder="Choose a unique username"
              required
              size="md"
              radius="md"
              mt="md"
              styles={{
                label: { marginBottom: "0.5rem", fontWeight: 500 },
                input: {
                  border: "1px solid #e9ecef",
                  "&:focus": {
                    borderColor: "#667eea",
                    boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.1)",
                  },
                },
              }}
              {...form.getInputProps("username")}
            />

            <Group align="center" mb="md">
              <IconMail size={18} style={{ color: "#667eea" }} />
              <Text my="xs" fw={600} size="sm" c="gray.8">
                Contact Information
              </Text>
              <Text size="xs" c="gray.6">
                Optional
              </Text>
              <Tooltip label="This helps others find and connect with you">
                <IconInfoCircle size={14} style={{ color: "#adb5bd" }} />
              </Tooltip>
            </Group>

            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Email Address"
                  placeholder="your.email@example.com"
                  leftSection={<IconMail size={16} />}
                  size="md"
                  radius="md"
                  styles={{
                    label: { marginBottom: "0.5rem", fontWeight: 500 },
                    input: {
                      border: "1px solid #e9ecef",
                      "&:focus": {
                        borderColor: "#667eea",
                        boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.1)",
                      },
                    },
                  }}
                  {...form.getInputProps("email")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="WhatsApp Number"
                  placeholder="+1234567890"
                  leftSection={<IconBrandWhatsapp size={16} />}
                  size="md"
                  radius="md"
                  styles={{
                    label: { marginBottom: "0.5rem", fontWeight: 500 },
                    input: {
                      border: "1px solid #e9ecef",
                      "&:focus": {
                        borderColor: "#667eea",
                        boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.1)",
                      },
                    },
                  }}
                  {...form.getInputProps("whatsapp")}
                />
              </Grid.Col>
            </Grid>

            <Textarea
              label="Bio"
              placeholder="Tell us a bit about yourself..."
              autosize
              minRows={2}
              maxRows={3}
              size="md"
              radius="md"
              styles={{
                label: { marginBottom: "0.5rem", fontWeight: 500 },
                input: {
                  border: "1px solid #e9ecef",
                  "&:focus": {
                    borderColor: "#667eea",
                    boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.1)",
                  },
                },
              }}
              {...form.getInputProps("bio")}
            />

            <Group gap="sm" mt="xl">
              <Button
                type="submit"
                size="lg"
                loading={isSubmitting}
                disabled={isSubmitting}
                leftSection={<IconCheck size={18} />}
                style={{
                  flex: 1,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                  },
                }}
                radius="md"
              >
                Complete Profile
              </Button>
              <Button
                variant="subtle"
                size="lg"
                onClick={() => navigate("/dashboard", { replace: true })}
                disabled={isSubmitting}
                c="gray.7"
                radius="md"
              >
                Skip for Now
              </Button>
            </Group>

            <Text size="xs" c="dimmed" ta="center" mt="md">
              You can always update these details later in your profile settings
            </Text>
          </form>
        </Box>
      </Paper>
    </Container>
  );
}
