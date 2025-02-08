import { useEffect } from 'react';
import { useMantineColorScheme, ColorScheme } from '@mantine/core';
import { useUser } from '../contexts/UserContext';
import { saveUserSettings } from '../lib/firestore';
import { UserSettings } from '../types';
import { ThemeColorType } from '../types/user';

interface ThemeManagerProps {
  children: React.ReactNode;
  onColorSchemeChange: (colorScheme: ColorScheme) => void;
  onThemeColorChange: (color: ThemeColorType) => void;
}

export default function ThemeManager({ children, onColorSchemeChange, onThemeColorChange }: ThemeManagerProps) {
  const { toggleColorScheme } = useMantineColorScheme();
  const { userData, currentUser } = useUser();

  useEffect(() => {
    if (userData?.settings?.theme) {
      onColorSchemeChange(userData.settings.theme);
    }
    if (userData?.settings?.themeColor) {
      onThemeColorChange(userData.settings.themeColor as ThemeColorType);
    }
  }, [userData, onColorSchemeChange, onThemeColorChange]);

  useEffect(() => {
    const newToggle = async (value?: ColorScheme) => {
      if (!currentUser) return;

      const newTheme = value || (userData?.settings?.theme === 'dark' ? 'light' : 'dark');
      
      const settings: UserSettings = {
        theme: newTheme,
        themeColor: userData?.settings?.themeColor || 'red',
        notifications: userData?.settings?.notifications ?? true
      };
      
      await saveUserSettings(currentUser, settings);
      onColorSchemeChange(newTheme);
    };

    globalThis.toggleColorScheme = newToggle;
  }, [userData, currentUser, onColorSchemeChange]);

  const handleThemeColorChange = async (color: ThemeColorType) => {
    if (!currentUser) return;

    const settings = {
      theme: userData?.settings?.theme || 'light',
      themeColor: color,
      notifications: userData?.settings?.notifications ?? true,
    };

    await saveUserSettings(currentUser, settings);
    onThemeColorChange(color);
  };

  return <>{children}</>;
}
