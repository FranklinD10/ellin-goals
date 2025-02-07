import { useState, useEffect } from 'react';
import { Container, TextInput, Button, Select, Stack, Group, Card, ActionIcon, Text, useMantineColorScheme } from '@mantine/core';
import { IconMoonStars, IconSun, IconPlus, IconTrash } from '@tabler/icons-react';
import { useUser } from '../contexts/UserContext';
import { addHabit, deleteHabit, getUserHabits } from '../lib/firestore';
import { Habit } from '../types';
import CategoryBadge from '../components/CategoryBadge';

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
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    const loadHabits = async () => {
      const userHabits = await getUserHabits(currentUser);
      setHabits(userHabits);
    };
    loadHabits();
  }, [currentUser]);

  const handleDelete = async (habitId: string) => {
    await deleteHabit(habitId);
    setHabits(habits.filter(h => h.id !== habitId));
  };

  return (
    <Stack spacing="md">
      {habits.map(habit => (
        <Card key={habit.id} shadow="sm">
          <Group position="apart">
            <div>
              <Text weight={500}>{habit.name}</Text>
              <CategoryBadge category={habit.category} />
            </div>
            <ActionIcon color="red" onClick={() => handleDelete(habit.id)}>
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
  const { colorScheme } = useMantineColorScheme();
  const [habitName, setHabitName] = useState('');
  const [category, setCategory] = useState('');

  const handleAddHabit = async () => {
    if (!habitName.trim() || !category || !currentUser) return;
    
    try {
      const newHabit = await addHabit({
        name: habitName,
        category,
        user_id: currentUser
      });
      setHabitName('');
      setCategory('');
    } catch (error) {
      console.error('Error adding habit:', error);
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
              />
              <Button 
                type="submit" 
                leftIcon={<IconPlus size={18} />}
                color={colorScheme === 'light' ? 'blue' : 'teal'}
                fullWidth
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
