import { useEffect, useState } from 'react';
import { Card, Text, Checkbox, Group, Stack, Skeleton, Alert, Box } from '@mantine/core';
import { useUser } from '../contexts/UserContext';
import { getUserHabits, logHabitCompletion } from '../lib/firestore';
import { Habit } from '../types';
import StatsCard from '../components/StatsCard';
import CategoryBadge from '../components/CategoryBadge';

export default function Dashboard() {
  const { currentUser } = useUser();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHabits = async () => {
      try {
        setLoading(true);
        const userHabits = await getUserHabits(currentUser);
        console.log('Loaded habits:', userHabits); // Debug log
        setHabits(userHabits);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load habits. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadHabits();
  }, [currentUser]);

  const handleToggle = async (habitId: string) => {
    await logHabitCompletion(habitId, currentUser, new Date());
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
        <StatsCard title="Weekly Progress" value={85} />
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
                  onChange={() => handleToggle(habit.id)}
                />
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
