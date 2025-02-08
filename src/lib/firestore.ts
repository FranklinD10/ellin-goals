import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  limit,
  deleteDoc, 
  doc, 
  Timestamp, 
  setDoc, 
  writeBatch, 
  onSnapshot, 
  getDoc 
} from 'firebase/firestore';
import { db } from './firebase';
import { Habit, UserType, HabitLog, UserData, UserSettings } from '../types';
import { startOfDay, endOfDay } from 'date-fns';
import axiosRetry from 'axios-retry';
import axios from 'axios';
import { ClientIndexManager } from '../utils/clientIndexManager';

// Use axiosRetry instead of destructuring retry
axiosRetry(axios, { retries: 3 });

// Add this function to handle index creation
async function handleIndexError(error: any, collection: string, fields: string[]) {
  if (error.code === 'failed-precondition' && error.message?.includes('index')) {
    try {
      await axios.post('/api/createIndex', { collection, fields });
      // Wait a bit for the index to be created
      await new Promise(resolve => setTimeout(resolve, 2000));
      return true;
    } catch (indexError) {
      console.error('Failed to create index:', indexError);
      return false;
    }
  }
  return false;
}

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
  const q = query(
    collection(db, 'habits'),
    where('user_id', '==', userId),
    where('deleted', '==', false),
    orderBy('created_at', 'desc'),
    // Add limit to prevent loading too many habits at once
    limit(10)
  );

  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at || Timestamp.now()
    })) as Habit[];
  } catch (error) {
    console.error('Error fetching habits:', error);
    throw error;
  }
};

export const getTodayLogs = async (userId: UserType): Promise<HabitLog[]> => {
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  const primaryConstraints = [
    where('user_id', '==', userId),
    where('date', '>=', Timestamp.fromDate(todayStart)),
    where('date', '<=', Timestamp.fromDate(todayEnd)),
    where('deleted', '!=', true)
  ];

  // Simpler fallback query that doesn't require composite index
  const fallbackConstraints = [
    where('user_id', '==', userId)
  ];

  try {
    return await ClientIndexManager.executeQueryWithFallback<HabitLog>(
      'habit_logs',
      primaryConstraints,
      fallbackConstraints,
      (log) => {
        if (!log.date) return false;
        const logDate = (log.date as Timestamp).toDate();
        return (
          logDate >= todayStart &&
          logDate <= todayEnd &&
          !log.deleted
        );
      }
    );
  } catch (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
};

export const getHabitLogs = async (habitId: string, startDate: Date) => {
  const primaryConstraints = [
    where('habit_id', '==', habitId),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('deleted', '!=', true),
    orderBy('date', 'desc')
  ];

  const fallbackConstraints = [
    where('habit_id', '==', habitId)
  ];

  try {
    return await ClientIndexManager.executeQueryWithFallback<HabitLog>(
      'habit_logs',
      primaryConstraints,
      fallbackConstraints,
      (log) => {
        if (!log.date) return false;
        const logDate = (log.date as Timestamp).toDate();
        const isDeleted = log.deleted === true;
        return logDate >= startDate && !isDeleted;
      }
    );
  } catch (error) {
    return [];
  }
};

export const logHabitCompletion = async (
  habitId: string, 
  userId: UserType, 
  date: Date, 
  completed: boolean
) => {
  const todayStart = startOfDay(date);
  const docId = `${habitId}_${todayStart.toISOString().split('T')[0]}_${userId}`;
  
  const logData = {
    habit_id: habitId,
    user_id: userId,
    date: Timestamp.fromDate(todayStart),
    completed,
    updatedAt: Timestamp.now()
  };

  console.debug('Saving habit log:', { docId, logData });
  
  try {
    await setDoc(doc(db, 'habit_logs', docId), logData, { merge: true });
    return true;
  } catch (error) {
    console.error('Error logging habit:', error);
    throw error;
  }
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
