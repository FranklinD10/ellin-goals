import { Card, Text, Group, RingProgress } from '@mantine/core';

interface StatsCardProps {
  title: string;
  value: number;
  total?: number;
  suffix?: string;
}

export default function StatsCard({ title, value, total = 100, suffix = '%' }: StatsCardProps) {
  const percentage = (value / total) * 100;

  return (
    <Card shadow="sm">
      <Group position="apart">
        <div>
          <Text size="xs" color="dimmed">{title}</Text>
          <Text size="xl" weight={700}>
            {value}{suffix}
          </Text>
        </div>
        <RingProgress
          size={80}
          roundCaps
          thickness={8}
          sections={[{ value: percentage, color: '#FF4B4B' }]}
        />
      </Group>
    </Card>
  );
}
