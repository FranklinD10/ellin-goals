import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useUser } from './UserContext';
import { saveUserSettings } from '../lib/firestore';
import { ThemeColorType, UserSettings } from '../types/user';
import { Theme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { getLocalSettings, setLocalSettings, hasSettingsChanged } from '../utils/syncUtils';
import { createMuiTheme } from '../theme/mui-theme';

interface ThemeContextType {
  colorScheme: 'light' | 'dark';
  themeColor: ThemeColorType;
  toggleColorScheme: (value?: 'light' | 'dark') => void;
  setThemeColor: (color: ThemeColorType) => void;
  isSelected: (color: ThemeColorType) => boolean;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType>({
  colorScheme: 'light',
  themeColor: 'red',
  toggleColorScheme: () => {},
  setThemeColor: () => {},
  isSelected: () => false,
  theme: createMuiTheme('light', 'red')
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { userData, currentUser } = useUser();
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(
    getLocalSettings().theme as 'light' | 'dark' || 'light'
  );
  const [themeColor, setThemeColor] = useState<ThemeColorType>(
    getLocalSettings().themeColor as ThemeColorType || 'red'
  );
  const [lastSyncedSettings, setLastSyncedSettings] = useState<UserSettings | null>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout>();

  const theme = createMuiTheme(colorScheme, themeColor);

  // Optimized Firestore sync
  const syncToFirestore = useCallback(async (settings: UserSettings) => {
    if (!currentUser || !hasSettingsChanged(lastSyncedSettings, settings)) return;

    try {
      await saveUserSettings(currentUser, settings);
      setLastSyncedSettings(settings);
    } catch (error) {
      console.error('Failed to sync settings:', error);
      if (lastSyncedSettings) {
        setColorScheme(lastSyncedSettings.theme);
        setThemeColor(lastSyncedSettings.themeColor);
      }
    }
  }, [currentUser, lastSyncedSettings]);

  const handleThemeChange = useCallback((newColor: ThemeColorType) => {
    setThemeColor(newColor);
    setLocalSettings({ themeColor: newColor });
    
    const newSettings = {
      theme: colorScheme,
      themeColor: newColor,
      notifications: userData?.settings?.notifications ?? true,
    };
    
    if (hasSettingsChanged(lastSyncedSettings, newSettings)) {
      syncToFirestore(newSettings);
    }
  }, [colorScheme, userData, lastSyncedSettings, syncToFirestore]);

  const handleColorScheme = useCallback((value?: 'light' | 'dark') => {
    const newScheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
    
    setColorScheme(newScheme);
    setLocalSettings({ theme: newScheme });
    
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    const newSettings = {
      theme: newScheme,
      themeColor,
      notifications: userData?.settings?.notifications ?? true,
    };

    syncTimeoutRef.current = setTimeout(() => {
      syncToFirestore(newSettings);
    }, 1000);
  }, [colorScheme, themeColor, userData, syncToFirestore]);

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

  // Update CSS variable for global theming
  useEffect(() => {
    document.documentElement.style.setProperty('--theme-color', theme.palette.primary.main);
  }, [theme]);

  const isSelected = useCallback((color: ThemeColorType) => themeColor === color, [themeColor]);

  const contextValue = {
    colorScheme,
    themeColor,
    toggleColorScheme: handleColorScheme,
    setThemeColor: handleThemeChange,
    isSelected,
    theme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
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
