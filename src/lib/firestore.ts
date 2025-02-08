import { collection, addDoc, getDocs, query, where, deleteDoc, doc, Timestamp, setDoc, writeBatch, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Habit, UserType, HabitLog, UserData, UserSettings } from '../types';
import { startOfDay } from 'date-fns';
import axiosRetry from 'axios-retry';
import axios from 'axios';

// Use axiosRetry instead of destructuring retry
axiosRetry(axios, { retries: 3 });

export const addHabit = async (habit: Omit<Habit, 'id' | 'created_at'>) => {
  if (!habit.user_id) throw new Error('user_id is undefined');
  
  try {
    const docRef = await addDoc(collection(db, 'habits'), {
      ...habit,
      created_at: Timestamp.now(),
      deleted: false // Add this field explicitly
    });

    // Return the complete habit object
    return { 
      id: docRef.id, 
      ...habit, 
      created_at: Timestamp.now() 
    } as Habit;
  } catch (error) {
    console.error('Error adding habit:', error);
    throw error;
  }
};

export const getUserHabits = async (userId: UserType): Promise<Habit[]> => {
  try {
    const q = query(
      collection(db, 'habits'),
      where('user_id', '==', userId),
      where('deleted', '==', false)  // Explicitly check for non-deleted habits
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at || Timestamp.now()
    })) as Habit[];
  } catch (error: any) {
    // Check for missing index error
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.error('Missing Firestore index:', error);
      // Fallback to simple query without deleted filter
      const fallbackQuery = query(
        collection(db, 'habits'),
        where('user_id', '==', userId)
      );
      const snapshot = await getDocs(fallbackQuery);
      return snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          created_at: doc.data().created_at || Timestamp.now()
        }))
        .filter(habit => !habit.deleted) as Habit[]; // Filter in memory as fallback
    }
    throw error;
  }
};

export const getHabitLogs = async (habitId: string, startDate: Date) => {
  try {
    const q = query(
      collection(db, 'habit_logs'),
      where('habit_id', '==', habitId),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('deleted', '!=', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as HabitLog));
  } catch (error) {
    console.warn(`Error getting logs for habit ${habitId}:`, error);
    return []; // Return empty array instead of throwing
  }
};

export const logHabitCompletion = async (
  habitId: string, 
  userId: UserType, 
  date: Date, 
  completed: boolean
) => {
  const retries = 3;
  const attempt = async (retryCount: number) => {
    try {
      const startDay = startOfDay(date);
      const dateStr = startDay.toISOString().split('T')[0];
      const docId = `${habitId}_${dateStr}_${userId}`;
      await setDoc(doc(db, 'habit_logs', docId), {
        habit_id: habitId,
        userId,
        date: Timestamp.fromDate(startDay),
        completed,
        updatedAt: Timestamp.now()
      }, { merge: true });
    } catch (error) {
      if (retryCount < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return attempt(retryCount + 1);
      }
      throw error;
    }
  };
  return attempt(0);
};

export const deleteHabit = async (habitId: string) => {
  const batch = writeBatch(db);
  
  // Mark habit as deleted instead of actually deleting it
  const habitRef = doc(db, 'habits', habitId);
  batch.update(habitRef, { 
    deleted: true,
    deletedAt: Timestamp.now() 
  });
  
  // Optionally, mark all related logs as deleted too
  const logsQuery = query(collection(db, 'habit_logs'), where('habit_id', '==', habitId));
  const snapshot = await getDocs(logsQuery);
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { deleted: true });
  });
  
  await batch.commit();
};

export const getAnalytics = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'analytics'));
    const analytics = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return analytics;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};

export function subscribeToHabits(userId: string, callback: (habits: Habit[]) => void) {
  const q = query(collection(db, 'habits'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const habits = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Habit[];
    callback(habits);
  });
}

export const saveUserSettings = async (userId: string, settings: UserSettings) => {
  try {
    const userDocRef = doc(db, 'users', `${userId.toLowerCase()}-default`);
    // First, check if the document exists
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      // Update only the settings field
      await setDoc(userDocRef, { settings }, { merge: true });
    } else {
      // Create a new user document with default values
      await setDoc(userDocRef, {
        displayName: userId,
        email: `${userId.toLowerCase()}@example.com`,
        uid: `${userId.toLowerCase()}-default`,
        settings,
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error saving user settings:', error);
    throw error;
  }
};

export const getUserSettings = async (userId: string) => {
  const docRef = doc(db, 'user_settings', userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const getUserData = async (userId: UserType): Promise<UserData | null> => {
  try {
    const userRef = doc(db, 'users', `${userId.toLowerCase()}-default`);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};
