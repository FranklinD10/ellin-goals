import { Button, Stack, Typography, Box } from '@mui/material';
import { addHabit, getHabitLogs, logHabitCompletion } from '../lib/firestore';
import { useUser } from '../contexts/UserContext';
import { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';

export function TestIndexManagement() {
  const { currentUser } = useUser();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    if (!currentUser) {
      showNotification({
        title: 'Error',
        message: 'No current user',
        color: 'error'
      });
      return;
    }

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
        color: 'success'
      });
      
      console.log('Test Results:', { habit, logs });
    } catch (error) {
      console.error('Test failed:', error);
      showNotification({
        title: 'Test Failed',
        message: 'Check console for error details',
        color: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Index Management</Typography>
      <Button variant="contained" onClick={handleTest} disabled={loading}>
        Run Test
      </Button>
    </Stack>
  );
}
