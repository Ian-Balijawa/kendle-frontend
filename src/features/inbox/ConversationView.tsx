import {
    Avatar,
    Box,
    Group,
    Stack,
    Text,
    TextInput,
    ActionIcon,
    Paper,
    ScrollArea,
    Loader,
    Center,
    Badge,
    Indicator,
} from "@mantine/core";
import {
    IconSend,
    IconArrowLeft,
    IconDots,
    IconCircle,
} from "@tabler/icons-react";
import { useState, useEffect, useRef } from "react";
import { ConversationResponse } from "../../types/chat";
import { useInfiniteMessages } from "../../hooks/useChatApi";
import { useChatCombined } from "../../hooks/useChatCombined";
import { useAuthStore } from "../../stores/authStore";
import { useInboxStore } from "../../stores/inboxStore";
import { MessageBubble } from "./MessageBubble";
import { useQueryClient } from "@tanstack/react-query";

interface ConversationViewProps {
    conversation: ConversationResponse;
    onBack?: () => void;
}

export function ConversationView({
    conversation,
    onBack,
}: ConversationViewProps) {
    const [messageInput, setMessageInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { user: currentUser, token } = useAuthStore();
    const { chatSettings } = useInboxStore();
    const queryClient = useQueryClient();

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useInfiniteMessages(conversation.id, { limit: 30 });

    const chat = useChatCombined({
        token: token || "",
        autoConnect: true,
    });

    const messages = data?.pages.flat() || [];

    // Get the other participant(s)
    const otherParticipants = conversation.participants.filter(
        (p) => p.id !== currentUser?.id
    );
    const otherUser = otherParticipants[0];

    const isOnline = chat.onlineUsers.has(otherUser?.id || "");
    const typingUsers = useInboxStore((state) =>
        state.getTypingUsers(conversation.id)
    );
    const isTyping = typingUsers.length > 0;

    useEffect(() => {
        // Join conversation when component mounts
        if (chat.isConnected) {
            chat.joinConversation(conversation.id);
        }

        return () => {
            // Leave conversation when component unmounts
            if (chat.isConnected) {
                chat.leaveConversation(conversation.id);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversation.id, chat.isConnected]);

    useEffect(() => {
        // Scroll to bottom when messages change
        const timer = setTimeout(() => {
            if (scrollAreaRef.current) {
                const viewport = scrollAreaRef.current.querySelector(
                    "[data-radix-scroll-area-viewport]"
                );
                if (viewport) {
                    viewport.scrollTop = viewport.scrollHeight;
                }
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [messages.length]);

    useEffect(() => {
        // Mark conversation as read when opened
        if (conversation.unreadCount > 0) {
            chat.markConversationAsRead(conversation.id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversation.id, conversation.unreadCount]);

    const handleSendMessage = async () => {
        if (!messageInput.trim() || isSending) return;

        const messageContent = messageInput.trim();
        setMessageInput("");
        setIsSending(true);

        try {
            await chat.sendMessage({
                content: messageContent,
                receiverId: otherUser?.id || "",
                conversationId: conversation.id,
                messageType: "text",
            });

            // Invalidate and refetch messages
            queryClient.invalidateQueries({
                queryKey: ["chat", "messages", conversation.id],
            });

            // Stop typing indicator
            if (chat.isConnected) {
                chat.setTyping(conversation.id, false);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            setMessageInput(messageContent);
        } finally {
            setIsSending(false);
        }
    };

    const handleTyping = (value: string) => {
        setMessageInput(value);

        // Send typing indicator with debounce
        if (chatSettings.showTypingIndicator && chat.isConnected) {
            if (value.length > 0) {
                chat.setTyping(conversation.id, true).catch(() => {
                    // Silently fail if typing indicator fails
                });
            } else {
                chat.setTyping(conversation.id, false).catch(() => {
                    // Silently fail if typing indicator fails
                });
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <Stack gap={0} style={{ height: "100%", position: "relative" }}>
            {/* Header */}
            <Paper
                shadow="xs"
                p="md"
                style={{
                    borderBottom: "1px solid var(--mantine-color-gray-2)",
                    zIndex: 10,
                }}
            >
                <Group justify="space-between">
                    <Group gap="sm">
                        {onBack && (
                            <ActionIcon
                                variant="subtle"
                                color="gray"
                                onClick={onBack}
                                size="lg"
                            >
                                <IconArrowLeft size={20} />
                            </ActionIcon>
                        )}
                        <Group gap="sm">
                            <Indicator
                                disabled={!chatSettings.showOnlineStatus || !isOnline}
                                color="green"
                                position="bottom-end"
                                size={12}
                                offset={4}
                                processing={isOnline}
                            >
                                <Avatar
                                    src={otherUser?.avatar || "/user.png"}
                                    size={44}
                                    radius="xl"
                                >
                                    {otherUser?.firstName?.charAt(0) ||
                                        otherUser?.username?.charAt(0) ||
                                        "U"}
                                </Avatar>
                            </Indicator>
                            <Stack gap={2}>
                                <Text fw={600} size="sm">
                                    {otherUser?.firstName && otherUser?.lastName
                                        ? `${otherUser.firstName} ${otherUser.lastName}`
                                        : otherUser?.username || "Unknown User"}
                                </Text>
                                {chatSettings.showOnlineStatus && (
                                    <Group gap={4}>
                                        {isOnline && (
                                            <IconCircle
                                                size={8}
                                                fill="var(--mantine-color-green-6)"
                                                color="var(--mantine-color-green-6)"
                                            />
                                        )}
                                        <Text size="xs" c="dimmed">
                                            {isOnline ? "Active now" : "Offline"}
                                        </Text>
                                    </Group>
                                )}
                            </Stack>
                        </Group>
                    </Group>
                    <ActionIcon variant="subtle" color="gray" size="lg">
                        <IconDots size={20} />
                    </ActionIcon>
                </Group>
            </Paper>

            {/* Messages Area */}
            <ScrollArea
                ref={scrollAreaRef}
                style={{
                    flex: 1,
                    height: "calc(100vh - 280px)",
                }}
                scrollbarSize={8}
            >
                <Stack gap="md" p="md">
                    {isLoading ? (
                        <Center py={60}>
                            <Stack align="center" gap="sm">
                                <Loader size="md" />
                                <Text size="sm" c="dimmed">
                                    Loading messages...
                                </Text>
                            </Stack>
                        </Center>
                    ) : messages.length === 0 ? (
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
                                    <Text size="2rem">💬</Text>
                                </Box>
                                <Stack align="center" gap={4}>
                                    <Text fw={600} size="md">
                                        No messages yet
                                    </Text>
                                    <Text size="sm" c="dimmed" ta="center">
                                        Send a message to start the conversation
                                    </Text>
                                </Stack>
                            </Stack>
                        </Center>
                    ) : (
                        <>
                            {hasNextPage && (
                                <Center>
                                    <ActionIcon
                                        variant="light"
                                        onClick={() => fetchNextPage()}
                                        loading={isFetchingNextPage}
                                    >
                                        Load more
                                    </ActionIcon>
                                </Center>
                            )}
                            {messages
                                .slice()
                                .reverse()
                                .map((message, index, arr) => {
                                    const isOwnMessage = message.senderId === currentUser?.id;
                                    const sender = isOwnMessage
                                        ? currentUser
                                        : otherParticipants.find(
                                            (p) => p.id === message.senderId
                                        );
                                    const prevMessage = arr[index - 1];
                                    const showAvatar =
                                        !prevMessage ||
                                        prevMessage.senderId !== message.senderId;

                                    return (
                                        <MessageBubble
                                            key={message.id}
                                            message={message}
                                            isOwnMessage={isOwnMessage}
                                            sender={sender}
                                            showAvatar={showAvatar}
                                        />
                                    );
                                })}
                            {isTyping && chatSettings.showTypingIndicator && (
                                <Group gap="xs">
                                    <Avatar
                                        src={otherUser?.avatar || "/user.png"}
                                        size={32}
                                        radius="xl"
                                    >
                                        {otherUser?.firstName?.charAt(0) ||
                                            otherUser?.username?.charAt(0) ||
                                            "U"}
                                    </Avatar>
                                    <Badge
                                        variant="light"
                                        color="gray"
                                        size="lg"
                                        style={{
                                            padding: "12px 16px",
                                            borderRadius: "18px",
                                        }}
                                    >
                                        <Group gap={4}>
                                            <Box
                                                style={{
                                                    display: "flex",
                                                    gap: "4px",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <Box
                                                    style={{
                                                        width: 6,
                                                        height: 6,
                                                        borderRadius: "50%",
                                                        background: "var(--mantine-color-gray-6)",
                                                        animation: "bounce 1.4s infinite ease-in-out",
                                                        animationDelay: "0s",
                                                    }}
                                                />
                                                <Box
                                                    style={{
                                                        width: 6,
                                                        height: 6,
                                                        borderRadius: "50%",
                                                        background: "var(--mantine-color-gray-6)",
                                                        animation: "bounce 1.4s infinite ease-in-out",
                                                        animationDelay: "0.2s",
                                                    }}
                                                />
                                                <Box
                                                    style={{
                                                        width: 6,
                                                        height: 6,
                                                        borderRadius: "50%",
                                                        background: "var(--mantine-color-gray-6)",
                                                        animation: "bounce 1.4s infinite ease-in-out",
                                                        animationDelay: "0.4s",
                                                    }}
                                                />
                                            </Box>
                                        </Group>
                                    </Badge>
                                </Group>
                            )}
                        </>
                    )}
                </Stack>
            </ScrollArea>

            {/* Message Input */}
            <Paper
                shadow="xs"
                p="md"
                style={{
                    borderTop: "1px solid var(--mantine-color-gray-2)",
                    position: "sticky",
                    bottom: 0,
                    background: "white",
                    zIndex: 10,
                }}
            >
                <Group gap="sm" wrap="nowrap">
                    <TextInput
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => handleTyping(e.target.value)}
                        onKeyPress={handleKeyPress}
                        style={{ flex: 1 }}
                        radius="xl"
                        size="md"
                        disabled={isSending}
                    />
                    <ActionIcon
                        size={42}
                        radius="xl"
                        variant="filled"
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || isSending}
                        loading={isSending}
                        style={{
                            background:
                                "linear-gradient(135deg, var(--mantine-color-blue-6), var(--mantine-color-violet-6))",
                        }}
                    >
                        <IconSend size={20} />
                    </ActionIcon>
                </Group>
            </Paper>

            <style>
                {`
          @keyframes bounce {
            0%, 60%, 100% {
              transform: translateY(0);
            }
            30% {
              transform: translateY(-8px);
            }
          }
        `}
            </style>
        </Stack>
    );
}

