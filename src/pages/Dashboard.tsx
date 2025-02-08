import { useEffect, useState } from 'react';
import { Card, Text, Checkbox, Group, Stack, Skeleton, Alert, Box } from '@mantine/core';
import { useUser } from '../contexts/UserContext';
import { getUserHabits, logHabitCompletion, getHabitLogs } from '../lib/firestore';
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

  useEffect(() => {
    let mounted = true;

    const loadHabitsAndLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const userHabits = await getUserHabits(currentUser);
        
        if (!mounted) return;
        
        setHabits(userHabits);

        // Load today's logs
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const completed = new Set<string>();
        for (const habit of userHabits) {
          const logs = await getHabitLogs(habit.id, today);
          if (logs.some(log => log.completed)) {
            completed.add(habit.id);
          }
        }
        setCompletedHabits(completed);

        // Check if we have habits before trying to get logs
        if (userHabits.length > 0) {
          try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            const logsPromises = userHabits.map(habit => 
              getHabitLogs(habit.id, sevenDaysAgo)
            );
            const allLogs = await Promise.all(logsPromises);
            const totalLogs = allLogs.flat().length;
            const possibleLogs = userHabits.length * 7;
            
            setCompletionRate(possibleLogs ? (totalLogs / possibleLogs) * 100 : 0);
          } catch (logError) {
            console.warn('Error loading logs:', logError);
            // Don't show this error to user, just set completion rate to 0
            setCompletionRate(0);
          }
        }
      } catch (err) {
        console.error('Error:', err);
        if (mounted) {
          setError('Failed to load habits. Please try again.');
          setHabits([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadHabitsAndLogs();

    return () => {
      mounted = false;
    };
  }, [currentUser]);

  const handleToggle = async (habitId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const isCompleted = event.target.checked;
    const card = event.target.closest('.mantine-Card-root');
    
    try {
      await logHabitCompletion(habitId, currentUser, new Date(), isCompleted);
      
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
    } catch (error) {
      console.error('Error logging habit completion:', error);
      // Optionally show an error notification here
    }
  };

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
