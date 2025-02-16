import { Box, IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '../contexts/ThemeContext';
import UserSwitcher from './UserSwitcher';
import { useUser } from '../contexts/UserContext';
import { saveUserSettings } from '../lib/firestore';
import { themes } from '../utils/theme-constants';
import { ThemeColorType } from '../types/user';

export default function ThemeSelector() {
  const { userData, currentUser } = useUser();
  const { colorScheme, toggleColorScheme, setThemeColor, isSelected } = useTheme();

  const handleThemeChange = async (color: ThemeColorType) => {
    if (!currentUser) return;
    setThemeColor(color);
    
    const settings = {
      theme: userData?.settings?.theme || 'light',
      themeColor: color,
      notifications: userData?.settings?.notifications ?? true,
    };

    await saveUserSettings(currentUser, settings);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', maxWidth: '300px' }}>
        {(Object.entries(themes) as [ThemeColorType, { color: string; label: string }][]).map(([key, { color, label }]) => (
          <Tooltip key={key} title={label}>
            <IconButton
              sx={{ 
                backgroundColor: color,
                border: isSelected(key) ? `3px solid ${themes[key].color}` : '3px solid transparent',
                transform: isSelected(key) ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.2s ease',
                minWidth: 32,
                minHeight: 32,
                width: 32,
                height: 32,
                '&:hover': {
                  backgroundColor: color,
                  transform: 'scale(1.1)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                },
              }}
              onClick={() => handleThemeChange(key)}
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
