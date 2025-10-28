import {
  Avatar,
  Box,
  Button,
  Card,
  Container,
  Group,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
  Paper,
  Transition,
  Divider,
  Switch,
  Tabs,
  Alert,
  ThemeIcon,
  FileInput,
  SimpleGrid,
  ColorInput,
  Slider,
  SegmentedControl,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconCamera,
  IconCheck,
  IconUser,
  IconLock,
  IconBell,
  IconPalette,
  IconShield,
  IconLogout,
  IconUpload,
  IconX,
  IconDeviceFloppy,
  IconSettings,
  IconMail,
  IconPhone,
  IconBrandTwitter,
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandWhatsapp,
  IconLink,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useUpdateProfile } from "../../hooks/useUser";
import {
  useUploadAvatar,
} from "../../hooks/useMedia";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  bio: string;
  twitterLink: string;
  instagramLink: string;
  tiktokLink: string;
  whatsapp: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  messageNotifications: boolean;
  followNotifications: boolean;
  likeNotifications: boolean;
  commentNotifications: boolean;
}

export function SettingsPage() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [mounted, setMounted] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();

  useEffect(() => {
    setMounted(true);
  }, []);

  const profileForm = useForm<ProfileFormData>({
    initialValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      username: user?.username || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      bio: user?.bio || "",
      twitterLink: user?.twitterLink || "",
      instagramLink: user?.instagramLink || "",
      tiktokLink: user?.tiktokLink || "",
      whatsapp: user?.whatsapp || "",
    },
    validate: {
      firstName: (value) =>
        value.length < 2 ? "First name must be at least 2 characters" : null,
      lastName: (value) =>
        value.length < 2 ? "Last name must be at least 2 characters" : null,
      username: (value) =>
        value.length < 3 ? "Username must be at least 3 characters" : null,
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      phoneNumber: (value) =>
        value && !/^\+?[\d\s-()]+$/.test(value) ? "Invalid phone number" : null,
      bio: (value) =>
        value.length > 500 ? "Bio must be less than 500 characters" : null,
    },
  });


  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      emailNotifications: true,
      pushNotifications: true,
      messageNotifications: true,
      followNotifications: true,
      likeNotifications: false,
      commentNotifications: true,
    });

  const handleProfileSubmit = async (values: ProfileFormData) => {
    try {
      await updateProfile.mutateAsync(values);
      notifications.show({
        title: "Success",
        message: "Profile updated successfully",
        color: "green",
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to update profile",
        color: "red",
        icon: <IconX size={16} />,
      });
    }
  };

  const handleAvatarUpload = async (file: File | null) => {
    if (!file) return;

    try {
      await uploadAvatar.mutateAsync(file);
      notifications.show({
        title: "Success",
        message: "Avatar updated successfully",
        color: "green",
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to update avatar",
        color: "red",
        icon: <IconX size={16} />,
      });
    }
  };

  const handleLogout = () => {
    logout();
    notifications.show({
      title: "Logged out",
      message: "You have been logged out successfully",
      color: "blue",
      icon: <IconLogout size={16} />,
    });
  };

  if (!user) {
    return null;
  }

  return (
    <Transition
      mounted={mounted}
      transition="fade"
      duration={300}
      timingFunction="ease-out"
    >
      {(styles) => (
        <Container size="lg" py="xl" style={styles}>
          <Stack gap="xl">
            <Paper
              radius="xl"
              p="xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Group>
                <ThemeIcon
                  size={60}
                  radius="xl"
                  variant="gradient"
                  gradient={{ from: "blue", to: "teal" }}
                >
                  <IconSettings size={30} />
                </ThemeIcon>
                <Stack gap={4}>
                  <Title order={2}>Settings</Title>
                  <Text c="dimmed">Manage your account and preferences</Text>
                </Stack>
              </Group>
            </Paper>

            <Paper
              radius="xl"
              p="md"
              style={{
                background:
                  "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))",
                border: "1px solid rgba(99, 102, 241, 0.2)",
              }}
            >
              <Tabs value={activeTab} onChange={(value) => setActiveTab(value || "profile")} variant="pills" radius="xl">
                <Tabs.List grow>
                  <Tabs.Tab value="profile" leftSection={<IconUser size={16} />} style={{ borderRadius: "12px", fontWeight: 500 }}>
                    Profile
                  </Tabs.Tab>
                  <Tabs.Tab value="security" leftSection={<IconLock size={16} />} style={{ borderRadius: "12px", fontWeight: 500 }}>
                    Security
                  </Tabs.Tab>
                  <Tabs.Tab value="appearance" leftSection={<IconPalette size={16} />} style={{ borderRadius: "12px", fontWeight: 500 }}>
                    Appearance
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="profile" pt="xl">
                  <form onSubmit={profileForm.onSubmit(handleProfileSubmit)}>
                    <Stack gap="xl">
                      <Card radius="lg" p="lg" withBorder>
                        <Stack gap="md">
                          <Group>
                            <IconCamera size={20} />
                            <Text fw={600}>Profile Picture</Text>
                          </Group>

                          <Group>
                            <Avatar
                              src={user.avatar}
                              size={80}
                              radius="xl"
                              style={{
                                border: "3px solid var(--mantine-color-blue-1)",
                              }}
                            >
                              {user.firstName?.[0]}
                              {user.lastName?.[0]}
                            </Avatar>

                            <Stack gap="xs">
                              <FileInput
                                placeholder="Choose new avatar"
                                accept="image/*"
                                value={avatarFile}
                                onChange={(file) => {
                                  setAvatarFile(file);
                                  if (file) handleAvatarUpload(file);
                                }}
                                leftSection={<IconUpload size={16} />}
                                clearable
                                radius="md"
                              />
                              <Text size="xs" c="dimmed">
                                JPG, PNG or GIF. Max size 5MB.
                              </Text>
                            </Stack>
                          </Group>
                        </Stack>
                      </Card>

                      <Card radius="lg" p="lg" withBorder>
                        <Stack gap="md">
                          <Group>
                            <IconUser size={20} />
                            <Text fw={600}>Basic Information</Text>
                          </Group>

                          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                            <TextInput
                              label="First Name"
                              placeholder="Enter your first name"
                              leftSection={<IconUser size={16} />}
                              radius="md"
                              {...profileForm.getInputProps("firstName")}
                            />

                            <TextInput
                              label="Last Name"
                              placeholder="Enter your last name"
                              leftSection={<IconUser size={16} />}
                              radius="md"
                              {...profileForm.getInputProps("lastName")}
                            />
                          </SimpleGrid>

                          <TextInput
                            label="Username"
                            placeholder="Enter your username"
                            leftSection={
                              <Text size="sm" c="dimmed">
                                @
                              </Text>
                            }
                            radius="md"
                            {...profileForm.getInputProps("username")}
                          />

                          <Textarea
                            label="Bio"
                            placeholder="Tell us about yourself..."
                            minRows={3}
                            maxRows={5}
                            radius="md"
                            {...profileForm.getInputProps("bio")}
                          />
                        </Stack>
                      </Card>

                      <Card radius="lg" p="lg" withBorder>
                        <Stack gap="md">
                          <Group>
                            <IconMail size={20} />
                            <Text fw={600}>Contact Information</Text>
                          </Group>

                          <TextInput
                            label="Email"
                            placeholder="Enter your email"
                            leftSection={<IconMail size={16} />}
                            radius="md"
                            {...profileForm.getInputProps("email")}
                          />

                          <TextInput
                            label="Phone Number"
                            placeholder="Enter your phone number"
                            leftSection={<IconPhone size={16} />}
                            radius="md"
                            {...profileForm.getInputProps("phoneNumber")}
                          />
                        </Stack>
                      </Card>

                      <Card radius="lg" p="lg" withBorder>
                        <Stack gap="md">
                          <Group>
                            <IconLink size={20} />
                            <Text fw={600}>Social Links</Text>
                          </Group>

                          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                            <TextInput
                              label="Twitter"
                              placeholder="https://twitter.com/username"
                              leftSection={<IconBrandTwitter size={16} />}
                              radius="md"
                              {...profileForm.getInputProps("twitterLink")}
                            />

                            <TextInput
                              label="Instagram"
                              placeholder="https://instagram.com/username"
                              leftSection={<IconBrandInstagram size={16} />}
                              radius="md"
                              {...profileForm.getInputProps("instagramLink")}
                            />

                            <TextInput
                              label="TikTok"
                              placeholder="https://tiktok.com/@username"
                              leftSection={<IconBrandTiktok size={16} />}
                              radius="md"
                              {...profileForm.getInputProps("tiktokLink")}
                            />

                            <TextInput
                              label="WhatsApp"
                              placeholder="+1234567890"
                              leftSection={<IconBrandWhatsapp size={16} />}
                              radius="md"
                              {...profileForm.getInputProps("whatsapp")}
                            />
                          </SimpleGrid>
                        </Stack>
                      </Card>

                      <Group justify="flex-end">
                        <Button
                          type="submit"
                          leftSection={<IconDeviceFloppy size={16} />}
                          loading={updateProfile.isPending}
                          radius="xl"
                          size="md"
                        >
                          Save Changes
                        </Button>
                      </Group>
                    </Stack>
                  </form>
                </Tabs.Panel>

                <Tabs.Panel value="security" pt="xl">
                  <Stack gap="xl">
                    <Alert
                      icon={<IconInfoCircle size={16} />}
                      title="Security Information"
                      color="blue"
                      radius="md"
                    >
                      Keep your account secure by using a strong password and
                      enabling two-factor authentication.
                    </Alert>

                    <Card radius="lg" p="lg" withBorder>
                      <Stack gap="md">
                        <Group>
                          <IconShield size={20} />
                          <Text fw={600}>Account Actions</Text>
                        </Group>

                        <Group justify="space-between">
                          <Stack gap={4}>
                            <Text fw={500}>Two-Factor Authentication</Text>
                            <Text size="sm">
                              Add an extra layer of security to your account
                            </Text>
                          </Stack>
                          <Button variant="light" radius="xl">
                            Enable 2FA
                          </Button>
                        </Group>

                        <Divider />

                        <Group justify="space-between">
                          <Stack gap={4}>
                            <Text fw={500} c="red">
                              Delete Account
                            </Text>
                            <Text size="sm">
                              Permanently delete your account and all data
                            </Text>
                          </Stack>
                          <Button variant="light" color="red" radius="xl">
                            Delete Account
                          </Button>
                        </Group>
                      </Stack>
                    </Card>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="notifications" pt="xl">
                  <Stack gap="xl">
                    <Card radius="lg" p="lg" withBorder>
                      <Stack gap="md">
                        <Group>
                          <IconBell size={20} />
                          <Text fw={600}>Notification Preferences</Text>
                        </Group>

                        <Stack gap="lg">
                          <Group justify="space-between">
                            <Stack gap={4}>
                              <Text fw={500}>Email Notifications</Text>
                              <Text size="sm">
                                Receive notifications via email
                              </Text>
                            </Stack>
                            <Switch
                              checked={notificationSettings.emailNotifications}
                              onChange={(event) =>
                                setNotificationSettings((prev) => ({
                                  ...prev,
                                  emailNotifications:
                                    event.currentTarget.checked,
                                }))
                              }
                              size="md"
                            />
                          </Group>

                          <Group justify="space-between">
                            <Stack gap={4}>
                              <Text fw={500}>Push Notifications</Text>
                              <Text size="sm">
                                Receive push notifications on your device
                              </Text>
                            </Stack>
                            <Switch
                              checked={notificationSettings.pushNotifications}
                              onChange={(event) =>
                                setNotificationSettings((prev) => ({
                                  ...prev,
                                  pushNotifications:
                                    event.currentTarget.checked,
                                }))
                              }
                              size="md"
                            />
                          </Group>

                          <Divider />

                          <Text fw={600} size="sm" tt="uppercase">
                            Activity Notifications
                          </Text>

                          <Group justify="space-between">
                            <Stack gap={4}>
                              <Text fw={500}>Messages</Text>
                              <Text size="sm">
                                New messages and chat notifications
                              </Text>
                            </Stack>
                            <Switch
                              checked={
                                notificationSettings.messageNotifications
                              }
                              onChange={(event) =>
                                setNotificationSettings((prev) => ({
                                  ...prev,
                                  messageNotifications:
                                    event.currentTarget.checked,
                                }))
                              }
                              size="md"
                            />
                          </Group>

                          <Group justify="space-between">
                            <Stack gap={4}>
                              <Text fw={500}>Follows</Text>
                              <Text size="sm">
                                When someone follows you
                              </Text>
                            </Stack>
                            <Switch
                              checked={notificationSettings.followNotifications}
                              onChange={(event) =>
                                setNotificationSettings((prev) => ({
                                  ...prev,
                                  followNotifications:
                                    event.currentTarget.checked,
                                }))
                              }
                              size="md"
                            />
                          </Group>

                          <Group justify="space-between">
                            <Stack gap={4}>
                              <Text fw={500}>Likes</Text>
                              <Text size="sm">
                                When someone likes your posts
                              </Text>
                            </Stack>
                            <Switch
                              checked={notificationSettings.likeNotifications}
                              onChange={(event) =>
                                setNotificationSettings((prev) => ({
                                  ...prev,
                                  likeNotifications:
                                    event.currentTarget.checked,
                                }))
                              }
                              size="md"
                            />
                          </Group>

                          <Group justify="space-between">
                            <Stack gap={4}>
                              <Text fw={500}>Comments</Text>
                              <Text size="sm">
                                When someone comments on your posts
                              </Text>
                            </Stack>
                            <Switch
                              checked={
                                notificationSettings.commentNotifications
                              }
                              onChange={(event) =>
                                setNotificationSettings((prev) => ({
                                  ...prev,
                                  commentNotifications:
                                    event.currentTarget.checked,
                                }))
                              }
                              size="md"
                            />
                          </Group>
                        </Stack>
                      </Stack>
                    </Card>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="appearance" pt="xl">
                  <Stack gap="xl">
                    <Card radius="lg" p="lg" withBorder>
                      <Stack gap="md">
                        <Group>
                          <IconPalette size={20} />
                          <Text fw={600}>Theme Preferences</Text>
                        </Group>

                        <Stack gap="lg">
                          <Group justify="space-between">
                            <Stack gap={4}>
                              <Text fw={500}>Color Scheme</Text>
                              <Text size="sm">
                                Choose your preferred color scheme
                              </Text>
                            </Stack>
                            <SegmentedControl
                              data={[
                                { label: "Light", value: "light" },
                                { label: "Dark", value: "dark" },
                                { label: "Auto", value: "auto" },
                              ]}
                              defaultValue="light"
                              radius="xl"
                            />
                          </Group>

                          <Group justify="space-between">
                            <Stack gap={4}>
                              <Text fw={500}>Primary Color</Text>
                              <Text size="sm">
                                Customize your accent color
                              </Text>
                            </Stack>
                            <ColorInput
                              placeholder="Pick color"
                              defaultValue="#339af0"
                              radius="md"
                              w={120}
                            />
                          </Group>

                          <Group justify="space-between">
                            <Stack gap={4}>
                              <Text fw={500}>Font Size</Text>
                              <Text size="sm">
                                Adjust text size for better readability
                              </Text>
                            </Stack>
                            <Box w={200}>
                              <Slider
                                defaultValue={16}
                                min={12}
                                max={20}
                                step={1}
                                marks={[
                                  { value: 12, label: "Small" },
                                  { value: 16, label: "Medium" },
                                  { value: 20, label: "Large" },
                                ]}
                              />
                            </Box>
                          </Group>
                        </Stack>
                      </Stack>
                    </Card>
                  </Stack>
                </Tabs.Panel>
              </Tabs>
            </Paper>

            <Paper
              radius="xl"
              p="xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255, 0, 0, 0.05), rgba(255, 0, 0, 0.1))",
              }}
            >
              <Group justify="space-between">
                <Stack gap={4}>
                  <Text fw={600}>
                    Sign Out
                  </Text>
                  <Text size="sm">
                    Sign out of your account on this device
                  </Text>
                </Stack>
                <Button
                  leftSection={<IconLogout size={16} />}
                  variant="light"
                  radius="xl"
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </Group>
            </Paper>
          </Stack>
        </Container>
      )}
    </Transition>
  );
}
