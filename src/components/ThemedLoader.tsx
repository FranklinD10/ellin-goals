import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';

interface ThemedLoaderProps {
  text?: string;
}

export function ThemedLoader({ text }: ThemedLoaderProps) {
  const { theme } = useTheme();
  
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100%', 
      minHeight: 200 
    }}>
      <Stack spacing={2} alignItems="center">
        <CircularProgress color="primary" size={48} />
        {text && (
          <Typography variant="body2" color="text.secondary">
            {text}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
