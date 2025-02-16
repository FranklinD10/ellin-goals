import { ThemeColorType } from '../types/user';

export const themes: Record<ThemeColorType, { color: string; label: string }> = {
  red: { color: '#FF4B4B', label: 'Red' },
  pink: { color: '#FF69B4', label: 'Pink' },
  purple: { color: '#9C27B0', label: 'Purple' },
  blue: { color: '#2196F3', label: 'Blue' },
  green: { color: '#4CAF50', label: 'Green' },
  yellow: { color: '#FFC107', label: 'Yellow' },
  cyan: { color: '#00BCD4', label: 'Cyan' },
  teal: { color: '#009688', label: 'Teal' },
  indigo: { color: '#3F51B5', label: 'Indigo' },
  orange: { color: '#FF9800', label: 'Orange' },
  deepPurple: { color: '#673AB7', label: 'Deep Purple' },
  blueGrey: { color: '#607D8B', label: 'Blue Grey' }
} as const;

export const getThemeColor = (color: ThemeColorType) => themes[color].color;
