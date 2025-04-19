import { Theme } from '@mui/material';
import { ThemeColorType } from '../types/user';
import { createMuiTheme } from './mui-theme';

const themeCache = new Map<string, Theme>();

export function getCachedTheme(mode: 'light' | 'dark', themeColor: ThemeColorType): Theme {
  const key = `${mode}-${themeColor}`;
  if (!themeCache.has(key)) {
    themeCache.set(key, createMuiTheme(mode, themeColor));
  }
  return themeCache.get(key)!;
}

// Clear cache when window is hidden to prevent memory leaks
if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      themeCache.clear();
    }
  });
}
