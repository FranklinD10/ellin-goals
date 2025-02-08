import { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Stack, Text } from '@mantine/core';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Stack align="center" spacing="md" p="xl">
          <Alert color="red" title="Something went wrong">
            <Text size="sm">The application encountered an error.</Text>
          </Alert>
          <Button onClick={() => window.location.reload()}>
            Reload App
          </Button>
        </Stack>
      );
    }

    return this.props.children;
  }
}
