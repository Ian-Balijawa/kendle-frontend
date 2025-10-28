import { Avatar, Box, Group, Stack, Text, Tooltip } from "@mantine/core";
import { IconCheck, IconChecks } from "@tabler/icons-react";
import { MessageResponse } from "../../types/chat";
import { User } from "../../types/auth";

interface MessageBubbleProps {
    message: MessageResponse;
    isOwnMessage: boolean;
    sender?: User;
    showAvatar?: boolean;
}

export function MessageBubble({
    message,
    isOwnMessage,
    sender,
    showAvatar = true,
}: MessageBubbleProps) {
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 24) {
            return date.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
            });
        }
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const getStatusIcon = () => {
        if (message.isRead) {
            return <IconChecks size={14} color="var(--mantine-color-blue-6)" />;
        }
        if (message.isDelivered) {
            return <IconChecks size={14} color="var(--mantine-color-gray-6)" />;
        }
        return <IconCheck size={14} color="var(--mantine-color-gray-6)" />;
    };

    return (
        <Group
            gap="xs"
            justify={isOwnMessage ? "flex-end" : "flex-start"}
            wrap="nowrap"
            style={{ width: "100%" }}
        >
            {!isOwnMessage && showAvatar && (
                <Avatar
                    src={sender?.avatar || "/user.png"}
                    size={32}
                    radius="xl"
                    style={{ flexShrink: 0 }}
                >
                    {sender?.firstName?.charAt(0) || sender?.username?.charAt(0) || "U"}
                </Avatar>
            )}

            {!isOwnMessage && !showAvatar && <Box style={{ width: 32 }} />}

            <Stack gap={4} style={{ maxWidth: "70%" }}>
                <Box
                    style={{
                        background: isOwnMessage
                            ? "linear-gradient(135deg, var(--mantine-color-blue-6), var(--mantine-color-violet-6))"
                            : "var(--mantine-color-gray-1)",
                        color: isOwnMessage ? "white" : "var(--mantine-color-dark-7)",
                        padding: "10px 14px",
                        borderRadius: isOwnMessage
                            ? "18px 18px 4px 18px"
                            : "18px 18px 18px 4px",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                        wordBreak: "break-word",
                    }}
                >
                    <Text size="sm" style={{ lineHeight: 1.5 }}>
                        {message.content}
                    </Text>
                </Box>

                <Group gap={4} justify={isOwnMessage ? "flex-end" : "flex-start"}>
                    <Text size="xs" c="dimmed">
                        {formatTime(message.createdAt)}
                    </Text>
                    {isOwnMessage && (
                        <Tooltip
                            label={
                                message.isRead
                                    ? "Read"
                                    : message.isDelivered
                                        ? "Delivered"
                                        : "Sent"
                            }
                        >
                            <Box style={{ display: "flex", alignItems: "center" }}>
                                {getStatusIcon()}
                            </Box>
                        </Tooltip>
                    )}
                    {message.isEdited && (
                        <Text size="xs" c="dimmed" fs="italic">
                            (edited)
                        </Text>
                    )}
                </Group>
            </Stack>

            {isOwnMessage && showAvatar && (
                <Avatar
                    src={sender?.avatar || "/user.png"}
                    size={32}
                    radius="xl"
                    style={{ flexShrink: 0 }}
                >
                    {sender?.firstName?.charAt(0) || sender?.username?.charAt(0) || "U"}
                </Avatar>
            )}
        </Group>
    );
}

