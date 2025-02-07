import { Habit, DailyCheck } from '../types';

export const calculateWeeklyCompletion = (checks: DailyCheck[]): number => {
  const last7Days = checks.filter(check => {
    const checkDate = new Date(check.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return checkDate >= weekAgo && check.completed;
  });

  return (last7Days.length / 7) * 100;
};

export const calculateStreak = (checks: DailyCheck[]): number => {
  let streak = 0;
  const sortedChecks = checks.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  for (const check of sortedChecks) {
    if (check.completed) streak++;
    else break;
  }

  return streak;
};

export const generateHeatmapData = (checks: DailyCheck[]) => {
  const heatmap: Record<string, number> = {};
  checks.forEach(check => {
    const date = new Date(check.date).toISOString().split('T')[0];
    heatmap[date] = check.completed ? (heatmap[date] || 0) + 1 : 0;
  });
  return heatmap;
};
