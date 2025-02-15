import React, { useState } from 'react';
import { Paper, Stack, Typography, IconButton, Box } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { APP_VERSION } from '../utils/version';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';

const checkForUpdates = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      // If an updated SW is waiting, inform it to skip waiting
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        return true;
      }
      // Trigger update and check again
      await registration.update();
      return registration.waiting ? true : false;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return false;
    }
  }
  return false;
};

const UpdatesPaper = () => {
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  const { showNotification } = useNotification();

  const handleCheckForUpdates = async () => {
    const hasUpdate = await checkForUpdates();
    setLastCheckTime(new Date());
    
    showNotification({
      title: 'Update Check',
      message: hasUpdate ? 'Update found! Applying changes...' : 'No updates available.',
      color: hasUpdate ? 'info' : 'success'
    });
  };

  return (
    <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
      <Stack spacing={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="subtitle1" fontWeight={500}>App Version</Typography>
            <Typography variant="body2" color="text.secondary">Current version: {APP_VERSION}</Typography>
          </Box>
          <IconButton onClick={handleCheckForUpdates} size="large">
            <RefreshIcon />
          </IconButton>
        </Box>
        {lastCheckTime && (
          <Typography variant="caption" color="text.secondary">
            Last checked: {lastCheckTime.toLocaleTimeString()}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};

export default UpdatesPaper;
