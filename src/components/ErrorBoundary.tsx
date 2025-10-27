import { Component, ReactNode } from "react";
import { Box, Text, Button, Stack, Alert } from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Box p="xl" style={{ minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Stack align="center" gap="md">
                        <IconAlertCircle size={48} color="var(--mantine-color-red-6)" />
                        <Text size="lg" fw={600} ta="center">
                            Something went wrong
                        </Text>
                        <Text size="sm" c="dimmed" ta="center" maw={400}>
                            {this.state.error?.message || "An unexpected error occurred. Please try refreshing the page."}
                        </Text>
                        <Button
                            variant="light"
                            leftSection={<IconRefresh size={16} />}
                            onClick={() => window.location.reload()}
                        >
                            Refresh Page
                        </Button>
                    </Stack>
                </Box>
            );
        }

        return this.props.children;
    }
}
