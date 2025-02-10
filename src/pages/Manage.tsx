import { useState, useEffect } from 'react';
import { Container, TextInput, Button, Select, Stack, Group, Card, ActionIcon, Text, useMantineColorScheme, Loader } from '@mantine/core';
import { IconMoonStars, IconSun, IconPlus, IconTrash, IconCheck } from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';
import { useUser } from '../contexts/UserContext';
import { addHabit, deleteHabit, getUserHabits } from '../lib/firestore';
import { Habit } from '../types';
import CategoryBadge from '../components/CategoryBadge';
import { useTheme } from '../contexts/ThemeContext';
import { useHabits } from '../hooks/useHabits';

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
  const { habits, loading, error } = useHabits(currentUser);
  const { themeColor } = useTheme();

  const handleDelete = async (habitId: string, habitName: string) => {
    try {
      await deleteHabit(habitId);
      showNotification({
        title: 'Success',
        message: `Habit "${habitName}" was deleted successfully`,
        color: themeColor,
        icon: <IconTrash size={16} />,
      });
    } catch (error) {
      console.error('Error deleting habit:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to delete habit. Please try again.',
        color: 'red',
      });
    }
  };

  if (loading) {
    return (
      <Stack align="center" spacing="md" p="xl">
        <Loader color={themeColor} />
        <Text size="sm" color="dimmed">Loading habits...</Text>
      </Stack>
    );
  }

  if (error) {
    return (
      <Text color="red" align="center">Error loading habits. Please try again.</Text>
    );
  }

  if (habits.length === 0) {
    return (
      <Text color="dimmed" align="center">No habits yet. Add your first one!</Text>
    );
  }

  return (
    <Stack spacing="md">
      {habits.map(habit => (
        <Card key={habit.id} shadow="sm">
          <Group position="apart">
            <div>
              <Text weight={500}>{habit.name}</Text>
              <CategoryBadge category={habit.category} />
            </div>
            <ActionIcon color="red" onClick={() => handleDelete(habit.id, habit.name)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Card>
      ))}
    </Stack>
  );
}

export default function Manage() {
  const { currentUser } = useUser();
  const { themeColor } = useTheme();
  const [habitName, setHabitName] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

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
        color: themeColor,
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      console.error('Error adding habit:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to add habit. Please try again.',
        color: 'red',
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
    <Container size="sm" py="xl">
      <Stack spacing="lg">
        <Group position="apart">
          <Text size="xl">Manage Habits</Text>
        </Group>

        <Card shadow="sm">
          <form onSubmit={handleSubmit}>
            <Stack spacing="md">
              <TextInput
                label="Habit Name"
                placeholder="Enter a new habit"
                value={habitName}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setHabitName(event.currentTarget.value)}
                required
              />
              <Select
                label="Category"
                placeholder="Select a category"
                value={category}
                onChange={(val) => setCategory(val || '')}
                data={CATEGORIES}
                required
                searchable={false}  // Disable searchable to prevent keyboard
                clearable
                styles={(theme) => ({
                  dropdown: {
                    maxHeight: '75vh', // Increased from 50vh to show more options
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    padding: '8px 0',
                    minWidth: '200px',
                    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
                      maxHeight: '80vh', // Increased from 60vh to show more options
                      position: 'fixed',
                      left: '0 !important',
                      right: '0 !important',
                      bottom: '0',
                      border: 'none',
                      borderTopLeftRadius: theme.radius.lg, // Increased border radius
                      borderTopRightRadius: theme.radius.lg,
                      borderBottomLeftRadius: 0,
                      borderBottomRightRadius: 0,
                      margin: 0,
                      width: '100%',
                      boxShadow: '0 -4px 10px rgba(0,0,0,0.1)', // Enhanced shadow
                      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
                      zIndex: 1000 // Ensure it's above other elements
                    }
                  },
                  item: {
                    padding: '12px 16px',
                    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
                      padding: '16px', // Adjusted padding
                      fontSize: '16px',
                      minHeight: '48px', // Ensure consistent height
                      display: 'flex',
                      alignItems: 'center'
                    }
                  },
                  itemsWrapper: {
                    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
                      padding: '8px 0'
                    }
                  }
                })}
              />
              <Button 
                type="submit" 
                leftIcon={<IconPlus size={18} />}
                color={themeColor}
                fullWidth
                loading={loading}
              >
                Add New Habit
              </Button>
            </Stack>
          </form>
        </Card>

        <HabitsList />
      </Stack>
    </Container>
  );
}
