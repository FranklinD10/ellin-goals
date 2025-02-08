import { useEffect, useRef } from 'react';
import { useMantineColorScheme, ColorScheme } from '@mantine/core';
import { useUser } from '../contexts/UserContext';
import { saveUserSettings } from '../lib/firestore';
import { UserSettings } from '../types';

interface ThemeManagerProps {
  children: React.ReactNode;
  onColorSchemeChange: (colorScheme: ColorScheme) => void;
}

export default function ThemeManager({ children, onColorSchemeChange }: ThemeManagerProps) {
  const { toggleColorScheme } = useMantineColorScheme();
  const { userData, currentUser } = useUser();
  const toggleColorSchemeRef = useRef(toggleColorScheme);

  useEffect(() => {
    if (userData?.settings?.theme) {
      onColorSchemeChange(userData.settings.theme);
    }
  }, [userData, onColorSchemeChange]);

  // Override the default toggleColorScheme
  useEffect(() => {
    const newToggle = async (value?: ColorScheme) => {
      const currentTheme = userData?.settings?.theme || 'light';
      const newTheme = value || (currentTheme === 'dark' ? 'light' : 'dark');
      
      const settings: UserSettings = {
        theme: newTheme,
        notifications: userData?.settings?.notifications ?? true
      };
      
      await saveUserSettings(currentUser, settings);
      onColorSchemeChange(newTheme);
    };

    toggleColorSchemeRef.current = newToggle;
  }, [userData, currentUser, onColorSchemeChange]);

  return <>{children}</>;
}
