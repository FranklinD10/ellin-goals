import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { ColorScheme } from '@mantine/core';
import { useUser } from './UserContext';
import { saveUserSettings } from '../lib/firestore';
import { ThemeColorType, UserSettings } from '../types/user';
import { debounce } from 'lodash';
import { hasSettingsChanged, getLocalSettings, setLocalSettings } from '../utils/syncUtils';

interface ThemeContextType {
  colorScheme: ColorScheme;
  themeColor: ThemeColorType;
  toggleColorScheme: (value?: ColorScheme) => void;
  setThemeColor: (color: ThemeColorType) => void;
  isSelected: (color: ThemeColorType) => boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { userData, currentUser } = useUser();
  const [colorScheme, setColorScheme] = useState<ColorScheme>(getLocalSettings().theme as ColorScheme);
  const [themeColor, setThemeColor] = useState<ThemeColorType>(getLocalSettings().themeColor as ThemeColorType);
  const [lastSyncedSettings, setLastSyncedSettings] = useState<UserSettings | null>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout>();

  // Optimized Firestore sync
  const syncToFirestore = useCallback(async (settings: UserSettings) => {
    if (!currentUser || !hasSettingsChanged(lastSyncedSettings, settings)) return;

    try {
      await saveUserSettings(currentUser, settings);
      setLastSyncedSettings(settings);
    } catch (error) {
      console.error('Failed to sync settings:', error);
      // Revert to last known good settings if sync fails
      if (lastSyncedSettings) {
        setColorScheme(lastSyncedSettings.theme);
        setThemeColor(lastSyncedSettings.themeColor);
      }
    }
  }, [currentUser, lastSyncedSettings]);

  const handleThemeChange = useCallback((newColor: ThemeColorType) => {
    // Update local state immediately
    setThemeColor(newColor);
    setLocalSettings({ themeColor: newColor });
    
    // Prepare settings for sync
    const newSettings = {
      theme: colorScheme,
      themeColor: newColor,
      notifications: userData?.settings?.notifications ?? true,
    };
    
    // Only sync if there are actual changes
    if (hasSettingsChanged(lastSyncedSettings, newSettings)) {
      syncToFirestore(newSettings);
    }
  }, [colorScheme, userData, lastSyncedSettings, syncToFirestore]);

  const handleColorScheme = useCallback((value?: ColorScheme) => {
    const newScheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
    
    // Update local state immediately
    setColorScheme(newScheme);
    setLocalSettings({ theme: newScheme });
    
    // Clear any pending sync
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Prepare settings for sync
    const newSettings = {
      theme: newScheme,
      themeColor,
      notifications: userData?.settings?.notifications ?? true,
    };

    // Debounce the sync operation
    syncTimeoutRef.current = setTimeout(() => {
      syncToFirestore(newSettings);
    }, 1000);
  }, [colorScheme, themeColor, userData, syncToFirestore]);

  // Initial sync from Firestore with optimization
  useEffect(() => {
    if (userData?.settings) {
      setColorScheme(userData.settings.theme);
      setThemeColor(userData.settings.themeColor);
      setLocalSettings({
        theme: userData.settings.theme,
        themeColor: userData.settings.themeColor
      });
      setLastSyncedSettings(userData.settings);
    }
  }, [userData]);

  const isSelected = useCallback((color: ThemeColorType) => themeColor === color, [themeColor]);

  return (
    <ThemeContext.Provider
      value={{
        colorScheme,
        themeColor,
        toggleColorScheme: handleColorScheme,
        setThemeColor: handleThemeChange,
        isSelected,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
