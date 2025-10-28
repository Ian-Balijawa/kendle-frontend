import {
    Modal,
    Stack,
    TextInput,
    Avatar,
    Group,
    Text,
    Box,
    ActionIcon,
    Loader,
    Center,
    ScrollArea,
    Badge,
} from "@mantine/core";
import { IconSearch, IconX, IconMessage } from "@tabler/icons-react";
import { useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { User } from "../../types/auth";
import { useFindOrCreateDirectConversation } from "../../hooks/useChatApi";
import { useAuthStore } from "../../stores/authStore";
import { useUserSearch } from "../../hooks/useSearch";

interface NewMessageModalProps {
    opened: boolean;
    onClose: () => void;
    onConversationCreated?: (conversationId: string) => void;
}

export function NewMessageModal({
    opened,
    onClose,
    onConversationCreated,
}: NewMessageModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch] = useDebouncedValue(searchQuery, 300);
    const { user: currentUser } = useAuthStore();

    const findOrCreateConversation = useFindOrCreateDirectConversation();

    // Use the new search hook
    const { data: searchResults, isLoading: isSearching } = useUserSearch({
        q: debouncedSearch,
        limit: 20,
    });

    // Filter out current user from search results
    const users = searchResults?.users.filter(
        (u) => u.id !== currentUser?.id
    ) || [];

    const handleUserSelect = async (user: User) => {
        try {
            const conversation = await findOrCreateConversation.mutateAsync(user.id);
            onConversationCreated?.(conversation.id);
            onClose();
            setSearchQuery("");
        } catch (error) {
            console.error("Failed to create conversation:", error);
        }
    };

    const handleClose = () => {
        onClose();
        setSearchQuery("");
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={
                <Group gap="sm">
                    <IconMessage size={20} />
                    <Text fw={600}>New Message</Text>
                </Group>
            }
            size="md"
            radius="lg"
            styles={{
                title: {
                    fontSize: "1.1rem",
                    fontWeight: 600,
                },
            }}
        >
            <Stack gap="md">
                <TextInput
                    placeholder="Search users..."
                    leftSection={<IconSearch size={18} />}
                    rightSection={
                        searchQuery && (
                            <ActionIcon
                                variant="subtle"
                                color="gray"
                                size="sm"
                                onClick={() => {
                                    setSearchQuery("");
                                }}
                            >
                                <IconX size={16} />
                            </ActionIcon>
                        )
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    radius="md"
                    size="md"
                />

                <ScrollArea style={{ height: 400 }}>
                    <Stack gap="xs">
                        {isSearching ? (
                            <Center py={60}>
                                <Stack align="center" gap="sm">
                                    <Loader size="md" />
                                    <Text size="sm" c="dimmed">
                                        Searching users...
                                    </Text>
                                </Stack>
                            </Center>
                        ) : users.length === 0 && debouncedSearch.trim() ? (
                            <Center py={60}>
                                <Stack align="center" gap="sm">
                                    <Box
                                        style={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: "50%",
                                            background: "var(--mantine-color-colors-1)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <IconSearch
                                            size={28}
                                            color="var(--mantine-color-colors-6)"
                                        />
                                    </Box>
                                    <Stack align="center" gap={4}>
                                        <Text fw={600} size="sm">
                                            No users found
                                        </Text>
                                        <Text size="xs" c="dimmed" ta="center">
                                            Try a different search term
                                        </Text>
                                    </Stack>
                                </Stack>
                            </Center>
                        ) : !debouncedSearch.trim() ? (
                            <Center py={60}>
                                <Stack align="center" gap="sm">
                                    <Box
                                        style={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: "50%",
                                            background: "var(--mantine-color-colors-1)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <IconSearch
                                            size={28}
                                            color="var(--mantine-color-colors-6)"
                                        />
                                    </Box>
                                    <Stack align="center" gap={4}>
                                        <Text fw={600} size="sm">
                                            Search for users
                                        </Text>
                                        <Text size="xs" c="dimmed" ta="center">
                                            Enter a name or username to start
                                        </Text>
                                    </Stack>
                                </Stack>
                            </Center>
                        ) : (
                            users.map((user) => (
                                <Box
                                    key={user.id}
                                    p="sm"
                                    style={{
                                        borderRadius: "12px",
                                        cursor: "pointer",
                                        transition: "background 0.2s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background =
                                            "var(--mantine-color-gray-0)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "transparent";
                                    }}
                                    onClick={() => handleUserSelect(user)}
                                >
                                    <Group gap="sm" wrap="nowrap">
                                        <Avatar
                                            src={user.avatar || "/user.png"}
                                            size={44}
                                            radius="xl"
                                        >
                                            {user.firstName?.charAt(0) ||
                                                user.username?.charAt(0) ||
                                                "U"}
                                        </Avatar>
                                        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                                            <Group gap="xs">
                                                <Text
                                                    fw={600}
                                                    size="sm"
                                                    style={{
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {user.firstName && user.lastName
                                                        ? `${user.firstName} ${user.lastName}`
                                                        : user.username || "Unknown User"}
                                                </Text>
                                                {user.isVerified && (
                                                    <Badge
                                                        size="xs"
                                                        variant="light"
                                                        color="blue"
                                                        style={{ flexShrink: 0 }}
                                                    >
                                                        Verified
                                                    </Badge>
                                                )}
                                            </Group>
                                            <Text
                                                size="xs"
                                                c="dimmed"
                                                style={{
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                @{user.username || user.phoneNumber}
                                            </Text>
                                            {user.bio && (
                                                <Text
                                                    size="xs"
                                                    c="dimmed"
                                                    lineClamp={1}
                                                    style={{
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {user.bio}
                                                </Text>
                                            )}
                                        </Stack>
                                    </Group>
                                </Box>
                            ))
                        )}
                    </Stack>
                </ScrollArea>
            </Stack>
        </Modal>
    );
}

