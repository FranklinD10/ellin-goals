import { useEffect, useState } from 'react';
import { Stack, Typography, Grid, Card, Box, Container, Paper, CircularProgress } from '@mui/material';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, Tooltip, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useUser } from '../contexts/UserContext';
import { getUserHabits, getHabitLogs } from '../lib/firestore';
import { Habit, HabitLog } from '../types';
import { styled } from '@mui/material/styles';
import { PageTransition } from '../components/PageTransition';

const ChartContainer = styled('div')({
  width: '100%',
  minHeight: 300,
  marginBottom: 16,
  overflow: 'visible',
});

const ScrollableStack = styled(Stack)({
  overflowY: 'auto',
  WebkitOverflowScrolling: 'touch',
  paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)',
});

export default function Analytics() {
  const { currentUser } = useUser();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const COLORS = ['#FF4B4B', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF'];

  useEffect(() => {
    const loadData = async () => {
      try {
        const userHabits = await getUserHabits(currentUser!);
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
      <Stack spacing={3} p={2}>
        <CircularProgress />
      </Stack>
    );
  }

  if (habits.length === 0) {
    return (
      <Stack spacing={3} p={2}>
        <Box display="flex" justifyContent="center" minHeight={200} alignItems="center">
          <Typography color="text.secondary">Add some habits to see analytics</Typography>
        </Box>
      </Stack>
    );
  }

  const weeklyData = processWeeklyData();
  const categoryData = processCategoryData();

  return (
    <PageTransition>
      <ScrollableStack spacing={3}>
        <Typography variant="h5">Analytics</Typography>

        <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
          <Stack spacing={2}>
            <Typography fontWeight={500}>Habits by Category</Typography>
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
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{
                      paddingLeft: '20px',
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Stack>
        </Paper>

        <Grid container>
          <Grid item xs={12}>
            <Card>
              <Box p={2}>
                <Typography fontWeight={500} mb={2}>Weekly Completion Rate</Typography>
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
                  <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                    <Typography color="text.secondary">Complete some habits to see the trend</Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </ScrollableStack>
    </PageTransition>
  );
}
