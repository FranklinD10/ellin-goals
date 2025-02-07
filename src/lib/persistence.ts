declare global {
  interface Window {
    localStorage: Storage;
  }
}

import { Habit, DailyCheck } from '../types';

const STORAGE_KEYS = {
  HABITS: 'ellin-goals:habits',
  CHECKS: 'ellin-goals:checks',
  USER: 'ellin-goals:current-user'
};

export const persistHabits = (habits: Habit[]) => {
  localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
};

export const loadHabits = (): Habit[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.HABITS);
  return stored ? JSON.parse(stored) : [];
};

export const persistChecks = (checks: DailyCheck[]) => {
  localStorage.setItem(STORAGE_KEYS.CHECKS, JSON.stringify(checks));
};

export const loadChecks = (): DailyCheck[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.CHECKS);
  return stored ? JSON.parse(stored) : [];
};

export const syncWithFirestore = async () => {
  // Implement sync logic here when online
};
