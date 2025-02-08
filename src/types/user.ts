export type ThemeColorType = 'red' | 'pink' | 'purple' | 'blue' | 'green' | 'yellow';

export interface UserSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  themeColor: ThemeColorType;
}
