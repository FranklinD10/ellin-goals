import React, { useState } from 'react';
import { Paper as MantinePaper, Stack, Group, Text, Button } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';
import { APP_VERSION } from '../utils/version';

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
  const [checkStatus, setCheckStatus] = useState<string>('');
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleUpdateCheck = async () => {
    setIsChecking(true);
    setCheckStatus('Checking for updates...');

    try {
      // Add a timeout to ensure the update check doesn't take forever
      const timeoutPromise = new Promise<boolean>((resolve) =>
        setTimeout(() => resolve(false), 5000) // 5-second timeout
      );
      const hasUpdate = await Promise.race([checkForUpdates(), timeoutPromise]);
      setLastCheckTime(new Date());
      setUpdateAvailable(hasUpdate);

      if (hasUpdate) {
        setCheckStatus('🔄 Update available!');
      } else {
        setCheckStatus('✨ All up to date!');
        setTimeout(() => setCheckStatus(''), 3000);
      }
      
      showNotification({
        title: hasUpdate ? 'Update Available' : 'No Updates',
        message: hasUpdate 
          ? 'A new version is available. Click to apply the update.'
          : 'You are using the latest version.',
        color: hasUpdate ? 'blue' : 'green'
      });
    } catch (error) {
      setCheckStatus('❌ Update check failed');
      showNotification({
        title: 'Error',
        message: 'Failed to check for updates',
        color: 'red'
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <MantinePaper p="md" withBorder>
      <Stack spacing="md">
        <Text weight={500}>App Updates</Text>
        <Group>
          <Button
            leftIcon={<IconRefresh size={16} />}
            onClick={
              updateAvailable
                ? () => {
                    if (navigator.serviceWorker.controller) {
                      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
                    }
                    window.location.reload();
                  }
                : handleUpdateCheck
            }
            loading={isChecking}
            color={updateAvailable ? 'blue' : 'default'}
          >
            {updateAvailable ? 'Apply Update' : 'Check for Updates'}
          </Button>
          <Stack spacing={4}>
            <Text size="sm" color="dimmed">
              Current Version: {APP_VERSION}
            </Text>
            {(lastCheckTime || checkStatus) && (
              <Text 
                size="xs" 
                color={updateAvailable ? 'blue' : 'dimmed'} 
                style={{ fontStyle: 'italic' }}
              >
                {checkStatus || `Last checked: ${lastCheckTime?.toLocaleTimeString()}`}
              </Text>
            )}
          </Stack>
        </Group>
      </Stack>
    </MantinePaper>
  );
};

export default UpdatesPaper;
