import { Box, Typography, Stack, CircularProgress } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';

interface StreakIndicatorProps {
  streak: number;
  total: number;
}

export default function StreakIndicator({ streak, total }: StreakIndicatorProps) {
  const { theme } = useTheme();
  const progress = (streak / total) * 100;

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Box position="relative" display="inline-flex">
        <CircularProgress
          variant="determinate"
          value={progress}
          size={48}
          thickness={4}
          sx={{ color: theme.palette.primary.main }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body2" component="div" color="text.secondary">
            {streak}
          </Typography>
        </Box>
      </Box>
      <Stack>
        <Typography variant="body2" fontWeight={500}>
          Current Streak
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {total} day goal
        </Typography>
      </Stack>
    </Stack>
  );
}
