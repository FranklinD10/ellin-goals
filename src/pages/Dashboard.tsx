import { useEffect, useState, useCallback } from 'react';
import { Card, Text, Checkbox, Group, Stack, Skeleton, Alert, Box } from '@mantine/core';
import { useUser } from '../contexts/UserContext';
import { getUserHabits, logHabitCompletion, getHabitLogs, getTodayLogs } from '../lib/firestore';
import { Habit } from '../types';
import StatsCard from '../components/StatsCard';
import CategoryBadge from '../components/CategoryBadge';
import { playCompletionSound, animateCompletion } from '../utils/effects';

export default function Dashboard() {
  const { currentUser } = useUser();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completionRate, setCompletionRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedHabits, setCompletedHabits] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get habits and today's logs in parallel
      const [userHabits, todayLogs] = await Promise.all([
        getUserHabits(currentUser),
        getTodayLogs(currentUser)
      ]);

      console.debug('Loaded data:', { userHabits, todayLogs });

      setHabits(userHabits);
      
      // Map completed habits
      const completedHabitIds = new Set(
        todayLogs
          .filter(log => log.completed)
          .map(log => log.habit_id)
      );
      
      setCompletedHabits(completedHabitIds);

      // Calculate completion rate
      if (userHabits.length > 0) {
        const completionRate = (completedHabitIds.size / userHabits.length) * 100;
        setCompletionRate(completionRate);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load habits');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Reload data when component mounts or user changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggle = async (habitId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const isCompleted = event.target.checked;
    const card = event.target.closest('.mantine-Card-root');
    
    try {
      await logHabitCompletion(habitId, currentUser, new Date(), isCompleted);
      
      // Update local state immediately
      setCompletedHabits(prev => {
        const next = new Set(prev);
        if (isCompleted) {
          next.add(habitId);
          if (card) {
            playCompletionSound();
            animateCompletion(card as HTMLElement);
          }
        } else {
          next.delete(habitId);
        }
        return next;
      });

      // Recalculate completion rate
      setCompletionRate(prev => {
        const totalHabits = habits.length;
        if (totalHabits === 0) return 0;
        const completedCount = isCompleted ? prev + 1 : prev - 1;
        return (completedCount / totalHabits) * 100;
      });

      // Reload data to ensure consistency
      await loadData();
    } catch (error) {
      console.error('Error toggling habit:', error);
      // Revert local state on error
      await loadData();
    }
  };

  if (loading) {
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
    <Stack spacing="md" p="md">
      <Text size="xl" weight={700} color="dimmed">
        {new Date().toLocaleDateString('en-US', { 
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        })}
      </Text>

      <Group grow mb="md">
        <StatsCard title="Weekly Progress" value={completionRate} />
        <StatsCard title="Total Habits" value={habits.length} suffix="" />
      </Group>

      {loading ? (
        Array(3).fill(0).map((_, i) => (
          <Skeleton key={i} height={80} radius="md" mb="sm" />
        ))
      ) : habits.length === 0 ? (
        <Card>
          <Text align="center" color="dimmed" py="xl">
            No habits added yet. Go to Habits tab to add some!
          </Text>
        </Card>
      ) : (
        <Stack spacing="sm">
          {habits.map(habit => (
            <Card key={habit.id} p="md" radius="md" withBorder>
              <Group position="apart" noWrap>
                <Box>
                  <Text weight={500} size="lg">{habit.name}</Text>
                  <CategoryBadge category={habit.category} />
                </Box>
                <Checkbox
                  size="md"
                  radius="xl"
                  checked={completedHabits.has(habit.id)}
                  onChange={(event) => handleToggle(habit.id, event)}
                />
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
