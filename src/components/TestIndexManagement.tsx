import { Button, Stack, Text, Group } from '@mantine/core';
import { addHabit, getHabitLogs, logHabitCompletion } from '../lib/firestore';
import { useUser } from '../contexts/UserContext';
import { useState } from 'react';
import { showNotification } from '@mantine/notifications';

export function TestIndexManagement() {
  const { currentUser } = useUser();
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    try {
      // 1. Add a test habit
      const habit = await addHabit({
        name: 'Test Habit',
        category: 'test',
        user_id: currentUser
      });

      // 2. Add some logs
      const today = new Date();
      await logHabitCompletion(habit.id, currentUser, today, true);
      await logHabitCompletion(habit.id, currentUser, new Date(today.setDate(today.getDate() - 1)), true);
      
      // 3. Test fetching logs (this will trigger the index management)
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const logs = await getHabitLogs(habit.id, startDate);
      
      showNotification({
        title: 'Test Complete',
        message: `Found ${logs.length} logs. Check console for details.`,
        color: 'green'
      });
      
      console.log('Test Results:', { habit, logs });
    } catch (error) {
      console.error('Test failed:', error);
      showNotification({
        title: 'Test Failed',
        message: 'Check console for error details',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing="md">
      <Text>Test Index Management</Text>
      <Group>
        <Button 
          onClick={runTest} 
          loading={loading}
          color="blue"
        >
          Run Test
        </Button>
      </Group>
    </Stack>
  );
}
