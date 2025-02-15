import { createTheme, ThemeOptions } from '@mui/material/styles';
import { ThemeColorType } from '../types/user';

const themes: Record<ThemeColorType, { color: string; label: string }> = {
  red: { color: '#FF4B4B', label: 'Red' },
  pink: { color: '#FF69B4', label: 'Pink' },
  purple: { color: '#9C27B0', label: 'Purple' },
  blue: { color: '#2196F3', label: 'Blue' },
  green: { color: '#4CAF50', label: 'Green' },
  yellow: { color: '#FFC107', label: 'Yellow' },
};

export const getThemeOptions = (
  mode: 'light' | 'dark',
  themeColor: ThemeColorType
): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: themes[themeColor].color,
    },
    background: {
      default: mode === 'dark' ? '#1A1B1E' : '#F8F9FA',
      paper: mode === 'dark' ? '#25262B' : '#FFFFFF',
    },
    text: {
      primary: mode === 'dark' ? '#C1C2C5' : '#141517',
      secondary: mode === 'dark' ? '#909296' : '#868E96',
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        size: 'large',
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid',
          borderColor: mode === 'dark' ? '#2C2E33' : '#E9ECEF',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    button: {
      textTransform: 'none',
    },
  },
});

export const createMuiTheme = (mode: 'light' | 'dark', themeColor: ThemeColorType) => {
  return createTheme(getThemeOptions(mode, themeColor));
};

export { themes };