import { useEffect, useState, useCallback, useRef } from 'react';
import { Card, Typography, Checkbox, Stack, Box, CircularProgress, Alert, Grid } from '@mui/material';
import { useUser } from '../contexts/UserContext';
import { getUserHabits, logHabitCompletion, getTodayLogs } from '../lib/firestore';
import { Habit } from '../types';
import StatsCard from '../components/StatsCard';
import CategoryBadge from '../components/CategoryBadge';
import { playCompletionSound, animateCompletion } from '../utils/effects';
import { AnimatePresence } from 'framer-motion';
import { AnimatedCard } from '../components/AnimatedCard';
import { isMobile } from 'react-device-detect';
import { useNotification } from '../contexts/NotificationContext';
import { PageTransition } from '../components/PageTransition';

export default function Dashboard() {
  const { currentUser, isTransitioning } = useUser();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completionRate, setCompletionRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedHabits, setCompletedHabits] = useState<Set<string>>(new Set());
  const optimisticUpdates = useRef(new Map<string, boolean>()).current;

  const loadData = useCallback(async () => {
    if (isTransitioning) return;

    try {
      setLoading(true);
      setError(null);

      const [userHabits, todayLogs] = await Promise.all([
        getUserHabits(currentUser),
        getTodayLogs(currentUser)
      ]);

      if (!isTransitioning) {
        const completedHabitIds = new Set(
          todayLogs
            .filter(log => log.completed)
            .map(log => log.habit_id)
        );
        setCompletedHabits(completedHabitIds);

        // Filter out completed habits
        const uncompletedHabits = userHabits.filter(
          habit => !completedHabitIds.has(habit.id)
        );
        setHabits(uncompletedHabits);
        
        if (userHabits.length > 0) {
          setCompletionRate((completedHabitIds.size / userHabits.length) * 100);
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
      if (!isTransitioning) {
        setError('Failed to load habits');
      }
    } finally {
      if (!isTransitioning) {
        setLoading(false);
      }
    }
  }, [currentUser, isTransitioning]);

  useEffect(() => {
    if (isTransitioning) {
      setHabits([]);
      setCompletedHabits(new Set());
      setCompletionRate(0);
      setLoading(true);
    } else {
      loadData();
    }
  }, [currentUser, isTransitioning, loadData]);

  const handleToggle = useCallback(async (habitId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const isCompleted = event.target.checked;
    const card = event.target.closest('.MuiCard-root');
    
    try {
      // Optimistically update UI
      optimisticUpdates.set(habitId, isCompleted);
      if (isCompleted) {
        setHabits(prev => prev.filter(h => h.id !== habitId));
        setCompletedHabits(prev => {
          const next = new Set(prev);
          next.add(habitId);
          return next;
        });
        
        if (card) {
          playCompletionSound();
          animateCompletion(card as HTMLElement);
        }
      }

      // Update completion rate optimistically
      setCompletionRate(prev => {
        const totalHabits = habits.length + completedHabits.size;
        const completedCount = isCompleted ? 
          completedHabits.size + 1 : 
          completedHabits.size;
        return (completedCount / totalHabits) * 100;
      });

      // Perform actual update
      const result = await logHabitCompletion(habitId, currentUser, new Date(), isCompleted);
      
      // Clear optimistic update after success
      optimisticUpdates.delete(habitId);
    } catch (error) {
      console.error('Error toggling habit:', error);
      
      // Revert optimistic update on error
      optimisticUpdates.delete(habitId);
      if (isCompleted) {
        setHabits(prev => [...prev, habits.find(h => h.id === habitId)!].sort((a, b) => 
          a.created_at.seconds - b.created_at.seconds
        ));
        setCompletedHabits(prev => {
          const next = new Set(prev);
          next.delete(habitId);
          return next;
        });
      }
      
      showNotification({
        title: 'Error',
        message: 'Failed to update habit. Please try again.',
        color: 'red'
      });
      
      await loadData();
    }
  }, [currentUser, habits, completedHabits.size, loadData]);

  const filterHabits = useCallback((allHabits: Habit[]) => {
    return allHabits.filter(habit => 
      !completedHabits.has(habit.id) && !optimisticUpdates.get(habit.id)
    );
  }, [completedHabits, optimisticUpdates]);

  useEffect(() => {
    if (!loading && !error) {
      setHabits(prev => filterHabits(prev));
    }
  }, [completedHabits, filterHabits, loading, error]);

  // Show loading state while transitioning or loading
  if (isTransitioning || loading) {
    return (
      <Stack spacing={2} sx={{ p: 2 }}>
        <Box sx={{ bgcolor: 'background.paper', height: 30, width: '40%', mb: 3, borderRadius: 1 }} />
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Box sx={{ bgcolor: 'background.paper', height: 90, borderRadius: 1 }} />
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ bgcolor: 'background.paper', height: 90, borderRadius: 1 }} />
          </Grid>
        </Grid>
        {Array(3).fill(0).map((_, i) => (
          <Box key={i} sx={{ bgcolor: 'background.paper', height: 80, borderRadius: 1, mb: 1 }} />
        ))}
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  }

  return (
    <PageTransition>
      <Stack spacing={2} sx={{ p: 2 }}>
        <Typography variant="h5" color="text.secondary">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <StatsCard 
              title="Completion Rate" 
              value={completionRate} 
            />
          </Grid>
          <Grid item xs={6}>
            <StatsCard 
              title="Remaining Habits" 
              value={habits.length} 
              suffix="" 
            />
          </Grid>
        </Grid>

        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <Box key={i} sx={{ bgcolor: 'background.paper', height: 80, borderRadius: 1, mb: 1 }} />
          ))
        ) : habits.length === 0 ? (
          <AnimatedCard>
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {completedHabits.size > 0 
                  ? "All habits completed for today! 🎉" 
                  : "No habits added yet. Go to Habits tab to add some!"}
              </Typography>
            </Box>
          </AnimatedCard>
        ) : (
          <Stack spacing={1}>
            <AnimatePresence mode="popLayout">
              {habits.map(habit => (
                <AnimatedCard
                  key={habit.id}
                  sx={{ p: 2, borderRadius: 1 }}
                  onSwipe={() => isMobile && handleToggle(habit.id, { target: { checked: true } } as any)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 500 }}>{habit.name}</Typography>
                      <CategoryBadge category={habit.category} />
                    </Box>
                    <Checkbox
                      onChange={(event) => handleToggle(habit.id, event)}
                      sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                    />
                  </Box>
                </AnimatedCard>
              ))}
            </AnimatePresence>
          </Stack>
        )}
      </Stack>
    </PageTransition>
  );
}
