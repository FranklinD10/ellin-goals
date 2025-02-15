import { Component, ReactNode } from 'react';
import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 2
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              maxWidth: 400,
              width: '100%',
              border: 1,
              borderColor: 'divider'
            }}
          >
            <Stack spacing={2} alignItems="center">
              <ErrorIcon color="error" sx={{ fontSize: 48 }} />
              <Typography variant="h6" align="center">
                Something went wrong
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                {this.state.error?.message || 'An unexpected error occurred'}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleReset}
                sx={{ mt: 2 }}
              >
                Reload App
              </Button>
            </Stack>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}
