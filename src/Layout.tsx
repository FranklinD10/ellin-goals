import { IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from './contexts/ThemeContext';

// ...existing imports...

export default function Layout() {
  const { colorScheme, toggleColorScheme } = useTheme();
  
  // ...existing code...
  
  return (
    <IconButton
      sx={{ border: 1, borderColor: 'divider' }}
      onClick={() => toggleColorScheme()}
      color="inherit"
      size="large"
    >
      {colorScheme === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
  
  // ...rest of the code...
}
