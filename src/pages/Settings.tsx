import { Container, Title, Paper as MantinePaper, Stack, Group, Text, SegmentedControl, ActionIcon, Tooltip } from '@mantine/core';
import { useTheme } from '../contexts/ThemeContext';
import { memo, useState } from 'react';
import { showNotification } from '@mantine/notifications';
import { IconRefresh } from '@tabler/icons-react';
import { APP_VERSION } from '../utils/version';
import UpdatesPaper from '../components/UpdatesPaper';
import Layout from '../components/Layout';

type ThemeKey = 'red' | 'pink' | 'purple' | 'blue' | 'green' | 'yellow';

const themes: Record<ThemeKey, { color: string; label: string }> = {
  red: { color: '#FF4B4B', label: 'Red' },
  pink: { color: '#FF69B4', label: 'Pink' },
  purple: { color: '#9C27B0', label: 'Purple' },
  blue: { color: '#2196F3', label: 'Blue' },
  green: { color: '#4CAF50', label: 'Green' },
  yellow: { color: '#FFC107', label: 'Yellow' },
};

interface ThemeButtonProps {
  color: string;
  label: string;
  onClick: () => void;
  isSelected: boolean;
}

const ThemeButton = memo(({ color, label, onClick, isSelected }: ThemeButtonProps) => (
  <Tooltip label={label}>
    <ActionIcon
      size="xl"
      sx={(theme) => ({
        backgroundColor: color,
        border: isSelected ? `3px solid ${theme.colors.gray[6]}` : 'none',
        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'scale(1.1)',
        }
      })}
      onClick={onClick}
      variant={isSelected ? 'filled' : 'light'}
    />
  </Tooltip>
));

ThemeButton.displayName = 'ThemeButton';

export default function Settings() {
  const { colorScheme, themeColor, toggleColorScheme, setThemeColor, isSelected } = useTheme();

  return (
    <Layout>
      <Title order={2} mb="xl">Settings</Title>
      <Stack spacing="lg">
        <MantinePaper p="md" withBorder>
          <Stack spacing="md">
            <Text weight={500}>Theme Mode</Text>
            <SegmentedControl
              value={colorScheme}
              onChange={toggleColorScheme}
              data={[
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
              ]}
              fullWidth
            />
          </Stack>
        </MantinePaper>

        <MantinePaper p="md" withBorder>
          <Stack spacing="md">
            <Text weight={500}>Theme Color</Text>
            <Group spacing="xs">
              {(Object.keys(themes) as ThemeKey[]).map((key) => (
                <ThemeButton
                  key={key}
                  color={themes[key].color}
                  label={themes[key].label}
                  onClick={() => setThemeColor(key)}
                  isSelected={isSelected(key)}
                />
              ))}
            </Group>
          </Stack>
        </MantinePaper>

        <UpdatesPaper />
      </Stack>
    </Layout>
  );
}
