import { Container, Title, Paper, Stack, Group, Text, Switch, SegmentedControl, ActionIcon, Tooltip } from '@mantine/core';
import { useTheme } from '../contexts/ThemeContext';
import { memo } from 'react';

const themes = {
  red: { color: '#FF4B4B', label: 'Red' },
  pink: { color: '#FF69B4', label: 'Pink' },
  purple: { color: '#9C27B0', label: 'Purple' },
  blue: { color: '#2196F3', label: 'Blue' },
  green: { color: '#4CAF50', label: 'Green' },
  yellow: { color: '#FFC107', label: 'Yellow' },
} as const;

const ThemeButton = memo(({ color, label, onClick, isSelected }: {
  color: string;
  label: string;
  onClick: () => void;
  isSelected: boolean;
}) => (
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
    <Container size="sm" py="xl">
      <Title order={2} mb="xl">Settings</Title>
      <Stack spacing="lg">
        <Paper p="md" withBorder>
          <Stack spacing="md">
            <Text weight={500}>Theme Mode</Text>
            <SegmentedControl
              value={colorScheme}
              onChange={(value: 'light' | 'dark') => toggleColorScheme(value)}
              data={[
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
              ]}
              fullWidth
            />
          </Stack>
        </Paper>

        <Paper p="md" withBorder>
          <Stack spacing="md">
            <Text weight={500}>Theme Color</Text>
            <Group spacing="xs">
              {Object.entries(themes).map(([key, { color, label }]) => (
                <ThemeButton
                  key={key}
                  color={color}
                  label={label}
                  onClick={() => setThemeColor(key as keyof typeof themes)}
                  isSelected={isSelected(key as keyof typeof themes)}
                />
              ))}
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
