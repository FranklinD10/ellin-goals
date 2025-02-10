import React, { useState } from 'react';
import { Paper as MantinePaper, Stack, Text, Group, Button } from '@mantine/core';
import { IconRefresh } from '@tabler/icons';
import { showNotification } from '@mantine/notifications';
import { checkForUpdates } from './updateService';

const Paper = () => {
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  const [checkStatus, setCheckStatus] = useState<string>('');
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleUpdate = async () => {
    setIsChecking(true);
    setCheckStatus('Checking for updates...');
    
    try {
      const hasUpdate = await checkForUpdates();
      setLastCheckTime(new Date());
      setUpdateAvailable(hasUpdate);
      
      if (hasUpdate) {
        setCheckStatus('🔄 Update available!');
        showNotification({
          title: 'Update Available',
          message: 'A new version is available. Click to install.',
          color: 'blue'
        });
      } else {
        setCheckStatus('✨ All up to date!');
        showNotification({
          title: 'No Updates',
          message: 'You are using the latest version.',
          color: 'green'
        });
        // Clear status after 3 seconds when no update is found
        setTimeout(() => setCheckStatus(''), 3000);
      }
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
            onClick={updateAvailable ? () => window.location.reload() : handleUpdate}
            loading={isChecking}
            color={updateAvailable ? 'blue' : 'default'}
          >
            {updateAvailable ? 'Apply Update' : 'Check for Updates'}
          </Button>
          <Stack spacing={4}>
            {checkStatus && (
              <Text size="sm" color={updateAvailable ? 'blue' : 'dimmed'}>
                {checkStatus}
              </Text>
            )}
            {lastCheckTime && (
              <Text size="xs" color="dimmed"></Text>