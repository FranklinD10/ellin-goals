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
import { useTheme } from '@mui/material/styles';
import { persistHabits, loadHabits } from '../lib/persistence';

export default function Dashboard() {
  const { currentUser, isTransitioning } = useUser();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completionRate, setCompletionRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedHabits, setCompletedHabits] = useState<Set<string>>(new Set());
  const optimisticUpdates = useRef(new Map<string, boolean>()).current;
  const { showNotification } = useNotification();
  const theme = useTheme();
  const initialLoadDone = useRef(false);
  const lastFetchRef = useRef<number>(0);

  const loadData = useCallback(async () => {
    if (isTransitioning) return;

    try {
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchRef.current;
      
      // Always show cached data first if available
      const cachedHabits = loadHabits();
      if (cachedHabits.length > 0 && !initialLoadDone.current) {
        setHabits(cachedHabits);
        setLoading(false);
      }

      // Skip fetch if we recently loaded and this isn't the initial load
      if (timeSinceLastFetch < 30000 && initialLoadDone.current) {
        return;
      }

      if (!initialLoadDone.current) {
        setLoading(true);
      }
      setError(null);

      const [userHabits, todayLogs] = await Promise.all([
        getUserHabits(currentUser!),
        getTodayLogs(currentUser!)
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
        persistHabits(userHabits); // Cache the habits
        
        if (userHabits.length > 0) {
          setCompletionRate((completedHabitIds.size / userHabits.length) * 100);
        }

        lastFetchRef.current = now;
        initialLoadDone.current = true;
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

  useEffect(() => {
    // Initial load
    loadData();

    // Set up prefetching
    const prefetchInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    }, 300000); // Refresh data every 5 minutes when tab is visible

    // Handle visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(prefetchInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadData]);

  const handleToggle = useCallback(async (habitId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const isCompleted = event.target.checked;
    // Always play sound and confetti when marking complete
    if (isCompleted) {
      playCompletionSound();
      // Try to animate the closest card, fallback to document body if not found
      const card = event.target.closest('.MuiCard-root') as HTMLElement | null;
      if (card) {
        animateCompletion(card);
      } else {
        animateCompletion(document.body);
      }
    }

    try {
      // Optimistically update UI
      optimisticUpdates.set(habitId, isCompleted);
      if (isCompleted) {
        const habit = habits.find(h => h.id === habitId);
        if (habit) {
          setHabits(prev => prev.filter(h => h.id !== habitId));
          setCompletedHabits(prev => {
            const next = new Set(prev);
            next.add(habitId);
            return next;
          });
          // Update completion rate optimistically
          setCompletionRate(prev => {
            const totalHabits = habits.length + completedHabits.size;
            const completedCount = completedHabits.size + 1;
            return (completedCount / totalHabits) * 100;
          });
        }
      }

      // Perform actual update
      await logHabitCompletion(habitId, currentUser!, new Date(), isCompleted);
      optimisticUpdates.delete(habitId);
      
      // Only reload data if the optimistic update failed
      const shouldReload = !isCompleted || !habits.find(h => h.id === habitId);
      if (shouldReload) {
        await loadData();
      }
    } catch (error) {
      console.error('Error toggling habit:', error);
      // Revert optimistic update on error
      optimisticUpdates.delete(habitId);
      if (isCompleted) {
        const habit = habits.find(h => h.id === habitId);
        if (habit) {
          setHabits(prev => [...prev, habit].sort((a, b) => a.created_at.seconds - b.created_at.seconds));
          setCompletedHabits(prev => {
            const next = new Set(prev);
            next.delete(habitId);
            return next;
          });
        }
      }
      showNotification({
        title: 'Error',
        message: 'Failed to update habit completion',
        color: 'error'
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
      <Stack spacing={3} sx={{ 
        p: 2,
        bgcolor: 'background.default',
        minHeight: '100%',
        '@supports (-webkit-touch-callout: none)': {
          minHeight: '-webkit-fill-available',
          pt: `calc(${theme.spacing(2)} + env(safe-area-inset-top))`,
          pb: `calc(${theme.spacing(2)} + env(safe-area-inset-bottom))`,
          pl: `calc(${theme.spacing(2)} + env(safe-area-inset-left))`,
          pr: `calc(${theme.spacing(2)} + env(safe-area-inset-right))`,
        }
      }}>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </Typography>        <Grid 
          container 
          spacing={2} 
          alignItems="stretch"
          sx={{ 
            width: '100%',
            margin: 0,
            '& > .MuiGrid-item': {
              paddingLeft: 0,
              '&:last-child': {
                paddingRight: 0
              }
            }
          }}
        >
          <Grid item xs={6} sx={{ display: 'flex' }}>
            <StatsCard 
              title="Completion Rate" 
              value={completionRate} 
            />
          </Grid>
          <Grid item xs={6} sx={{ display: 'flex' }}>
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
                    <Box>                      <Typography component="div" variant="h6" sx={{ fontWeight: 500 }}>{habit.name}</Typography>
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
