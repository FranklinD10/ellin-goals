import { useState, useEffect } from 'react';
import { Container, TextField, Button, Stack, Card, IconButton, Typography, Box, MenuItem, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import { useUser } from '../contexts/UserContext';
import { addHabit, deleteHabit, getUserHabits } from '../lib/firestore';
import { Habit } from '../types';
import CategoryBadge from '../components/CategoryBadge';
import { useTheme } from '../contexts/ThemeContext';
import { useHabits } from '../hooks/useHabits';
import { PageTransition } from '../components/PageTransition';
import { useNotification } from '../contexts/NotificationContext';

const CATEGORIES = [
  { value: 'health', label: '🏃 Health & Fitness' },
  { value: 'productivity', label: '💼 Productivity' },
  { value: 'personal', label: '🎯 Personal Growth' },
  { value: 'mindfulness', label: '🧘 Mindfulness' },
  { value: 'learning', label: '📚 Learning' },
  { value: 'social', label: '👥 Social' },
  { value: 'creative', label: '🎨 Creative' },
  { value: 'finance', label: '💰 Finance' },
  { value: 'spiritual', label: '📖 Spiritual' }
];

function HabitsList() {
  const { currentUser } = useUser();
  const { habits, loading, error } = useHabits(currentUser!);
  const { theme } = useTheme();
  const { showNotification } = useNotification();

  const handleDelete = async (habitId: string, habitName: string) => {
    try {
      await deleteHabit(habitId);
      showNotification({
        title: 'Success',
        message: `Habit "${habitName}" was deleted successfully`,
        color: 'success'
      });
    } catch (error) {
      console.error('Error deleting habit:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to delete habit. Please try again.',
        color: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" p={3} gap={1}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">Loading habits...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center">Error loading habits. Please try again.</Typography>
    );
  }

  if (habits.length === 0) {
    return (
      <Typography color="text.secondary" align="center">No habits yet. Add your first one!</Typography>
    );
  }

  return (
    <Stack spacing={2}>
      {habits.map(habit => (
        <Card key={habit.id} variant="outlined">
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography fontWeight={500}>{habit.name}</Typography>
              <CategoryBadge category={habit.category} />
            </Box>
            <IconButton 
              color="error" 
              onClick={() => handleDelete(habit.id, habit.name)}
              size="small"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Card>
      ))}
    </Stack>
  );
}

export default function Manage() {
  const { currentUser } = useUser();
  const { theme } = useTheme();
  const [habitName, setHabitName] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleAddHabit = async () => {
    if (!habitName.trim() || !category || !currentUser) return;
    
    setLoading(true);
    try {
      await addHabit({
        name: habitName,
        category,
        user_id: currentUser
      });
      
      setHabitName('');
      setCategory('');
      showNotification({
        title: 'Success',
        message: `Habit "${habitName}" was added successfully`,
        color: 'success'
      });
    } catch (error) {
      console.error('Error adding habit:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to add habit. Please try again.',
        color: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAddHabit();
  };

  return (
    <PageTransition>
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Stack spacing={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Manage Habits</Typography>
          </Box>

          <Card variant="outlined">
            <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
              <Stack spacing={2}>
                <TextField
                  label="Habit Name"
                  placeholder="Enter a new habit"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  select
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  fullWidth
                  SelectProps={{
                    displayEmpty: true
                  }}
                >
                  <MenuItem value="" disabled>
                    <Typography color="text.secondary">Select a category</Typography>
                  </MenuItem>
                  {CATEGORIES.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                  disabled={loading}
                  fullWidth
                  size="large"
                >
                  Add New Habit
                </Button>
              </Stack>
            </Box>
          </Card>

          <HabitsList />
        </Stack>
      </Container>
    </PageTransition>
  );
}
