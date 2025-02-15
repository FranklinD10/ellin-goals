import React, { memo, useState } from 'react';
import { 
  Box, 
  Paper, 
  Stack, 
  Typography, 
  ToggleButtonGroup, 
  ToggleButton, 
  IconButton, 
  Tooltip 
} from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';
import RefreshIcon from '@mui/icons-material/Refresh';
import UpdatesPaper from './UpdatesPaper';
import Layout from './Layout';
import { useNotification } from '../contexts/NotificationContext';

// Define types if not imported from a common module:
type ThemeKey = 'red' | 'pink' | 'purple' | 'blue' | 'green' | 'yellow';

const themes: Record<ThemeKey, { color: string; label: string }> = {
  red: { color: '#FF4B4B', label: 'Red' },
  pink: { color: '#FF69B4', label: 'Pink' },
  purple: { color: '#9C27B0', label: 'Purple' },
  blue: { color: '#2196F3', label: 'Blue' },
  green: { color: '#4CAF50', label: 'Green' },
  yellow: { color: '#FFC107', label: 'Yellow' }
};

interface ThemeButtonProps {
  color: string;
  label: string;
  onClick: () => void;
  isSelected: boolean;
}

const ThemeButton = memo(({ color, label, onClick, isSelected }: ThemeButtonProps) => (
  <Tooltip title={label} placement="bottom">
    <IconButton
      sx={{
        backgroundColor: color,
        border: isSelected ? `3px solid` : 'none',
        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'scale(1.1)',
        },
      }}
      onClick={onClick}
      size="large"
    />
  </Tooltip>
));

ThemeButton.displayName = 'ThemeButton';

export default function Settings() {
  const { colorScheme, toggleColorScheme, setThemeColor, isSelected } = useTheme();
  const { showNotification } = useNotification();

  return (
    <Layout>
      <Typography variant="h4" mb={4}>Settings</Typography>
      <Stack spacing={4}>
        <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}>
          <Stack spacing={2}>
            <Typography fontWeight={500}>Theme Mode</Typography>
            <ToggleButtonGroup
              value={colorScheme}
              exclusive
              onChange={(_, value) => value && toggleColorScheme(value)}
              size="large"
            >
              <ToggleButton value="light">Light</ToggleButton>
              <ToggleButton value="dark">Dark</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}>
          <Stack spacing={2}>
            <Typography fontWeight={500}>Theme Color</Typography>
            <Stack direction="row" spacing={1.5}>
              {(Object.keys(themes) as ThemeKey[]).map((key) => (
                <ThemeButton
                  key={key}
                  color={themes[key].color}
                  label={themes[key].label}
                  onClick={() => setThemeColor(key)}
                  isSelected={isSelected(key)}
                />
              ))}
            </Stack>
          </Stack>
        </Paper>

        <UpdatesPaper />
      </Stack>
    </Layout>
  );
}