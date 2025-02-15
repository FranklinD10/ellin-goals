import { Box, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';

interface LoaderProps {
  text?: string;
}

export function ThemedLoader({ text }: LoaderProps) {
  const { themeColor } = useTheme();
  
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight={200}
      gap={2}
    >
      <CircularProgress size={48} thickness={4} />
      {text && (
        <Typography variant="body2" color="text.secondary">
          {text}
        </Typography>
      )}
    </Box>
  );
}
