import React from 'react';
import { Paper, Typography, Stack, Button } from '@mui/material';
import { Info } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { APP_VERSION } from '../utils/version';

export default function UpdatesPaper() {
  const { enqueueSnackbar } = useSnackbar();

  const checkForUpdates = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CHECK_FOR_UPDATES' });
      enqueueSnackbar('Checking for updates...', { variant: 'info' });
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Info color="primary" />
          <div>
            <Typography variant="subtitle1" fontWeight={500}>Updates</Typography>
            <Typography variant="body2" color="text.secondary">
              Check for app updates
            </Typography>
          </div>
        </Stack>

        <Button
          variant="outlined"
          onClick={checkForUpdates}
          sx={{ alignSelf: 'flex-start' }}
        >
          Check for Updates
        </Button>
      </Stack>
    </Paper>
  );
}
