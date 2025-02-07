import { Card, Text, Group } from '@mantine/core';

interface StatsCardProps {
  title: string;
  value: number;
  suffix?: string;
}

export default function StatsCard({ title, value, suffix = '%' }: StatsCardProps) {
  return (
    <Card withBorder p="md">
      <Group position="apart" align="flex-start">
        <Text size="xs" color="dimmed" transform="uppercase">
          {title}
        </Text>
        <Text weight={700} size="xl">
          {value.toFixed(0)}{suffix}
        </Text>
      </Group>
    </Card>
  );
}
