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
  Stack,
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
firstName: z.string().min(1, "First name is required"),
lastName: z.string().min(1, "Last name is required"),
email: z.string().email("Please enter a valid email address").nullable().optional(),
whatsapp: z.string().nullable().optional(),
twitterLink: z.string().nullable().optional(),
tiktokLink: z.string().nullable().optional(),
instagramLink: z.string().nullable().optional(),
bio: z.string().max(500, "Bio must be less than 500 characters").nullable().optional(),
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
    values[field]?.trim()
  ).length;
  const completedOptional = optionalFields.filter((field) =>
    values[field] && values[field]?.trim()
  ).length;

  const requiredProgress = (completedRequired / requiredFields.length) * 70;
  const optionalProgress = (completedOptional / optionalFields.length) * 30;

  return Math.round(requiredProgress + optionalProgress);
};

const handleSubmit = async (values: CompleteProfileRequest) => {
  clearError();
  
  // Clean and format values according to ProfileCompletionDto
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

  completeProfileMutation.mutate(
    cleanedValues,
    {
      onSuccess: () => {
        console.log("Profile completed!");
        navigate("/", { replace: true });
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
  navigate("/", { replace: true });
  return null;
}

const progress = getCompletionProgress();

return (
  <Box
    style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1rem",
    }}
  >
    <Container size="md" style={{ width: "100%", maxWidth: "600px" }}>
      <Paper
        shadow="xl"
        radius="20px"
        p={0}
        style={{
          overflow: "hidden",
          background: "white",
          position: "relative",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(20px)",
        }}
      >
        <LoadingOverlay 
          visible={isSubmitting} 
          overlayProps={{ 
            blur: 3,
            backgroundOpacity: 0.3,
            color: "#667eea"
          }} 
        />

        {/* Header Section */}
        <Box
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "3rem 2rem",
            color: "white",
            textAlign: "center",
            position: "relative",
          }}
        >
          {/* Decorative elements */}
          <Box
            style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.1)",
              opacity: 0.6,
            }}
          />
          <Box
            style={{
              position: "absolute",
              bottom: "30px",
              right: "30px",
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.1)",
              opacity: 0.4,
            }}
          />

          <Center mb="xl">
            <Box
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(20px)",
                border: "2px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              }}
            >
              <IconSparkles size={36} stroke={1.5} />
            </Box>
          </Center>

          <Title order={1} size="2rem" mb="sm" fw={700}>
            Complete Your Profile
          </Title>

          <Text size="lg" opacity={0.9} mb="2rem" fw={400}>
            Let's personalize your Kendle experience
          </Text>

          {/* Progress Section */}
          <Box style={{ maxWidth: "320px", margin: "0 auto" }}>
            <Group justify="space-between" mb="md">
              <Text size="sm" opacity={0.9} fw={500}>
                Profile Progress
              </Text>
              <Text size="sm" opacity={0.9} fw={600}>
                {progress}%
              </Text>
            </Group>
            <Progress
              value={progress}
              size="lg"
              radius="xl"
              style={{
                "& .mantine-Progress-bar": {
                  background: "rgba(255, 255, 255, 0.9)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                },
                "& .mantine-Progress-track": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                },
              }}
            />
          </Box>
        </Box>

        {/* Form Section */}
        <Box p="3rem">
          {error && (
            <Alert
              icon={<IconAlertCircle size={18} />}
              title="Profile Error"
              color="red"
              variant="filled"
              radius="xl"
              mb="2rem"
              style={{
                border: "none",
                boxShadow: "0 4px 20px rgba(220, 53, 69, 0.2)",
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit as any)}>
            <Stack gap="2rem">
              {/* Basic Information Section */}
              <Box>
                <Group align="center" mb="xl" gap="sm">
                  <Box
                    style={{
                      padding: "8px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                    }}
                  >
                    <IconUser size={18} stroke={1.5} />
                  </Box>
                  <Text fw={600} size="lg" c="gray.8">
                    Basic Information
                  </Text>
                  <Box
                    style={{
                      padding: "4px 12px",
                      borderRadius: "20px",
                      background: "#fee2e2",
                      color: "#dc2626",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    Required
                  </Box>
                </Group>

                <Grid gutter="xl">
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="First Name"
                      placeholder="Enter your first name"
                      required
                      size="lg"
                      radius="xl"
                      styles={{
                        label: { 
                          marginBottom: "0.8rem", 
                          fontWeight: 600,
                          color: "#374151",
                          fontSize: "14px"
                        },
                        input: {
                          border: "2px solid #f3f4f6",
                          backgroundColor: "#fafafa",
                          padding: "1rem 1.5rem",
                          fontSize: "16px",
                          "&:focus": {
                            borderColor: "#667eea",
                            boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                            backgroundColor: "white",
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
                      size="lg"
                      radius="xl"
                      styles={{
                        label: { 
                          marginBottom: "0.8rem", 
                          fontWeight: 600,
                          color: "#374151",
                          fontSize: "14px"
                        },
                        input: {
                          border: "2px solid #f3f4f6",
                          backgroundColor: "#fafafa",
                          padding: "1rem 1.5rem",
                          fontSize: "16px",
                          "&:focus": {
                            borderColor: "#667eea",
                            boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                            backgroundColor: "white",
                          },
                        },
                      }}
                      {...form.getInputProps("lastName")}
                    />
                  </Grid.Col>
                </Grid>
              </Box>

              {/* Contact Information Section */}
              <Box>
                <Group align="center" mb="xl" gap="sm">
                  <Box
                    style={{
                      padding: "8px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                    }}
                  >
                    <IconMail size={18} stroke={1.5} />
                  </Box>
                  <Text fw={600} size="lg" c="gray.8">
                    Contact Information
                  </Text>
                  <Box
                    style={{
                      padding: "4px 12px",
                      borderRadius: "20px",
                      background: "#f0f9ff",
                      color: "#0369a1",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    Optional
                  </Box>
                  <Tooltip label="This helps others find and connect with you" radius="md">
                    <Box style={{ cursor: "help" }}>
                      <IconInfoCircle size={16} style={{ color: "#9ca3af" }} />
                    </Box>
                  </Tooltip>
                </Group>

                <Grid gutter="xl">
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="Email Address"
                      placeholder="your.email@example.com"
                      leftSection={
                        <IconMail size={18} style={{ color: "#9ca3af" }} />
                      }
                      size="lg"
                      radius="xl"
                      styles={{
                        label: { 
                          marginBottom: "0.8rem", 
                          fontWeight: 600,
                          color: "#374151",
                          fontSize: "14px"
                        },
                        input: {
                          border: "2px solid #f3f4f6",
                          backgroundColor: "#fafafa",
                          padding: "1rem 1.5rem",
                          paddingLeft: "3rem",
                          fontSize: "16px",
                          "&:focus": {
                            borderColor: "#667eea",
                            boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                            backgroundColor: "white",
                          },
                        },
                      }}
                      {...form.getInputProps("email")}
                      value={form.getValues().email || ""}
                      onChange={(e) => form.setFieldValue("email", e.target.value || null)}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="WhatsApp Number"
                      placeholder="+1234567890"
                      leftSection={
                        <IconBrandWhatsapp size={18} style={{ color: "#25d366" }} />
                      }
                      size="lg"
                      radius="xl"
                      styles={{
                        label: { 
                          marginBottom: "0.8rem", 
                          fontWeight: 600,
                          color: "#374151",
                          fontSize: "14px"
                        },
                        input: {
                          border: "2px solid #f3f4f6",
                          backgroundColor: "#fafafa",
                          padding: "1rem 1.5rem",
                          paddingLeft: "3rem",
                          fontSize: "16px",
                          "&:focus": {
                            borderColor: "#667eea",
                            boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                            backgroundColor: "white",
                          },
                        },
                      }}
                      {...form.getInputProps("whatsapp")}
                      value={form.getValues().whatsapp || ""}
                      onChange={(e) => form.setFieldValue("whatsapp", e.target.value || null)}
                    />
                  </Grid.Col>
                </Grid>
              </Box>

              {/* Bio Section */}
              <Box>
                <Textarea
                  label="Bio"
                  placeholder="Tell us a bit about yourself..."
                  autosize
                  minRows={3}
                  maxRows={4}
                  size="lg"
                  radius="xl"
                  styles={{
                    label: { 
                      marginBottom: "0.8rem", 
                      fontWeight: 600,
                      color: "#374151",
                      fontSize: "14px"
                    },
                    input: {
                      border: "2px solid #f3f4f6",
                      backgroundColor: "#fafafa",
                      padding: "1rem 1.5rem",
                      fontSize: "16px",
                      "&:focus": {
                        borderColor: "#667eea",
                        boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                        backgroundColor: "white",
                      },
                    },
                  }}
                  {...form.getInputProps("bio")}
                  value={form.getValues().bio || ""}
                  onChange={(e) => form.setFieldValue("bio", e.target.value || null)}
                />
              </Box>

              {/* Social Media Links Section */}
              <Box>
                <Group align="center" mb="xl" gap="sm">
                  <Box
                    style={{
                      padding: "8px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                    }}
                  >
                    <IconBrandTwitter size={18} stroke={1.5} />
                  </Box>
                  <Text fw={600} size="lg" c="gray.8">
                    Social Media Links
                  </Text>
                  <Box
                    style={{
                      padding: "4px 12px",
                      borderRadius: "20px",
                      background: "#f0f9ff",
                      color: "#0369a1",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    Optional
                  </Box>
                </Group>

                <Grid gutter="xl">
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="Twitter Link"
                      placeholder="https://twitter.com/yourusername"
                      leftSection={
                        <IconBrandTwitter size={18} style={{ color: "#1DA1F2" }} />
                      }
                      size="lg"
                      radius="xl"
                      styles={{
                        label: { 
                          marginBottom: "0.8rem", 
                          fontWeight: 600,
                          color: "#374151",
                          fontSize: "14px"
                        },
                        input: {
                          border: "2px solid #f3f4f6",
                          backgroundColor: "#fafafa",
                          padding: "1rem 1.5rem",
                          paddingLeft: "3rem",
                          fontSize: "16px",
                          "&:focus": {
                            borderColor: "#667eea",
                            boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                            backgroundColor: "white",
                          },
                        },
                      }}
                      {...form.getInputProps("twitterLink")}
                      value={form.getValues().twitterLink || ""}
                      onChange={(e) => form.setFieldValue("twitterLink", e.target.value || null)}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="Instagram Link"
                      placeholder="https://instagram.com/yourusername"
                      leftSection={
                        <IconBrandInstagram size={18} style={{ color: "#E4405F" }} />
                      }
                      size="lg"
                      radius="xl"
                      styles={{
                        label: { 
                          marginBottom: "0.8rem", 
                          fontWeight: 600,
                          color: "#374151",
                          fontSize: "14px"
                        },
                        input: {
                          border: "2px solid #f3f4f6",
                          backgroundColor: "#fafafa",
                          padding: "1rem 1.5rem",
                          paddingLeft: "3rem",
                          fontSize: "16px",
                          "&:focus": {
                            borderColor: "#667eea",
                            boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                            backgroundColor: "white",
                          },
                        },
                      }}
                      {...form.getInputProps("instagramLink")}
                      value={form.getValues().instagramLink || ""}
                      onChange={(e) => form.setFieldValue("instagramLink", e.target.value || null)}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="TikTok Link"
                      placeholder="https://tiktok.com/@yourusername"
                      leftSection={
                        <IconBrandTiktok size={18} style={{ color: "#000000" }} />
                      }
                      size="lg"
                      radius="xl"
                      styles={{
                        label: { 
                          marginBottom: "0.8rem", 
                          fontWeight: 600,
                          color: "#374151",
                          fontSize: "14px"
                        },
                        input: {
                          border: "2px solid #f3f4f6",
                          backgroundColor: "#fafafa",
                          padding: "1rem 1.5rem",
                          paddingLeft: "3rem",
                          fontSize: "16px",
                          "&:focus": {
                            borderColor: "#667eea",
                            boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                            backgroundColor: "white",
                          },
                        },
                      }}
                      {...form.getInputProps("tiktokLink")}
                      value={form.getValues().tiktokLink || ""}
                      onChange={(e) => form.setFieldValue("tiktokLink", e.target.value || null)}
                    />
                  </Grid.Col>
                </Grid>
              </Box>

              {/* Action Buttons */}
              <Stack gap="lg" mt="xl">
                <Button
                  type="submit"
                  size="xl"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  leftSection={<IconCheck size={20} stroke={1.5} />}
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    borderRadius: "16px",
                    height: "60px",
                    fontSize: "16px",
                    fontWeight: 600,
                    boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 35px rgba(102, 126, 234, 0.4)",
                    },
                  }}
                >
                  Complete Profile
                </Button>
                
                <Button
                  variant="subtle"
                  size="lg"
                  onClick={() => navigate("/", { replace: true })}
                  disabled={isSubmitting}
                  c="gray.6"
                  radius="xl"
                  style={{
                    height: "50px",
                    fontSize: "14px",
                    fontWeight: 500,
                    "&:hover": {
                      backgroundColor: "#f8fafc",
                    },
                  }}
                >
                  Skip for Now
                </Button>
              </Stack>

              {/* Footer Text */}
              <Text size="sm" c="gray.5" ta="center" mt="lg" px="md">
                You can always update these details later in your profile settings. 
                Your username will be automatically generated based on your name.
              </Text>
            </Stack>
          </form>
        </Box>
      </Paper>
    </Container>
  </Box>
);
}
