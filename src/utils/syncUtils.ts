import isEqual from 'lodash/isEqual';

export function hasSettingsChanged(oldSettings: any, newSettings: any): boolean {
  return !isEqual(oldSettings, newSettings);
}

export function getLocalSettings() {
  return {
    theme: localStorage.getItem('theme') || 'light',
    themeColor: localStorage.getItem('themeColor') || 'red',
    notifications: localStorage.getItem('notifications') !== 'false'
  };
}

export function setLocalSettings(settings: Record<string, any>) {
  Object.entries(settings).forEach(([key, value]) => {
    localStorage.setItem(key, String(value));
  });
}
