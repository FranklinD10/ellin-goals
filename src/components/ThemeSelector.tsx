import { Box, IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '../contexts/ThemeContext';
import UserSwitcher from './UserSwitcher';
import { useUser } from '../contexts/UserContext';
import { saveUserSettings } from '../lib/firestore';

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
  const { colorScheme, toggleColorScheme } = useTheme();

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
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {Object.entries(themes).map(([key, { color, label }]) => (
          <Tooltip key={key} title={label}>
            <IconButton
              sx={{ backgroundColor: color }}
              onClick={() => handleThemeChange(key as keyof typeof themes)}
              color={userData?.settings?.themeColor === key ? 'primary' : 'default'}
            />
          </Tooltip>
        ))}
      </Box>
      <Tooltip title={`Switch to ${colorScheme === 'dark' ? 'light' : 'dark'} mode`}>
        <IconButton 
          onClick={() => toggleColorScheme()} 
          color="inherit"
          sx={{ border: 1, borderColor: 'divider' }}
        >
          {colorScheme === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Tooltip>
      <UserSwitcher />
    </Box>
  );
}
