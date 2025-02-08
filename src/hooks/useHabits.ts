import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Habit, UserType } from '../types';

export function useHabits(userId: UserType) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'habits'),
      where('user_id', '==', userId),
      where('deleted', '==', false),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const habitsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Habit[];
        setHabits(habitsList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching habits:', error);
        setError(error as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { habits, loading, error };
}
