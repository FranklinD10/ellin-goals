import { collection, addDoc, getDocs, query, where, deleteDoc, doc, Timestamp, setDoc, writeBatch, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Habit, UserType, HabitLog, UserData, UserSettings } from '../types';

export const addHabit = async (habit: Omit<Habit, 'id' | 'created_at'>) => {
  if (!habit.user_id) throw new Error('user_id is undefined');
  
  const docRef = await addDoc(collection(db, 'habits'), {
    ...habit,
    created_at: Timestamp.now(),
  });
  return { ...habit, id: docRef.id, created_at: Timestamp.now() };
};

export const getUserHabits = async (userId: UserType): Promise<Habit[]> => {
  try {
    const q = query(
      collection(db, 'habits'),
      where('user_id', '==', userId)
    );
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

export const getHabitLogs = async (habitId: string, startDate: Date) => {
  try {
    const q = query(
      collection(db, 'habit_logs'),
      where('habit_id', '==', habitId),
      where('date', '>=', Timestamp.fromDate(startDate))
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as HabitLog));
  } catch (error) {
    console.warn(`Error getting logs for habit ${habitId}:`, error);
    return []; // Return empty array instead of throwing
  }
};

export const logHabitCompletion = async (habitId: string, userId: UserType, date: Date) => {
  try {
    const docId = `${habitId}_${date.toISOString().split('T')[0]}`;
    await setDoc(doc(db, 'habit_logs', docId), {
      habitId,
      userId,
      date: Timestamp.fromDate(date),
      completed: true,
      updatedAt: Timestamp.now()
    }, { merge: true });
  } catch (error) {
    console.error('Error logging habit completion:', error);
  }
};

export const deleteHabit = async (habitId: string) => {
  // Delete habit
  await deleteDoc(doc(db, 'habits', habitId));
  
  // Delete associated logs
  const logsQuery = query(collection(db, 'habit_logs'), where('habit_id', '==', habitId));
  const snapshot = await getDocs(logsQuery);
  
  const batch = writeBatch(db);
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
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
