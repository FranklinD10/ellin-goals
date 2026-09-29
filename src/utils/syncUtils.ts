import isEqual from 'lodash/isEqual';
import { themes } from './theme-constants';

export function hasSettingsChanged(oldSettings: any, newSettings: any): boolean {
  return !isEqual(oldSettings, newSettings);
}

export function getLocalSettings() {
  const storedTheme = localStorage.getItem('theme');
  const theme = (storedTheme === 'light' || storedTheme === 'dark') ? storedTheme : 'light';

  const storedThemeColor = localStorage.getItem('themeColor');
  const themeColor = storedThemeColor && themes[storedThemeColor as keyof typeof themes] ? storedThemeColor : 'red';

  return {
    theme,
    themeColor,
    notifications: localStorage.getItem('notifications') !== 'false'
  };
}

export function setLocalSettings(settings: Record<string, any>) {
  Object.entries(settings).forEach(([key, value]) => {
    localStorage.setItem(key, String(value));
  });
}
