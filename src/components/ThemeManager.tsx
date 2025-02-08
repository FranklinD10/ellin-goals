import { useEffect } from 'react';
import { useMantineColorScheme } from '@mantine/core';
import { useUser } from '../contexts/UserContext';
import { saveUserSettings } from '../lib/firestore';

interface ThemeManagerProps {
  children: React.ReactNode;
  onColorSchemeChange: (scheme: 'light' | 'dark') => void;
  onThemeColorChange: (color: string) => void;
}

export default function ThemeManager({ children, onColorSchemeChange, onThemeColorChange }: ThemeManagerProps) {
  const { userData, currentUser } = useUser();

  useEffect(() => {
    if (userData?.settings) {
      onColorSchemeChange(userData.settings.theme);
      onThemeColorChange(userData.settings.themeColor);
    }
  }, [userData, onColorSchemeChange, onThemeColorChange]);

  return <>{children}</>;
}
