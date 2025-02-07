import { Timestamp } from 'firebase/firestore';

export type UserType = 'El' | 'Lin';

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
}

export interface HabitLog {
  id: string;
  habit_id: string;
  date: Timestamp;
  completed: boolean;
  userId: string;
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
