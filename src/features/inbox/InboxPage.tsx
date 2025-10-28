import {
    Box,
    Container,
    Grid,
    Paper,
    Stack,
    Text,
    Group,
    Avatar,
    Badge,
    ActionIcon,
    Button,
    Loader,
    Center,
    TextInput,
    ScrollArea,
    Indicator,
} from "@mantine/core";
import {
    IconMessagePlus,
    IconSearch,
    IconInbox,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { ConversationView } from "./ConversationView";
import { NewMessageModal } from "./NewMessageModal";
import { useConversations } from "../../hooks/useChatApi";
import { useChatCombined } from "../../hooks/useChatCombined";
import { useAuthStore } from "../../stores/authStore";
import { useInboxStore } from "../../stores/inboxStore";
import { ConversationResponse } from "../../types/chat";
import { ErrorBoundary } from "../../components/ErrorBoundary";

export function InboxPage() {
    const [selectedConversationId, setSelectedConversationId] = useState<
        string | null
    >(null);
    const [newMessageModalOpened, setNewMessageModalOpened] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const isMobile = useMediaQuery("(max-width: 768px)");

    const { user: currentUser, token } = useAuthStore();
    const { chatSettings } = useInboxStore();

    const { data: conversations, isLoading } = useConversations();

    const chat = useChatCombined({
        token: token || "",
        autoConnect: true,
    });

    const selectedConversation = conversations?.find(
        (c) => c.id === selectedConversationId
    );

    // Filter conversations based on search
    const filteredConversations = conversations?.filter((conv) => {
        if (!searchQuery.trim()) return true;

        const otherParticipants = conv.participants.filter(
            (p) => p.id !== currentUser?.id
        );
        const searchLower = searchQuery.toLowerCase();

        return otherParticipants.some(
            (p) =>
                p.firstName?.toLowerCase().includes(searchLower) ||
                p.lastName?.toLowerCase().includes(searchLower) ||
                p.username?.toLowerCase().includes(searchLower)
        );
    });

    const formatTime = (dateString?: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days}d`;
        }
        if (hours > 0) {
            return `${hours}h`;
        }
        return "now";
    };

    const getConversationName = (conversation: ConversationResponse) => {
        if (conversation.name) return conversation.name;

        const otherParticipants = conversation.participants.filter(
            (p) => p.id !== currentUser?.id
        );

        if (otherParticipants.length === 0) return "Unknown";
        if (otherParticipants.length === 1) {
            const user = otherParticipants[0];
            return user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.username || "Unknown User";
        }

        return otherParticipants.map((p) => p.firstName || p.username).join(", ");
    };

    const getOtherUser = (conversation: ConversationResponse) => {
        return conversation.participants.find((p) => p.id !== currentUser?.id);
    };

    const handleConversationCreated = (conversationId: string) => {
        setSelectedConversationId(conversationId);
    };

    // Auto-select first conversation on desktop
    useEffect(() => {
        if (
            !isMobile &&
            !selectedConversationId &&
            conversations &&
            conversations.length > 0
        ) {
            setSelectedConversationId(conversations[0].id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversations, isMobile]);

    const ConversationList = () => (
        <Stack gap={0} style={{ height: "100%" }}>
            {/* Header */}
            <Box
                p="md"
                style={{
                    borderBottom: "1px solid var(--mantine-color-gray-2)",
                }}
            >
                <Group justify="space-between" mb="md">
                    <Text fw={700} size="xl">
                        Messages
                    </Text>
                    <ActionIcon
                        variant="filled"
                        size="lg"
                        radius="xl"
                        onClick={() => setNewMessageModalOpened(true)}
                        style={{
                            background:
                                "linear-gradient(135deg, var(--mantine-color-blue-6), var(--mantine-color-violet-6))",
                        }}
                    >
                        <IconMessagePlus size={20} />
                    </ActionIcon>
                </Group>
                <TextInput
                    placeholder="Search conversations..."
                    leftSection={<IconSearch size={16} />}
                    radius="xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </Box>

            {/* Conversations List */}
            <ScrollArea style={{ flex: 1 }}>
                <Stack gap={0} p="xs">
                    {isLoading ? (
                        <Center py={60}>
                            <Stack align="center" gap="sm">
                                <Loader size="md" />
                                <Text size="sm" c="dimmed">
                                    Loading conversations...
                                </Text>
                            </Stack>
                        </Center>
                    ) : !filteredConversations || filteredConversations.length === 0 ? (
                        <Center py={60}>
                            <Stack align="center" gap="sm">
                                <Box
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: "50%",
                                        background: "var(--mantine-color-blue-1)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <IconInbox size={36} color="var(--mantine-color-blue-6)" />
                                </Box>
                                <Stack align="center" gap={4}>
                                    <Text fw={600} size="md">
                                        {searchQuery.trim()
                                            ? "No conversations found"
                                            : "No messages yet"}
                                    </Text>
                                    <Text size="sm" c="dimmed" ta="center">
                                        {searchQuery.trim()
                                            ? "Try a different search"
                                            : "Start a conversation to connect with others"}
                                    </Text>
                                </Stack>
                                {!searchQuery.trim() && (
                                    <Button
                                        mt="md"
                                        leftSection={<IconMessagePlus size={18} />}
                                        onClick={() => setNewMessageModalOpened(true)}
                                        radius="xl"
                                        style={{
                                            background:
                                                "linear-gradient(135deg, var(--mantine-color-blue-6), var(--mantine-color-violet-6))",
                                        }}
                                    >
                                        New Message
                                    </Button>
                                )}
                            </Stack>
                        </Center>
                    ) : (
                        filteredConversations.map((conversation) => {
                            const otherUser = getOtherUser(conversation);
                            const isOnline = chatSettings.showOnlineStatus && otherUser
                                ? chat.onlineUsers.has(otherUser.id)
                                : false;
                            const isSelected = conversation.id === selectedConversationId;

                            return (
                                <Box
                                    key={conversation.id}
                                    p="md"
                                    style={{
                                        cursor: "pointer",
                                        borderRadius: "12px",
                                        background: isSelected
                                            ? "var(--mantine-color-blue-0)"
                                            : "transparent",
                                        transition: "all 0.2s ease",
                                        borderLeft: isSelected
                                            ? "3px solid var(--mantine-color-blue-6)"
                                            : "3px solid transparent",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.background =
                                                "var(--mantine-color-gray-0)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.background = "transparent";
                                        }
                                    }}
                                    onClick={() => setSelectedConversationId(conversation.id)}
                                >
                                    <Group gap="sm" wrap="nowrap">
                                        <Indicator
                                            disabled={!isOnline}
                                            color="green"
                                            position="bottom-end"
                                            size={12}
                                            offset={4}
                                            processing={isOnline}
                                        >
                                            <Avatar
                                                src={otherUser?.avatar || "/user.png"}
                                                size={50}
                                                radius="xl"
                                            >
                                                {otherUser?.firstName?.charAt(0) ||
                                                    otherUser?.username?.charAt(0) ||
                                                    "U"}
                                            </Avatar>
                                        </Indicator>

                                        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                                            <Group justify="space-between" wrap="nowrap">
                                                <Text
                                                    fw={
                                                        conversation.unreadCount > 0 ? 700 : 500
                                                    }
                                                    size="sm"
                                                    style={{
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {getConversationName(conversation)}
                                                </Text>
                                                <Text
                                                    size="xs"
                                                    c="dimmed"
                                                    style={{ flexShrink: 0, marginLeft: "8px" }}
                                                >
                                                    {formatTime(conversation.lastMessage?.createdAt)}
                                                </Text>
                                            </Group>

                                            <Group justify="space-between" wrap="nowrap">
                                                <Text
                                                    size="xs"
                                                    c={conversation.unreadCount > 0 ? "dark" : "dimmed"}
                                                    fw={conversation.unreadCount > 0 ? 600 : 400}
                                                    lineClamp={1}
                                                    style={{
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                        flex: 1,
                                                    }}
                                                >
                                                    {conversation.lastMessage?.content ||
                                                        "No messages yet"}
                                                </Text>
                                                {conversation.unreadCount > 0 && (
                                                    <Badge
                                                        size="sm"
                                                        variant="filled"
                                                        color="blue"
                                                        circle
                                                        style={{ flexShrink: 0, marginLeft: "8px" }}
                                                    >
                                                        {conversation.unreadCount > 99
                                                            ? "99+"
                                                            : conversation.unreadCount}
                                                    </Badge>
                                                )}
                                            </Group>
                                        </Stack>
                                    </Group>
                                </Box>
                            );
                        })
                    )}
                </Stack>
            </ScrollArea>
        </Stack>
    );

    if (isMobile) {
        return (
            <Container size="xl" p={0}>
                <Box style={{ height: "calc(100vh - 60px)" }}>
                    {selectedConversation ? (
                        <ConversationView
                            conversation={selectedConversation}
                            onBack={() => setSelectedConversationId(null)}
                        />
                    ) : (
                        <ConversationList />
                    )}
                </Box>

                <NewMessageModal
                    opened={newMessageModalOpened}
                    onClose={() => setNewMessageModalOpened(false)}
                    onConversationCreated={handleConversationCreated}
                />
            </Container>
        );
    }

    return (
        <ErrorBoundary>
            <Container size="xl" p="md">
                <Grid gutter="md">
                    <Grid.Col span={4}>
                        <Paper
                            shadow="sm"
                            radius="lg"
                            style={{
                                height: "calc(100vh - 100px)",
                                overflow: "hidden",
                            }}
                        >
                            <ConversationList />
                        </Paper>
                    </Grid.Col>

                    <Grid.Col span={8}>
                        <Paper
                            shadow="sm"
                            radius="lg"
                            style={{
                                height: "calc(100vh - 100px)",
                                overflow: "hidden",
                            }}
                        >
                            {selectedConversation ? (
                                <ErrorBoundary>
                                    <ConversationView conversation={selectedConversation} />
                                </ErrorBoundary>
                            ) : (
                                <Center style={{ height: "100%" }}>
                                    <Stack align="center" gap="md">
                                        <Box
                                            style={{
                                                width: 100,
                                                height: 100,
                                                borderRadius: "50%",
                                                background:
                                                    "linear-gradient(135deg, var(--mantine-color-blue-1), var(--mantine-color-violet-1))",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <IconInbox
                                                size={48}
                                                color="var(--mantine-color-blue-6)"
                                            />
                                        </Box>
                                        <Stack align="center" gap={4}>
                                            <Text fw={600} size="lg">
                                                Select a conversation
                                            </Text>
                                            <Text size="sm" c="dimmed" ta="center">
                                                Choose a conversation from the list or start a new one
                                            </Text>
                                        </Stack>
                                        <Button
                                            mt="md"
                                            leftSection={<IconMessagePlus size={18} />}
                                            onClick={() => setNewMessageModalOpened(true)}
                                            radius="xl"
                                            size="md"
                                            style={{
                                                background:
                                                    "linear-gradient(135deg, var(--mantine-color-blue-6), var(--mantine-color-violet-6))",
                                            }}
                                        >
                                            New Message
                                        </Button>
                                    </Stack>
                                </Center>
                            )}
                        </Paper>
                    </Grid.Col>
                </Grid>

                <NewMessageModal
                    opened={newMessageModalOpened}
                    onClose={() => setNewMessageModalOpened(false)}
                    onConversationCreated={handleConversationCreated}
                />
            </Container>
        </ErrorBoundary>
    );
}

