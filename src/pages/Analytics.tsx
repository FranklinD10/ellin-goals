import { useEffect, useState } from 'react';
import { Stack, Text, Grid, Card, Center, Title, Paper } from '@mantine/core';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, Tooltip, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useUser } from '../contexts/UserContext';
import { getUserHabits, getHabitLogs } from '../lib/firestore';
import { Habit, HabitLog } from '../types';
import styled from 'styled-components';

const ChartContainer = styled.div`
  width: 100%;
  min-height: 300px;
  margin-bottom: 16px;
  overflow: visible;
`;

const ScrollableStack = styled(Stack)`
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: calc(env(safe-area-inset-bottom) + 16px);
`;

export default function Analytics() {
  const { currentUser } = useUser();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const COLORS = ['#FF4B4B', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF'];

  useEffect(() => {
    const loadData = async () => {
      try {
        const userHabits = await getUserHabits(currentUser);
        setHabits(userHabits);

        // Get logs for the past 7 days for each habit
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const logsPromises = userHabits.map(habit => 
          getHabitLogs(habit.id, sevenDaysAgo)
        );
        const allLogs = await Promise.all(logsPromises);
        setHabitLogs(allLogs.flat());
      } catch (err) {
        console.error('Error loading analytics data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentUser]);

  const processWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayLogs = habitLogs.filter(log => 
        new Date(log.date.seconds * 1000).toDateString() === date.toDateString()
      );
      
      weekData.push({
        name: days[date.getDay()],
        completion: dayLogs.length,
        total: habits.length,
        rate: habits.length ? (dayLogs.length / habits.length) * 100 : 0
      });
    }
    return weekData;
  };

  const processCategoryData = () => {
    const categories = habits.reduce((acc, habit) => {
      acc[habit.category] = (acc[habit.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories).map(([name, value]) => ({
      name,
      value
    }));
  };

  if (loading) {
    return (
      <Stack spacing="xl" p="md">
        <Text size="xl">Loading analytics...</Text>
      </Stack>
    );
  }

  if (habits.length === 0) {
    return (
      <Stack spacing="xl" p="md">
        <Center style={{ minHeight: '200px' }}>
          <Text color="dimmed">Add some habits to see analytics</Text>
        </Center>
      </Stack>
    );
  }

  const weeklyData = processWeeklyData();
  const categoryData = processCategoryData();

  return (
    <ScrollableStack spacing="xl">
      <Title order={2}>Analytics</Title>

      <Paper p="md" withBorder>
        <Stack spacing="md">
          <Text weight={500}>Habits by Category</Text>
          <ChartContainer>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  layout="vertical"
                  align="end"
                  verticalAlign="middle"
                  wrapperStyle={{
                    paddingLeft: '20px',
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}
                />
              </PieChart>
              <Tooltip />
            </ResponsiveContainer>
          </ChartContainer>
        </Stack>
      </Paper>

      <Grid>
        <Grid.Col span={12}>
          <Card>
            <Text weight={500} mb="md">Weekly Completion Rate</Text>
            {weeklyData.some(d => d.total > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#FF4B4B" 
                    strokeWidth={2}
                    name="Completion Rate (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Center style={{ height: 300 }}>
                <Text color="dimmed">Complete some habits to see the trend</Text>
              </Center>
            )}
          </Card>
        </Grid.Col>
      </Grid>
    </ScrollableStack>
  );
}
