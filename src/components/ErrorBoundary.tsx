import React from 'react';
import { Alert, Stack, Text, Button } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    resetError = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                const FallbackComponent = this.props.fallback;
                return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
            }

            return (
            <Alert
                icon={<IconAlertCircle size={16} />}
                title="Something went wrong"
                color="red"
                variant="light"
                style={{ margin: '20px' }}
            >
                <Stack gap="sm">
                    <Text size="sm">
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </Text>
                    <Button
                        leftSection={<IconRefresh size={16} />}
                        onClick={this.resetError}
                        size="sm"
                        variant="light"
                    >
                        Try again
                    </Button>
                </Stack>
                </Alert>
            );
        }

        return this.props.children;
    }
}
