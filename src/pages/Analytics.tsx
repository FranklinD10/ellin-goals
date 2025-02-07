import { useEffect, useState } from 'react';
import { Stack, Text, Grid, Card } from '@mantine/core';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, Tooltip, PieChart, Pie, Cell 
} from 'recharts';
import { useUser } from '../contexts/UserContext';
import { getUserHabits } from '../lib/firestore';
import { Habit } from '../types';

export default function Analytics() {
  const { currentUser } = useUser();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const COLORS = ['#FF4B4B', '#0088FE', '#00C49F', '#FFBB28'];

  useEffect(() => {
    const loadHabits = async () => {
      try {
        const userHabits = await getUserHabits(currentUser);
        setHabits(userHabits);
      } catch (err) {
        console.error('Error loading habits:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHabits();
  }, [currentUser]);

  // Sample data - replace with real data later
  const weeklyData = [
    { name: 'Mon', completion: 4 },
    { name: 'Tue', completion: 3 },
    { name: 'Wed', completion: 5 },
    { name: 'Thu', completion: 2 },
    { name: 'Fri', completion: 6 },
    { name: 'Sat', completion: 4 },
    { name: 'Sun', completion: 3 },
  ];

  const categoryData = [
    { name: 'Health', value: 30 },
    { name: 'Productivity', value: 25 },
    { name: 'Personal', value: 45 },
  ];

  const dailyData = [
    { day: 'Mon', completed: 5 },
    { day: 'Tue', completed: 3 },
    { day: 'Wed', completed: 4 },
    { day: 'Thu', completed: 6 },
    { day: 'Fri', completed: 2 },
    { day: 'Sat', completed: 4 },
    { day: 'Sun', completed: 5 },
  ];

  if (loading) {
    return (
      <Stack spacing="xl">
        <Text size="xl">Loading analytics...</Text>
      </Stack>
    );
  }

  return (
    <Stack spacing="xl">
      <Text size="xl">{currentUser}'s Analytics</Text>
      
      <Grid>
        <Grid.Col span={12}>
          <Card>
            <Text weight={500} mb="md">Weekly Progress</Text>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="completion" 
                  stroke="#FF4B4B" 
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Grid.Col>

        <Grid.Col span={6}>
          <Card>
            <Text weight={500} mb="md">Category Distribution</Text>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  label
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid.Col>

        <Grid.Col span={6}>
          <Card>
            <Text weight={500} mb="md">Completion by Day</Text>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#FF4B4B" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
