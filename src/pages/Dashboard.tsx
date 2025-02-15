import { useEffect, useState, useCallback, useRef } from 'react';
import { Card, Text, Checkbox, Group, Stack, Skeleton, Alert, Box } from '@mantine/core';
import { useUser } from '../contexts/UserContext';
import { getUserHabits, logHabitCompletion, getTodayLogs } from '../lib/firestore';
import { Habit } from '../types';
import StatsCard from '../components/StatsCard';
import CategoryBadge from '../components/CategoryBadge';
import { playCompletionSound, animateCompletion } from '../utils/effects';
import { AnimatePresence } from 'framer-motion';
import { AnimatedCard } from '../components/AnimatedCard';
import { isMobile } from 'react-device-detect';
import { showNotification } from '@mantine/notifications';
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
    const card = event.target.closest('.mantine-Card-root');
    
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
      <Stack spacing="md" p="md">
        <Skeleton height={30} width="40%" mb="xl" />
        <Group grow mb="md">
          <Skeleton height={90} radius="md" />
          <Skeleton height={90} radius="md" />
        </Group>
        {Array(3).fill(0).map((_, i) => (
          <Skeleton key={i} height={80} radius="md" mb="sm" />
        ))}
      </Stack>
    );
  }

  if (error) {
    return <Alert color="red" mt="md">{error}</Alert>;
  }

  return (
    <PageTransition>
      <Stack spacing="md" p="md">
        <Text size="xl" weight={700} color="dimmed">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </Text>

        <Group grow mb="md">
          <StatsCard 
            title="Completion Rate" 
            value={completionRate} 
          />
          <StatsCard 
            title="Remaining Habits" 
            value={habits.length} 
            suffix="" 
          />
        </Group>

        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} height={80} radius="md" mb="sm" />
          ))
        ) : habits.length === 0 ? (
          <AnimatedCard>
            <Text align="center" color="dimmed" py="xl">
              {completedHabits.size > 0 
                ? "All habits completed for today! 🎉" 
                : "No habits added yet. Go to Habits tab to add some!"}
            </Text>
          </AnimatedCard>
        ) : (
          <Stack spacing="sm">
            <AnimatePresence mode="popLayout">
              {habits.map(habit => (
                <AnimatedCard
                  key={habit.id}
                  p="md"
                  radius="md"
                  withBorder
                  onSwipe={() => isMobile && handleToggle(habit.id, { target: { checked: true } } as any)}
                >
                  <Group position="apart" noWrap>
                    <Box>
                      <Text weight={500} size="lg">{habit.name}</Text>
                      <CategoryBadge category={habit.category} />
                    </Box>
                    <Checkbox
                      size="md"
                      radius="xl"
                      onChange={(event) => handleToggle(habit.id, event)}
                    />
                  </Group>
                </AnimatedCard>
              ))}
            </AnimatePresence>
          </Stack>
        )}
      </Stack>
    </PageTransition>
  );
}
