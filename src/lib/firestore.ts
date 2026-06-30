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
import { ClientIndexManager } from '../utils/clientIndexManager';

export const addHabit = async (habit: Omit<Habit, 'id' | 'created_at'>) => {
  if (!habit.user_id || typeof habit.user_id !== 'string' || habit.user_id.length > 128) {
    throw new Error('Invalid userId');
  }
  
  // Defensive validation against excessively large entries
  if (habit.name && habit.name.length > 100) {
    throw new Error('Habit name exceeds maximum allowed length');
  }
  if (habit.category && habit.category.length > 50) {
    throw new Error('Habit category exceeds maximum allowed length');
  }

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
    if (import.meta.env.DEV) { console.error('Error adding habit', error); }
    throw new Error('An error occurred while communicating with the database.');
  }
};

export const getUserHabits = async (userId: UserType): Promise<Habit[]> => {
  if (!userId || typeof userId !== 'string' || userId.length > 128) {
    throw new Error('Invalid userId');
  }
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
    if (import.meta.env.DEV) { console.error('Error fetching habits', error); }
    throw new Error('An error occurred while communicating with the database.');
  }
};

export const getTodayLogs = async (userId: UserType): Promise<HabitLog[]> => {
  if (!userId || typeof userId !== 'string' || userId.length > 128) {
    throw new Error('Invalid userId');
  }
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  // First, get local unsynced logs
  const unsyncedLogs = Object.entries(localStorage)
    .filter(([key]) => key.startsWith('habit_log_'))
    .map(([_, value]) => JSON.parse(value));

  try {
    const firebaseLogs = await ClientIndexManager.executeQueryWithFallback<HabitLog>(
      'habit_logs',
      [
        where('user_id', '==', userId),
        where('date', '>=', Timestamp.fromDate(todayStart)),
        where('date', '<=', Timestamp.fromDate(todayEnd)),
        where('deleted', '!=', true),
        limit(1000)
      ],
      [where('user_id', '==', userId), limit(1000)],
      (log) => {
        if (!log.date) return false;
        const logDate = (log.date as Timestamp).toDate();
        return logDate >= todayStart && 
               logDate <= todayEnd && 
               !log.deleted;
      }
    );

    // Merge Firebase logs with unsynced local logs, preferring local versions
    const allLogs = [...firebaseLogs];
    unsyncedLogs.forEach(localLog => {
      const index = allLogs.findIndex(log => 
        log.habit_id === localLog.habit_id && 
        log.date.seconds === localLog.date.seconds
      );
      if (index >= 0) {
        allLogs[index] = localLog;
      } else {
        allLogs.push(localLog);
      }
    });

    return allLogs;
  } catch (error) {
    if (import.meta.env.DEV) { console.error('Error fetching logs', error); }
    // Return unsynced logs if Firebase fetch fails
    return unsyncedLogs;
  }
};

