import { Timestamp } from 'firebase/firestore';
import { ThemeColorType } from './user';

export type UserType = 'El' | 'Lin';

export interface UserData {
  displayName: string;
  email: string;
  uid: string;
  settings: UserSettings;  // Updated to use UserSettings type
  lastLogin: Date;
  createdAt: Date;
}

export interface User {
  id: string;
  display_name: string;
  username: string;
  uid: string;
}

export interface Habit {
  id: string;
  name: string;
  category: string;
  user_id: string;
  created_at: Timestamp;
  deleted?: boolean;
  deletedAt?: Timestamp;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: UserType;
  date: Timestamp;
  completed: boolean;
  updatedAt: Timestamp;
  deleted?: boolean;
}

export interface UserStats {
  weeklyCompletion: number;
  totalDays: number;
  bestHabit: string;
  currentStreak: number;
}

export interface DailyCheck {
  date: string;
  completed: boolean;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  themeColor: ThemeColorType;
  notifications: boolean;
}
