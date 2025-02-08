import { Group, ActionIcon, Tooltip, useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoonStars } from '@tabler/icons-react';
import { useUser } from '../contexts/UserContext';
import { saveUserSettings } from '../lib/firestore';
import UserSwitcher from './UserSwitcher';

const themes = {
  red: { color: '#FF4B4B', label: 'Red' },
  pink: { color: '#FF69B4', label: 'Pink' },
  purple: { color: '#9C27B0', label: 'Purple' },
  blue: { color: '#2196F3', label: 'Blue' },
  green: { color: '#4CAF50', label: 'Green' },
  yellow: { color: '#FFC107', label: 'Yellow' },
} as const;

export default function ThemeSelector() {
  const { userData, currentUser } = useUser();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const handleThemeChange = async (color: keyof typeof themes) => {
    if (!currentUser) return;

    const settings = {
      theme: userData?.settings?.theme || 'light',
      themeColor: color,
      notifications: userData?.settings?.notifications ?? true,
    };

    await saveUserSettings(currentUser, settings);
  };

  return (
    <Group>
      <Group spacing="xs">
        {Object.entries(themes).map(([key, { color, label }]) => (
          <Tooltip key={key} label={label}>
            <ActionIcon
              size="lg"
              sx={{ backgroundColor: color }}
              onClick={() => handleThemeChange(key as keyof typeof themes)}
              variant={userData?.settings?.themeColor === key ? 'filled' : 'light'}
            />
          </Tooltip>
        ))}
      </Group>
      <ActionIcon
        variant="outline"
        color={colorScheme === 'dark' ? 'yellow' : 'blue'}
        onClick={() => toggleColorScheme()}
        title="Toggle color scheme"
      >
        {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoonStars size={18} />}
      </ActionIcon>
      <UserSwitcher />
    </Group>
  );
}