export const getHabitLogs = async (habitId: string, userId: string, startDate: Date) => {
  if (!habitId || typeof habitId !== 'string' || habitId.length > 128) {
    throw new Error('Invalid habitId');
  }
  if (!userId || typeof userId !== 'string' || userId.length > 128) {
    throw new Error('Invalid userId');
  }
  const primaryConstraints = [
    where('habit_id', '==', habitId),
    where('user_id', '==', userId),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('deleted', '!=', true),
    orderBy('date', 'desc'),
    limit(1000)
  ];

  const fallbackConstraints = [
    where('habit_id', '==', habitId),
    where('user_id', '==', userId),
    limit(1000)
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
        return logDate >= startDate && !isDeleted && log.user_id === userId;
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
  if (!habitId || typeof habitId !== 'string' || habitId.length > 128) {
    throw new Error('Invalid habitId');
  }
  if (!userId || typeof userId !== 'string' || userId.length > 128) {
    throw new Error('Invalid userId');
  }

  // Security Concern: IDOR - Authorize mutation by verifying the habit belongs to the user
  const habitRef = doc(db, 'habits', habitId);
  const habitSnap = await getDoc(habitRef);
  if (!habitSnap.exists()) {
    throw new Error('Habit not found');
  }
  if (habitSnap.data().user_id !== userId) {
    throw new Error('Unauthorized');
  }

  const localDate = startOfDay(date);
  const docId = `${habitId}_${localDate.toISOString().split('T')[0]}_${userId}`;
  
  const logData = {
    habit_id: habitId,
    user_id: userId,
    date: Timestamp.fromDate(localDate),
    completed,
    updatedAt: Timestamp.now(),
    synced: false // Add sync status field
  };

  try {
    // First, write to local storage as backup
    const localKey = `habit_log_${docId}`;
    localStorage.setItem(localKey, JSON.stringify(logData));

    // Then attempt Firestore write
    await setDoc(doc(db, 'habit_logs', docId), {
      ...logData,
      synced: true
    }, { merge: true });

    // Clear local backup after successful sync
    localStorage.removeItem(localKey);
    
    return { success: true, docId, logData };
  } catch (error) {
    if (import.meta.env.DEV) { console.error('Error logging habit', error); }
    throw new Error('An error occurred while communicating with the database.');
  }
};

export const deleteHabit = async (habitId: string, userId: string) => {
  if (!habitId || typeof habitId !== 'string' || habitId.length > 128) {
    throw new Error('Invalid habitId');
  }
  if (!userId || typeof userId !== 'string' || userId.length > 128) {
    throw new Error('Invalid userId');
  }

  const habitRef = doc(db, 'habits', habitId);
  const habitSnap = await getDoc(habitRef);

  if (!habitSnap.exists()) {
    throw new Error('Habit not found');
  }

  if (habitSnap.data().user_id !== userId) {
    throw new Error('Unauthorized');
  }

  const batch = writeBatch(db);
  
  // Mark habit as deleted instead of actually deleting it
  batch.update(habitRef, { 
    deleted: true,
    deletedAt: Timestamp.now() 
  });
  
  // Delete logs in chunks of 400 to avoid exceeding the 500 operation limit per batch
  const logsQuery = query(collection(db, 'habit_logs'), where('habit_id', '==', habitId), where('user_id', '==', userId));
  const snapshot = await getDocs(logsQuery);
  
  // Create chunks of 400 docs
  const chunks = [];
  for (let i = 0; i < snapshot.docs.length; i += 400) {
    chunks.push(snapshot.docs.slice(i, i + 400));
  }

  if (chunks.length === 0) {
    await batch.commit();
    return;
  }

  for (let i = 0; i < chunks.length; i++) {
    const currentBatch = i === 0 ? batch : writeBatch(db);
    chunks[i].forEach((doc) => {
      currentBatch.update(doc.ref, { deleted: true });
    });
    await currentBatch.commit();
  }
};

export const getAnalytics = async (userId: string) => {
  if (!userId || typeof userId !== 'string' || userId.length > 128) {
    throw new Error('Invalid userId');
  }
  try {
    const q = query(
      collection(db, 'analytics'),
      where('user_id', '==', userId)
    );
    const snapshot = await getDocs(q);
    const analytics = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return analytics;
  } catch (error) {
    if (import.meta.env.DEV) { console.error('Error fetching analytics', error); }
    throw new Error('An error occurred while communicating with the database.');
  }
};

export function subscribeToHabits(userId: string, callback: (habits: Habit[]) => void) {
  if (!userId || typeof userId !== 'string' || userId.length > 128) {
    throw new Error('Invalid userId');
  }
  // Security Concern: IDOR and DoS - Fixed user_id field for authorization and added limit constraint
  const q = query(
    collection(db, 'habits'),
    where('user_id', '==', userId),
    where('deleted', '==', false),
    limit(50)
  );
  return onSnapshot(q, (snapshot) => {
    const habits = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Habit[];
    callback(habits);
  });
}

export const saveUserSettings = async (userId: string, settings: UserSettings) => {
  if (!userId || typeof userId !== 'string' || userId.length > 128) {
    throw new Error('Invalid userId');
  }
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
    if (import.meta.env.DEV) { console.error('Error saving user settings', error); }
    throw new Error('An error occurred while communicating with the database.');
  }
};

export const getUserSettings = async (userId: string) => {
  if (!userId || typeof userId !== 'string' || userId.length > 128) {
    throw new Error('Invalid userId');
  }
  try {
    const docRef = doc(db, 'user_settings', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    if (import.meta.env.DEV) { console.error('Error fetching user settings', error); }
    throw new Error('An error occurred while communicating with the database.');
  }
};

export const getUserData = async (userId: UserType): Promise<UserData | null> => {
  if (!userId || typeof userId !== 'string' || userId.length > 128) {
    throw new Error('Invalid userId');
  }
  try {
    const userRef = doc(db, 'users', `${userId.toLowerCase()}-default`);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  } catch (error) {
    if (import.meta.env.DEV) { console.error('Error fetching user data', error); }
    return null;
  }
};
