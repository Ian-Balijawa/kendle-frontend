import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,

  Collapse,
  Group,
  Image,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
  Transition,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import {
  IconCalendar,
  IconCalendarEvent,
  IconHash,
  IconLocation,
  IconMapPin,
  IconPhoto,
  IconSend,
  IconUser,
  IconVideo,
  IconX,
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useCreatePost } from "../../hooks/usePosts";
import { useFollowing } from "../../hooks/useFollow";
import { CreatePostData, MediaInput, TagInput, MentionInput } from "../../types/post";
import { useAuthStore } from "../../stores/authStore";

interface CreatePostProps {
  opened: boolean;
  onClose: () => void;
}

type PostType = "text" | "image" | "video" | "poll" | "event" | "repost" | "quote" | "article" | "story";

export function CreatePost({ opened, onClose }: CreatePostProps) {
  const { user } = useAuthStore();
  const createPostMutation = useCreatePost();
  const { data: followingData } = useFollowing(user?.id || "", 1, 100);

  // Debug log for following data
  if (followingData) {
    console.log("Following data:", followingData);
  }

  // Main form state
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<PostType>("text");
  const [media, setMedia] = useState<File[]>([]);
  const [location, setLocation] = useState<string>("");
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [tags, setTags] = useState<TagInput[]>([]);
  const [mentions, setMentions] = useState<MentionInput[]>([]);
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);

  // Post settings
  const [isPublic, setIsPublic] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [allowLikes, setAllowLikes] = useState(true);
  const [allowShares, setAllowShares] = useState(true);
  const [allowBookmarks, setAllowBookmarks] = useState(true);
  const [allowReactions, setAllowReactions] = useState(true);

  // Poll state
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [pollEndDate, setPollEndDate] = useState<Date | null>(null);

  // Event state
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventStartDate, setEventStartDate] = useState<Date | null>(null);
  const [eventEndDate, setEventEndDate] = useState<Date | null>(null);
  const [eventLocation, setEventLocation] = useState("");
  const [eventCapacity, setEventCapacity] = useState<number | undefined>();

  // UI state
  const [tagInput, setTagInput] = useState("");
  const [tagDescription, setTagDescription] = useState("");
  const [mentionInput, setMentionInput] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSubmitting = createPostMutation.isPending;
  const followingUsers = followingData?.following || [];

  // Geolocation function
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocationCoords({ lat: latitude, lng: longitude });
        setLocation(`${longitude},${latitude}`);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to get your location. Please try again.");
        setIsGettingLocation(false);
      }
    );
  };

  // Media handling
  const handleMediaUpload = (files: File[] | null) => {
    if (!files) return;

    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/") || file.type.startsWith("video/");
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit (reduced from 50MB)

      if (!isValidType) {
        console.error("Invalid file type:", file.type);
        return false;
      }

      if (!isValidSize) {
        console.error("File too large:", file.size, "bytes. Maximum allowed: 10MB");
        alert(`File "${file.name}" is too large. Maximum file size is 10MB.`);
        return false;
      }

      return true;
    });

    setMedia((prev) => [...prev, ...validFiles].slice(0, 4)); // Max 4 files
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  // Tag handling
  const handleTagAdd = () => {
    if (tagInput.trim() && !tags.some(tag => tag.name === tagInput.trim())) {
      setTags((prev) => [...prev, { name: tagInput.trim(), description: tagDescription.trim() || undefined }]);
      setTagInput("");
      setTagDescription("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag.name !== tagToRemove));
  };

  // Mention handling
  const handleMentionAdd = (userId: string) => {
    if (!mentions.some(mention => mention.mentionedUserId === userId)) {
      setMentions((prev) => [...prev, { mentionedUserId: userId }]);
    }
    setMentionInput("");
    setShowMentionPicker(false);
  };

  const removeMention = (userIdToRemove: string) => {
    setMentions((prev) => prev.filter((mention) => mention.mentionedUserId !== userIdToRemove));
  };

  // Poll handling
  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions((prev) => [...prev, ""]);
    }
  };

  const updatePollOption = (index: number, value: string) => {
    setPollOptions((prev) => prev.map((option, i) => i === index ? value : option));
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Form submission
  const handleSubmit = async () => {
    if (!content.trim()) {
      return;
    }

    // Prepare media data
    const mediaData: MediaInput[] = media.map((file) => ({
      type: file.type.startsWith("image/") ? "image" : "video",
      url: URL.createObjectURL(file), // In real app, upload to server first
      fileSize: file.size,
      format: file.type.split("/")[1],
    }));

    // Create the post data
    const postData: CreatePostData = {
      content: content.trim(),
      type: postType,
      isPublic,
      allowComments,
      allowLikes,
      allowShares,
      allowBookmarks,
      allowReactions,
      media: mediaData.length > 0 ? mediaData : undefined,
      location: location || undefined,
      tags: tags.length > 0 ? tags : undefined,
      mentions: mentions.length > 0 ? mentions : undefined,
      scheduledAt: scheduledAt?.toISOString(),
    };

    // Add poll data if post type is poll
    if (postType === "poll" && pollQuestion.trim()) {
      postData.pollQuestion = pollQuestion.trim();
      postData.pollOptions = pollOptions.filter(option => option.trim());
      postData.pollEndDate = pollEndDate?.toISOString();
    }

    // Add event data if post type is event
    if (postType === "event" && eventTitle.trim()) {
      postData.eventTitle = eventTitle.trim();
      postData.eventDescription = eventDescription.trim();
      postData.eventStartDate = eventStartDate?.toISOString();
      postData.eventEndDate = eventEndDate?.toISOString();
      postData.eventLocation = eventLocation.trim();
      postData.eventCapacity = eventCapacity;
    }

    createPostMutation.mutate(postData, {
      onSuccess: () => {
        // Reset form
        setContent("");
        setPostType("text");
        setMedia([]);
        setLocation("");
        setLocationCoords(null);
        setTags([]);
        setMentions([]);
        setScheduledAt(null);
        setPollQuestion("");
        setPollOptions(["", ""]);
        setPollEndDate(null);
        setEventTitle("");
        setEventDescription("");
        setEventStartDate(null);
        setEventEndDate(null);
        setEventLocation("");
        setEventCapacity(undefined);
        setTagInput("");
        setTagDescription("");
        setMentionInput("");
        setShowAdvanced(false);
        setShowMentionPicker(false);

        // Close modal
        onClose();
      },
      onError: (error) => {
        console.error("Failed to create post:", error);
      },
    });
  };

  const handleClose = () => {
    if (content.trim() || media.length > 0) {
      if (window.confirm("Are you sure you want to discard this post?")) {
        // Reset all state
        setContent("");
        setPostType("text");
        setMedia([]);
        setLocation("");
        setLocationCoords(null);
        setTags([]);
        setMentions([]);
        setScheduledAt(null);
        setPollQuestion("");
        setPollOptions(["", ""]);
        setPollEndDate(null);
        setEventTitle("");
        setEventDescription("");
        setEventStartDate(null);
        setEventEndDate(null);
        setEventLocation("");
        setEventCapacity(undefined);
        setTagInput("");
        setTagDescription("");
        setMentionInput("");
        setShowAdvanced(false);
        setShowMentionPicker(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  const canSubmit = content.trim() &&
    (postType !== "poll" || (pollQuestion.trim() && pollOptions.filter(opt => opt.trim()).length >= 2)) &&
    (postType !== "event" || eventTitle.trim());

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Create Post"
      size="lg"
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Stack gap="md">
        {/* Author Header */}
        <Group gap="sm">
          <Avatar
            src={user?.avatar}
            alt={user?.firstName || "User"}
            size={40}
            radius="xl"
          >
            {user?.firstName?.charAt(0) || "U"}
          </Avatar>
          <Box>
            <Text fw={500} size="sm">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text c="dimmed" size="xs">
              @{user?.username || user?.phoneNumber}
            </Text>
          </Box>
        </Group>

        {/* Post Type Selector */}
        <Select
          label="Post Type"
          placeholder="Select post type"
          value={postType}
          onChange={(value) => setPostType(value as PostType)}
          data={[
            { value: "text", label: "Text Post" },
            { value: "image", label: "Image Post" },
            { value: "video", label: "Video Post" },
            { value: "poll", label: "Poll" },
            { value: "event", label: "Event" },
            { value: "repost", label: "Repost" },
            { value: "quote", label: "Quote" },
            { value: "article", label: "Article" },
            { value: "story", label: "Story" },
          ]}
        />

        {/* Main Content */}
        <Textarea
          placeholder="What's on your mind? Use Enter for new lines..."
          value={content}
          onChange={(e) => setContent(e.currentTarget.value)}
          minRows={3}
          maxRows={8}
          autosize
          styles={{
            input: {
              border: "none",
              fontSize: "16px",
              padding: 0,
              lineHeight: "1.6",
            },
          }}
        />

        {/* Poll Section */}
        {postType === "poll" && (
          <Box>
            <Stack gap="md">
              <Title order={5}>Create Poll</Title>
              <TextInput
                placeholder="What's your poll question?"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.currentTarget.value)}
                leftSection={<IconHash size={16} />}
              />

              <Stack gap="sm">
                <Text size="sm" fw={500}>Poll Options</Text>
                {pollOptions.map((option, index) => (
                  <Group key={index} gap="sm">
                    <TextInput
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updatePollOption(index, e.currentTarget.value)}
                      style={{ flex: 1 }}
                    />
                    {pollOptions.length > 2 && (
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => removePollOption(index)}
                      >
                        <IconX size={14} />
                      </ActionIcon>
                    )}
                  </Group>
                ))}
                {pollOptions.length < 6 && (
                  <Button
                    variant="light"
                    size="sm"
                    onClick={addPollOption}
                    leftSection={<IconHash size={14} />}
                  >
                    Add Option
                  </Button>
                )}
              </Stack>

              <DateTimePicker
                label="Poll End Date"
                placeholder="When should the poll end?"
                value={pollEndDate}
                onChange={setPollEndDate}
                minDate={new Date()}
                leftSection={<IconCalendar size={16} />}
              />
            </Stack>
          </Box>
        )}

        {/* Event Section */}
        {postType === "event" && (
          <Box>
            <Stack gap="md">
              <Title order={5}>Create Event</Title>
              <TextInput
                placeholder="Event title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.currentTarget.value)}
                leftSection={<IconCalendarEvent size={16} />}
              />

              <Textarea
                placeholder="Event description"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.currentTarget.value)}
                minRows={3}
                autosize
              />

              <Group grow>
                <DateTimePicker
                  label="Start Date"
                  placeholder="When does it start?"
                  value={eventStartDate}
                  onChange={setEventStartDate}
                  minDate={new Date()}
                />
                <DateTimePicker
                  label="End Date"
                  placeholder="When does it end?"
                  value={eventEndDate}
                  onChange={setEventEndDate}
                  minDate={eventStartDate || new Date()}
                />
              </Group>

              <Group grow>
                <TextInput
                  placeholder="Event location"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.currentTarget.value)}
                  leftSection={<IconMapPin size={16} />}
                />
                <NumberInput
                  placeholder="Capacity"
                  value={eventCapacity}
                  onChange={(value) => setEventCapacity(typeof value === 'number' ? value : undefined)}
                  min={1}
                  max={10000}
                />
              </Group>
            </Stack>
          </Box>
        )}

        {/* Media Preview */}
        {media.length > 0 && (
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Media ({media.length}/4)
            </Text>
            <Group gap="sm">
              {media.map((file, index) => (
                <Box key={index} style={{ position: "relative" }}>
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    width={100}
                    height={100}
                    style={{ objectFit: "cover" }}
                    radius="md"
                  />
                  <ActionIcon
                    size="xs"
                    color="red"
                    variant="filled"
                    style={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                    }}
                    onClick={() => removeMedia(index)}
                  >
                    <IconX size={12} />
                  </ActionIcon>
                </Box>
              ))}
            </Group>
          </Stack>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <Group gap="xs">
            {tags.map((tag) => (
              <Badge
                key={tag.name}
                variant="light"
                color="blue"
                rightSection={
                  <ActionIcon
                    size="xs"
                    color="blue"
                    radius="xl"
                    variant="transparent"
                    onClick={() => removeTag(tag.name)}
                  >
                    <IconX size={10} />
                  </ActionIcon>
                }
              >
                #{tag.name}
              </Badge>
            ))}
          </Group>
        )}

        {/* Mentions */}
        {mentions.length > 0 && (
          <Group gap="xs">
            {mentions.map((mention) => {
              const user = followingUsers.find((u: any) => u.id === mention.mentionedUserId);
              return (
                <Badge
                  key={mention.mentionedUserId}
                  variant="light"
                  color="green"
                  rightSection={
                    <ActionIcon
                      size="xs"
                      color="green"
                      radius="xl"
                      variant="transparent"
                      onClick={() => removeMention(mention.mentionedUserId)}
                    >
                      <IconX size={10} />
                    </ActionIcon>
                  }
                >
                  @{(user as any)?.username || (user as any)?.firstName}
                </Badge>
              );
            })}
          </Group>
        )}

        {/* Location */}
        {location && (
          <Group gap="xs">
            <IconMapPin size={16} color="var(--mantine-color-blue-6)" />
            <Text size="sm" c="blue.6">
              {locationCoords ? "Current location" : location}
            </Text>
            <ActionIcon
              size="xs"
              color="red"
              variant="subtle"
              onClick={() => {
                setLocation("");
                setLocationCoords(null);
              }}
            >
              <IconX size={12} />
            </ActionIcon>
          </Group>
        )}

        {/* Advanced Options Toggle */}
        <Button
          variant="subtle"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          rightSection={showAdvanced ? <IconX size={14} /> : <IconHash size={14} />}
        >
          {showAdvanced ? "Hide" : "Show"} Advanced Options
        </Button>

        {/* Advanced Options */}
        <Collapse in={showAdvanced}>
          <Stack gap="md">
            {/* Tag Input */}
            <Stack gap="sm">
              <Text size="sm" fw={500}>Add Tags</Text>
              <Group gap="sm">
                <TextInput
                  placeholder="Tag name"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.currentTarget.value)}
                  leftSection={<IconHash size={16} />}
                  style={{ flex: 1 }}
                />
                <TextInput
                  placeholder="Description (optional)"
                  value={tagDescription}
                  onChange={(e) => setTagDescription(e.currentTarget.value)}
                  style={{ flex: 1 }}
                />
                <Button
                  onClick={handleTagAdd}
                  disabled={!tagInput.trim()}
                  leftSection={<IconSend size={14} />}
                >
                  Add
                </Button>
              </Group>
            </Stack>

            {/* Mention Input */}
            <Stack gap="sm">
              <Text size="sm" fw={500}>Mention Users</Text>
              <Group gap="sm">
                <TextInput
                  placeholder="Search users to mention..."
                  value={mentionInput}
                  onChange={(e) => {
                    setMentionInput(e.currentTarget.value);
                    setShowMentionPicker(e.currentTarget.value.length > 0);
                  }}
                  leftSection={<IconUser size={16} />}
                  style={{ flex: 1 }}
                />
              </Group>

              <Transition mounted={showMentionPicker} transition="slide-down">
                {(styles) => (
                  <Paper withBorder p="sm" style={styles}>
                    <Stack gap="xs">
                      {followingUsers
                        .filter((user: any) =>
                          user.firstName.toLowerCase().includes(mentionInput.toLowerCase()) ||
                          user.username?.toLowerCase().includes(mentionInput.toLowerCase())
                        )
                        .slice(0, 5)
                        .map((user: any) => (
                          <Group
                            key={user.id}
                            gap="sm"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleMentionAdd(user.id)}
                          >
                            <Avatar size="sm" src={user.avatar} radius="xl">
                              {user.firstName.charAt(0)}
                            </Avatar>
                            <Box>
                              <Text size="sm" fw={500}>
                                {user.firstName} {user.lastName}
                              </Text>
                              <Text size="xs" c="dimmed">
                                @{user.username || user.phoneNumber}
                              </Text>
                            </Box>
                          </Group>
                        ))}
                    </Stack>
                  </Paper>
                )}
              </Transition>
            </Stack>

            {/* Location */}
            <Stack gap="sm">
              <Text size="sm" fw={500}>Location</Text>
              <Group gap="sm">
                <TextInput
                  placeholder="Add location manually"
                  value={locationCoords ? "Current location" : location}
                  onChange={(e) => setLocation(e.currentTarget.value)}
                  leftSection={<IconLocation size={16} />}
                  style={{ flex: 1 }}
                />
                <Button
                  variant="light"
                  onClick={getCurrentLocation}
                  loading={isGettingLocation}
                  leftSection={<IconMapPin size={16} />}
                >
                  Use Current Location
                </Button>
              </Group>
            </Stack>

            {/* Post Settings */}
            <Stack gap="sm">
              <Text size="sm" fw={500}>Post Settings</Text>
              <Group grow>
                <Switch
                  label="Public"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.currentTarget.checked)}
                />
                <Switch
                  label="Allow Comments"
                  checked={allowComments}
                  onChange={(e) => setAllowComments(e.currentTarget.checked)}
                />
                <Switch
                  label="Allow Likes"
                  checked={allowLikes}
                  onChange={(e) => setAllowLikes(e.currentTarget.checked)}
                />
              </Group>
              <Group grow>
                <Switch
                  label="Allow Shares"
                  checked={allowShares}
                  onChange={(e) => setAllowShares(e.currentTarget.checked)}
                />
                <Switch
                  label="Allow Bookmarks"
                  checked={allowBookmarks}
                  onChange={(e) => setAllowBookmarks(e.currentTarget.checked)}
                />
                <Switch
                  label="Allow Reactions"
                  checked={allowReactions}
                  onChange={(e) => setAllowReactions(e.currentTarget.checked)}
                />
              </Group>
            </Stack>
          </Stack>
        </Collapse>

        {/* Actions */}
        <Group justify="space-between">
          <Group gap="sm">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) =>
                handleMediaUpload(Array.from(e.target.files || []))
              }
              style={{ display: "none" }}
            />
            <ActionIcon
              variant="light"
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              disabled={media.length >= 4}
            >
              <IconPhoto size={20} />
            </ActionIcon>
            <ActionIcon variant="light" size="lg" disabled>
              <IconVideo size={20} />
            </ActionIcon>
          </Group>

          <Group gap="sm">
            <Button variant="light" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              loading={isSubmitting}
              leftSection={<IconSend size={16} />}
            >
              {scheduledAt ? "Schedule" : "Post"}
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
