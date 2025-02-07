import { collection, addDoc, getDocs, query, where, deleteDoc, doc, Timestamp, setDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { Habit, UserType, HabitLog } from '../types';

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
  const q = query(
    collection(db, 'habit_logs'),
    where('habit_id', '==', habitId),
    where('date', '>=', Timestamp.fromDate(startDate))
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as HabitLog));
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
