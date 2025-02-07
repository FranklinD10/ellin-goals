import { Group, Text, RingProgress } from '@mantine/core';

interface StreakIndicatorProps {
  streak: number;
  maxStreak?: number;
}

export default function StreakIndicator({ streak, maxStreak = 30 }: StreakIndicatorProps) {
  const percentage = (streak / maxStreak) * 100;

  return (
    <Group spacing="xs" align="center">
      <RingProgress
        size={40}
        thickness={4}
        roundCaps
        sections={[{ value: percentage, color: '#FF4B4B' }]}
        label={
          <Text color="red" align="center" size="xs">
            🔥
          </Text>
        }
      />
      <div>
        <Text size="sm" weight={500}>{streak} day streak</Text>
        <Text size="xs" color="dimmed">Best: {maxStreak} days</Text>
      </div>
    </Group>
  );
}
