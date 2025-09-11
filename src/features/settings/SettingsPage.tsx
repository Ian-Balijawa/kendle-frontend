import {
  Avatar,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Modal,
  Stack,
  Switch,
  Tabs,
  Text,
  TextInput,
  Textarea,
  Title,
  ActionIcon,
  FileInput,
  Image,
  Container,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconBell,
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandTwitter,
  IconBrandWhatsapp,
  IconEdit,
  IconLock,
  IconMoon,
  IconPalette,
  IconShield,
  IconSun,
  IconUser,
  IconUserCheck,
  IconCamera,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useUpdateProfile } from "../../hooks/useUser";
import { UpdateProfileRequest } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";
import { useUIStore } from "../../stores/uiStore";
import { User } from "../../types/auth";
import {
  useUploadAvatar,
  useDeleteAvatar,
  useUploadBackgroundImage,
  useDeleteBackgroundImage,
} from "../../hooks/useProfileImages";

export function SettingsPage() {
  const { user } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const [activeTab, setActiveTab] = useState("account");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [backgroundModalOpen, setBackgroundModalOpen] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null,
  );
  const [selectedBackgroundFile, setSelectedBackgroundFile] =
    useState<File | null>(null);

  const updateProfileMutation = useUpdateProfile();

  // Image management hooks
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();
  const uploadBackgroundImage = useUploadBackgroundImage();
  const deleteBackgroundImage = useDeleteBackgroundImage();

  const editForm = useForm<UpdateProfileRequest>({
    initialValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      bio: user?.bio || null,
      username: user?.username || "",
      email: user?.email || "",
      whatsapp: user?.whatsapp || "",
      twitterLink: user?.twitterLink || "",
      tiktokLink: user?.tiktokLink || "",
      instagramLink: user?.instagramLink || "",
    },
  });

  useEffect(() => {
    if (user) {
      editForm.setValues({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: user.bio || null,
        username: user.username || "",
        email: user.email || "",
        whatsapp: user.whatsapp || "",
        twitterLink: user.twitterLink || "",
        tiktokLink: user.tiktokLink || "",
        instagramLink: user.instagramLink || "",
      });
    }
  }, [user]);

  const handleSaveProfile = (values: UpdateProfileRequest) => {
    updateProfileMutation.mutate(values, {
      onSuccess: () => {
        setEditModalOpen(false);
      },
      onError: (error) => {
        console.error("Failed to update profile:", error);
      },
    });
  };

  // Avatar management handlers
  const handleAvatarFileSelect = (file: File | null) => {
    setSelectedAvatarFile(file);
  };

  const handleAvatarUpload = async () => {
    if (selectedAvatarFile) {
      await uploadAvatar.mutateAsync(selectedAvatarFile);
      setAvatarModalOpen(false);
      setSelectedAvatarFile(null);
    }
  };

  const handleAvatarDelete = async () => {
    await deleteAvatar.mutateAsync();
    setAvatarModalOpen(false);
  };

  // Background image management handlers
  const handleBackgroundFileSelect = (file: File | null) => {
    setSelectedBackgroundFile(file);
  };

  const handleBackgroundUpload = async () => {
    if (selectedBackgroundFile) {
      await uploadBackgroundImage.mutateAsync(selectedBackgroundFile);
      setBackgroundModalOpen(false);
      setSelectedBackgroundFile(null);
    }
  };

  const handleBackgroundDelete = async () => {
    await deleteBackgroundImage.mutateAsync();
    setBackgroundModalOpen(false);
  };

  const avatarURL = `${import.meta.env.VITE_API_URL}/stream/image/${user?.avatar?.split("/").pop()}`;

  const socialLinks = [
    {
      key: "whatsapp",
      url: `https://wa.me/${user?.whatsapp}`,
      icon: IconBrandWhatsapp,
      label: "WhatsApp",
      color: "var(--mantine-color-green-6)",
    },
    {
      key: "twitterLink",
      url: user?.twitterLink,
      icon: IconBrandTwitter,
      label: "Twitter",
      color: "var(--mantine-color-blue-5)",
    },
    {
      key: "instagramLink",
      url: user?.instagramLink,
      icon: IconBrandInstagram,
      label: "Instagram",
      color: "var(--mantine-color-pink-6)",
    },
    {
      key: "tiktokLink",
      url: user?.tiktokLink,
      icon: IconBrandTiktok,
      label: "TikTok",
      color: "var(--mantine-color-dark-8)",
    },
  ].filter((link) => user?.[link.key as keyof User]);

  return (
    <Container size="xl" px="sm">
      <Stack gap="sm">
        <Box>
          <Title order={1} size="h2" fw={700} mb="xs">
            Settings
          </Title>
          <Text c="dimmed" size="sm">
            Manage your account settings and preferences
          </Text>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(value) => setActiveTab(value || "account")}
          variant="pills"
        >
          <Tabs.List>
            <Tabs.Tab value="account" leftSection={<IconUser size={16} />}>
              Account
            </Tabs.Tab>
            <Tabs.Tab
              value="appearance"
              leftSection={<IconPalette size={16} />}
            >
              Appearance
            </Tabs.Tab>
            <Tabs.Tab
              value="notifications"
              leftSection={<IconBell size={16} />}
            >
              Notifications
            </Tabs.Tab>
            <Tabs.Tab value="privacy" leftSection={<IconShield size={16} />}>
              Privacy
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="account" pt="xl">
            <Stack gap="sm">
              <Card p="sm">
                <Stack gap="sm">
                  <Group justify="space-between" align="flex-start">
                    <Group gap="sm">
                      <Box style={{ position: "relative" }}>
                        <Avatar
                          src={avatarURL || "/user.png"}
                          alt={user?.firstName || user?.username || "User"}
                          size={80}
                          radius="50%"
                          style={{
                            border: "3px solid var(--mantine-color-gray-2)",
                          }}
                        >
                          <Text size="2rem" fw={600}>
                            {(user?.firstName || user?.username || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </Text>
                        </Avatar>
                        <ActionIcon
                          variant="filled"
                          color="blue"
                          size="sm"
                          radius="xl"
                          style={{
                            position: "absolute",
                            bottom: -5,
                            right: -5,
                            border: "2px solid white",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                          onClick={() => setAvatarModalOpen(true)}
                        >
                          <IconCamera size={12} />
                        </ActionIcon>
                      </Box>
                      <Box>
                        <Title order={3} size="h4" fw={600}>
                          {user?.firstName && user?.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user?.username || "Unknown User"}
                        </Title>
                        <Text c="dimmed" size="sm">
                          @{user?.username || user?.phoneNumber || "unknown"}
                        </Text>
                        {user?.isVerified && (
                          <Group gap="xs" mt="xs">
                            <IconUserCheck
                              size={16}
                              color="var(--mantine-color-blue-6)"
                            />
                            <Text size="sm" c="blue" fw={500}>
                              Verified Account
                            </Text>
                          </Group>
                        )}
                      </Box>
                    </Group>
                    <Button
                      leftSection={<IconEdit size={16} />}
                      onClick={() => setEditModalOpen(true)}
                      size="sm"
                      style={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        fontWeight: 600,
                        fontSize: "12px",
                        boxShadow:
                          "0 4px 16px rgba(102, 126, 234, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      Edit Profile
                    </Button>
                  </Group>

                  {user?.bio && (
                    <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                      {user.bio}
                    </Text>
                  )}

                  {socialLinks.length > 0 && (
                    <Group mt="xs" gap="sm">
                      {socialLinks.map(
                        ({ key, url, icon: Icon, label, color }) => (
                          <Button
                            key={key}
                            component="a"
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="light"
                            leftSection={<Icon size={14} />}
                            size="xs"
                            style={{
                              color: color,
                              borderColor: color + "30",
                              backgroundColor: color + "10",
                            }}
                          >
                            {label}
                          </Button>
                        ),
                      )}
                    </Group>
                  )}
                </Stack>
              </Card>

              {/* Account Information */}
              <Card p="sm">
                <Stack gap="sm">
                  <Title order={4} size="h5" fw={600}>
                    Account Information
                  </Title>
                  <Grid>
                    <Grid.Col span={6}>
                      <Text size="sm" fw={500} c="dimmed">
                        Email
                      </Text>
                      <Text size="sm">{user?.email || "Not provided"}</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="sm" fw={500} c="dimmed">
                        Phone
                      </Text>
                      <Text size="sm">
                        {user?.phoneNumber || "Not provided"}
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="sm" fw={500} c="dimmed">
                        Member Since
                      </Text>
                      <Text size="sm">
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "Unknown"}
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="sm" fw={500} c="dimmed">
                        Profile Status
                      </Text>
                      <Text
                        size="sm"
                        c={user?.isProfileComplete ? "green" : "orange"}
                      >
                        {user?.isProfileComplete ? "Complete" : "Incomplete"}
                      </Text>
                    </Grid.Col>
                  </Grid>
                </Stack>
              </Card>

              {/* Security Settings */}
              <Card p="sm">
                <Stack gap="sm">
                  <Title order={4} size="h5" fw={600}>
                    Security
                  </Title>
                  <Group justify="space-between" align="center">
                    <Box>
                      <Text size="sm" fw={500}>
                        Change Password
                      </Text>
                      <Text size="xs" c="dimmed">
                        Update your password for better security
                      </Text>
                    </Box>
                    <Button
                      variant="light"
                      size="sm"
                      leftSection={<IconLock size={14} />}
                    >
                      Change
                    </Button>
                  </Group>
                  <Divider />
                  <Group justify="space-between" align="center">
                    <Box>
                      <Text size="sm" fw={500}>
                        Two-Factor Authentication
                      </Text>
                      <Text size="xs" c="dimmed">
                        Add an extra layer of security to your account
                      </Text>
                    </Box>
                    <Switch size="sm" />
                  </Group>
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="appearance" pt="xl">
            <Stack gap="sm">
              <Card p="sm">
                <Stack gap="sm">
                  <Title order={4} size="h5" fw={600}>
                    Theme
                  </Title>
                  <Group justify="space-between" align="center">
                    <Group gap="sm">
                      {theme === "dark" ? (
                        <IconMoon
                          size={20}
                          color="var(--mantine-color-blue-6)"
                        />
                      ) : (
                        <IconSun
                          size={20}
                          color="var(--mantine-color-orange-6)"
                        />
                      )}
                      <Box>
                        <Text size="sm" fw={500}>
                          {theme === "dark" ? "Dark Mode" : "Light Mode"}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {theme === "dark"
                            ? "Dark theme is currently active"
                            : "Light theme is currently active"}
                        </Text>
                      </Box>
                    </Group>
                    <Button
                      size="sm"
                      onClick={() =>
                        setTheme(theme === "light" ? "dark" : "light")
                      }
                      style={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        fontWeight: 600,
                        fontSize: "12px",
                        boxShadow:
                          "0 4px 16px rgba(102, 126, 234, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      Switch to {theme === "dark" ? "Light" : "Dark"}
                    </Button>
                  </Group>
                </Stack>
              </Card>

              <Card p="sm">
                <Stack gap="sm">
                  <Title order={4} size="h5" fw={600}>
                    Display Preferences
                  </Title>
                  <Group justify="space-between" align="center">
                    <Box>
                      <Text size="sm" fw={500}>
                        Compact Mode
                      </Text>
                      <Text size="xs" c="dimmed">
                        Reduce spacing for a more compact interface
                      </Text>
                    </Box>
                    <Switch size="sm" />
                  </Group>
                  <Divider />
                  <Group justify="space-between" align="center">
                    <Box>
                      <Text size="sm" fw={500}>
                        Show Animations
                      </Text>
                      <Text size="xs" c="dimmed">
                        Enable smooth transitions and animations
                      </Text>
                    </Box>
                    <Switch size="sm" defaultChecked />
                  </Group>
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="notifications" pt="xl">
            <Stack gap="sm">
              <Card p="sm">
                <Stack gap="sm">
                  <Title order={4} size="h5" fw={600}>
                    Push Notifications
                  </Title>
                  <Group justify="space-between" align="center">
                    <Box>
                      <Text size="sm" fw={500}>
                        All Notifications
                      </Text>
                      <Text size="xs" c="dimmed">
                        Receive all types of notifications
                      </Text>
                    </Box>
                    <Switch size="sm" defaultChecked />
                  </Group>
                  <Divider />
                  <Group justify="space-between" align="center">
                    <Box>
                      <Text size="sm" fw={500}>
                        Likes & Comments
                      </Text>
                      <Text size="xs" c="dimmed">
                        Get notified when someone likes or comments on your
                        posts
                      </Text>
                    </Box>
                    <Switch size="sm" defaultChecked />
                  </Group>
                  <Divider />
                  <Group justify="space-between" align="center">
                    <Box>
                      <Text size="sm" fw={500}>
                        Follows
                      </Text>
                      <Text size="xs" c="dimmed">
                        Get notified when someone follows you
                      </Text>
                    </Box>
                    <Switch size="sm" defaultChecked />
                  </Group>
                  <Divider />
                  <Group justify="space-between" align="center">
                    <Box>
                      <Text size="sm" fw={500}>
                        Mentions
                      </Text>
                      <Text size="xs" c="dimmed">
                        Get notified when someone mentions you
                      </Text>
                    </Box>
                    <Switch size="sm" defaultChecked />
                  </Group>
                </Stack>
              </Card>

              <Card p="sm">
                <Stack gap="sm">
                  <Title order={4} size="h5" fw={600}>
                    Email Notifications
                  </Title>
                  <Group justify="space-between" align="center">
                    <Box>
                      <Text size="sm" fw={500}>
                        Weekly Summary
                      </Text>
                      <Text size="xs" c="dimmed">
                        Receive a weekly summary of your activity
                      </Text>
                    </Box>
                    <Switch size="sm" />
                  </Group>
                  <Divider />
                  <Group justify="space-between" align="center">
                    <Box>
                      <Text size="sm" fw={500}>
                        Security Alerts
                      </Text>
                      <Text size="xs" c="dimmed">
                        Get notified about important security events
                      </Text>
                    </Box>
                    <Switch size="sm" defaultChecked />
                  </Group>
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="privacy" pt="xl">
            <Stack gap="sm">
              <Card p="sm">
                <Stack gap="sm">
                  <Title order={4} size="h5" fw={600}>
                    Profile Visibility
                  </Title>
                  <Group justify="space-between" align="center">
                    <Box>
                      <Text size="sm" fw={500}>
                        Public Profile
                      </Text>
                      <Text size="xs" c="dimmed">
                        Allow others to view your profile and posts
                      </Text>
                    </Box>
                    <Switch size="sm" defaultChecked />
                  </Group>
                  <Divider />
                  <Group justify="space-between" align="center">
                    <Box>
                      <Text size="sm" fw={500}>
                        Show Online Status
                      </Text>
                      <Text size="xs" c="dimmed">
                        Let others see when you're online
                      </Text>
                    </Box>
                    <Switch size="sm" defaultChecked />
                  </Group>
                </Stack>
              </Card>

              <Card p="sm">
                <Stack gap="sm">
                  <Title order={4} size="h5" fw={600}>
                    Data & Privacy
                  </Title>
                  <Group justify="space-between" align="center">
                    <Box>
                      <Text size="sm" fw={500}>
                        Data Collection
                      </Text>
                      <Text size="xs" c="dimmed">
                        Allow us to collect usage data to improve the app
                      </Text>
                    </Box>
                    <Switch size="sm" defaultChecked />
                  </Group>
                  <Divider />
                  <Group justify="space-between" align="center">
                    <Box>
                      <Text size="sm" fw={500}>
                        Personalized Ads
                      </Text>
                      <Text size="xs" c="dimmed">
                        Show personalized advertisements based on your interests
                      </Text>
                    </Box>
                    <Switch size="sm" />
                  </Group>
                </Stack>
              </Card>

              <Card p="sm">
                <Stack gap="sm">
                  <Title order={4} size="h5" fw={600}>
                    Account Actions
                  </Title>
                  <Group justify="space-between" align="center">
                    <Box>
                      <Text size="sm" fw={500}>
                        Download Data
                      </Text>
                      <Text size="xs" c="dimmed">
                        Download a copy of your data
                      </Text>
                    </Box>
                    <Button variant="light" size="sm">
                      Download
                    </Button>
                  </Group>
                  <Divider />
                  <Group justify="space-between" align="center">
                    <Box>
                      <Text size="sm" fw={500} c="red">
                        Delete Account
                      </Text>
                      <Text size="xs" c="dimmed">
                        Permanently delete your account and all data
                      </Text>
                    </Box>
                    <Button variant="light" color="red" size="sm">
                      Delete
                    </Button>
                  </Group>
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={
          <Group gap="sm">
            <IconEdit size={20} />
            <Text fw={600} size="lg">
              Edit Profile
            </Text>
          </Group>
        }
        size="lg"
        radius="xl"
        p="sm"
        styles={{
          content: {
            backgroundColor: "var(--mantine-color-body)",
          },
          header: {
            backgroundColor: "var(--mantine-color-body)",
          },
          title: {
            color: "var(--mantine-color-text)",
          },
        }}
      >
        <form onSubmit={editForm.onSubmit(handleSaveProfile)}>
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="First Name"
                placeholder="Enter first name"
                size="sm"
                radius="md"
                styles={{
                  label: {
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    color: "var(--mantine-color-text)",
                  },
                  input: {
                    backgroundColor: "var(--mantine-color-body)",
                    borderColor: "var(--mantine-color-gray-4)",
                    color: "var(--mantine-color-text)",
                    "&:focus": {
                      borderColor: "var(--mantine-color-blue-6)",
                      boxShadow: "0 0 0 2px var(--mantine-color-blue-1)",
                    },
                    "&::placeholder": {
                      color: "var(--mantine-color-dimmed)",
                    },
                  },
                }}
                {...editForm.getInputProps("firstName")}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Last Name"
                placeholder="Enter last name"
                size="sm"
                radius="md"
                styles={{
                  label: {
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    color: "var(--mantine-color-text)",
                  },
                  input: {
                    backgroundColor: "var(--mantine-color-body)",
                    borderColor: "var(--mantine-color-gray-4)",
                    color: "var(--mantine-color-text)",
                    "&:focus": {
                      borderColor: "var(--mantine-color-blue-6)",
                      boxShadow: "0 0 0 2px var(--mantine-color-blue-1)",
                    },
                    "&::placeholder": {
                      color: "var(--mantine-color-dimmed)",
                    },
                  },
                }}
                {...editForm.getInputProps("lastName")}
              />
            </Grid.Col>
          </Grid>

          <TextInput
            label="Username"
            placeholder="Enter username"
            size="sm"
            radius="md"
            leftSection={
              <Text size="sm" c="dimmed">
                @
              </Text>
            }
            styles={{
              label: {
                fontWeight: 600,
                marginBottom: "0.5rem",
                color: "var(--mantine-color-text)",
              },
              input: {
                backgroundColor: "var(--mantine-color-body)",
                borderColor: "var(--mantine-color-gray-4)",
                color: "var(--mantine-color-text)",
                "&:focus": {
                  borderColor: "var(--mantine-color-blue-6)",
                  boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.1)",
                },
                "&::placeholder": {
                  color: "var(--mantine-color-dimmed)",
                },
              },
            }}
            {...editForm.getInputProps("username")}
          />

          <TextInput
            label="Email"
            placeholder="Enter email"
            type="email"
            size="sm"
            radius="md"
            styles={{
              label: {
                fontWeight: 600,
                marginBottom: "0.5rem",
                color: "var(--mantine-color-text)",
              },
              input: {
                backgroundColor: "var(--mantine-color-body)",
                borderColor: "var(--mantine-color-gray-4)",
                color: "var(--mantine-color-text)",
                "&:focus": {
                  borderColor: "var(--mantine-color-blue-6)",
                  boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.1)",
                },
                "&::placeholder": {
                  color: "var(--mantine-color-dimmed)",
                },
              },
            }}
            {...editForm.getInputProps("email")}
          />

          <Textarea
            label="Bio"
            placeholder="Tell us about yourself"
            minRows={3}
            size="sm"
            radius="md"
            styles={{
              label: {
                fontWeight: 600,
                marginBottom: "0.5rem",
                color: "var(--mantine-color-text)",
              },
              input: {
                backgroundColor: "var(--mantine-color-body)",
                borderColor: "var(--mantine-color-gray-4)",
                color: "var(--mantine-color-text)",
                "&:focus": {
                  borderColor: "var(--mantine-color-blue-6)",
                  boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.1)",
                },
                "&::placeholder": {
                  color: "var(--mantine-color-dimmed)",
                },
              },
            }}
            {...editForm.getInputProps("bio")}
            value={editForm.getValues().bio || ""}
            onChange={(e) =>
              editForm.setFieldValue("bio", e.target.value || null)
            }
          />

          <Divider label="Social Media Links" labelPosition="center" my="md" />

          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="WhatsApp"
                placeholder="Enter WhatsApp number"
                leftSection={<IconBrandWhatsapp size={16} />}
                size="sm"
                radius="md"
                styles={{
                  label: {
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    color: "var(--mantine-color-text)",
                  },
                  input: {
                    backgroundColor: "var(--mantine-color-body)",
                    borderColor: "var(--mantine-color-gray-4)",
                    color: "var(--mantine-color-text)",
                    "&:focus": {
                      borderColor: "var(--mantine-color-blue-6)",
                      boxShadow: "0 0 0 2px var(--mantine-color-blue-1)",
                    },
                    "&::placeholder": {
                      color: "var(--mantine-color-dimmed)",
                    },
                  },
                }}
                {...editForm.getInputProps("whatsapp")}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Twitter Link"
                placeholder="Enter Twitter profile URL"
                leftSection={<IconBrandTwitter size={16} />}
                size="sm"
                radius="md"
                styles={{
                  label: {
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    color: "var(--mantine-color-text)",
                  },
                  input: {
                    backgroundColor: "var(--mantine-color-body)",
                    borderColor: "var(--mantine-color-gray-4)",
                    color: "var(--mantine-color-text)",
                    "&:focus": {
                      borderColor: "var(--mantine-color-blue-6)",
                      boxShadow: "0 0 0 2px var(--mantine-color-blue-1)",
                    },
                    "&::placeholder": {
                      color: "var(--mantine-color-dimmed)",
                    },
                  },
                }}
                {...editForm.getInputProps("twitterLink")}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Instagram Link"
                placeholder="Enter Instagram profile URL"
                leftSection={<IconBrandInstagram size={16} />}
                size="sm"
                radius="md"
                styles={{
                  label: {
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    color: "var(--mantine-color-text)",
                  },
                  input: {
                    backgroundColor: "var(--mantine-color-body)",
                    borderColor: "var(--mantine-color-gray-4)",
                    color: "var(--mantine-color-text)",
                    "&:focus": {
                      borderColor: "var(--mantine-color-blue-6)",
                      boxShadow: "0 0 0 2px var(--mantine-color-blue-1)",
                    },
                    "&::placeholder": {
                      color: "var(--mantine-color-dimmed)",
                    },
                  },
                }}
                {...editForm.getInputProps("instagramLink")}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="TikTok Link"
                placeholder="Enter TikTok profile URL"
                leftSection={<IconBrandTiktok size={16} />}
                size="sm"
                radius="md"
                styles={{
                  label: {
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    color: "var(--mantine-color-text)",
                  },
                  input: {
                    backgroundColor: "var(--mantine-color-body)",
                    borderColor: "var(--mantine-color-gray-4)",
                    color: "var(--mantine-color-text)",
                    "&:focus": {
                      borderColor: "var(--mantine-color-blue-6)",
                      boxShadow: "0 0 0 2px var(--mantine-color-blue-1)",
                    },
                    "&::placeholder": {
                      color: "var(--mantine-color-dimmed)",
                    },
                  },
                }}
                {...editForm.getInputProps("tiktokLink")}
              />
            </Grid.Col>
          </Grid>

          <Group justify="flex-end" mt="xl">
            <Button
              variant="light"
              onClick={() => setEditModalOpen(false)}
              size="sm"
              radius="md"
              styles={{
                root: {
                  color: "var(--mantine-color-text)",
                  backgroundColor: "var(--mantine-color-gray-1)",
                  borderColor: "var(--mantine-color-gray-4)",
                  "&:hover": {
                    backgroundColor: "var(--mantine-color-gray-2)",
                  },
                },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={updateProfileMutation.isPending}
              size="sm"
              radius="md"
              style={{
                background:
                  "linear-gradient(135deg, var(--mantine-color-blue-6), var(--mantine-color-violet-6))",
                border: "none",
              }}
            >
              Save Changes
            </Button>
          </Group>
        </form>
      </Modal>

      {/* Avatar Upload Modal */}
      <Modal
        opened={avatarModalOpen}
        onClose={() => {
          setAvatarModalOpen(false);
          setSelectedAvatarFile(null);
        }}
        title="Update Profile Picture"
        centered
        size="sm"
      >
        <Stack gap="md">
          <FileInput
            label="Select Profile Picture"
            placeholder="Choose an image file"
            accept="image/*"
            value={selectedAvatarFile}
            onChange={handleAvatarFileSelect}
          />

          {selectedAvatarFile && (
            <Box>
              <Text size="sm" fw={500} mb="xs">
                Preview:
              </Text>
              <Image
                src={URL.createObjectURL(selectedAvatarFile)}
                alt="Preview"
                height={100}
                width={100}
                radius="md"
                style={{ objectFit: "cover" }}
              />
            </Box>
          )}

          <Group justify="space-between">
            <Button
              variant="light"
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={handleAvatarDelete}
              loading={deleteAvatar.isPending}
              disabled={!user?.avatar}
            >
              Remove Current
            </Button>

            <Group>
              <Button
                variant="light"
                onClick={() => {
                  setAvatarModalOpen(false);
                  setSelectedAvatarFile(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAvatarUpload}
                loading={uploadAvatar.isPending}
                disabled={!selectedAvatarFile}
              >
                Upload
              </Button>
            </Group>
          </Group>
        </Stack>
      </Modal>

      {/* Background Image Upload Modal */}
      <Modal
        opened={backgroundModalOpen}
        onClose={() => {
          setBackgroundModalOpen(false);
          setSelectedBackgroundFile(null);
        }}
        title="Update Background Image"
        centered
        size="sm"
      >
        <Stack gap="md">
          <FileInput
            label="Select Background Image"
            placeholder="Choose an image file"
            accept="image/*"
            value={selectedBackgroundFile}
            onChange={handleBackgroundFileSelect}
          />

          {selectedBackgroundFile && (
            <Box>
              <Text size="sm" fw={500} mb="xs">
                Preview:
              </Text>
              <Image
                src={URL.createObjectURL(selectedBackgroundFile)}
                alt="Preview"
                height={120}
                width="100%"
                radius="md"
                style={{ objectFit: "cover" }}
              />
            </Box>
          )}

          <Group justify="space-between">
            <Button
              variant="light"
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={handleBackgroundDelete}
              loading={deleteBackgroundImage.isPending}
              disabled={!user?.backgroundImage}
            >
              Remove Current
            </Button>

            <Group>
              <Button
                variant="light"
                onClick={() => {
                  setBackgroundModalOpen(false);
                  setSelectedBackgroundFile(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBackgroundUpload}
                loading={uploadBackgroundImage.isPending}
                disabled={!selectedBackgroundFile}
              >
                Upload
              </Button>
            </Group>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
