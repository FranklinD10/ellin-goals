import { Card, Typography, Stack } from '@mui/material';

interface StatsCardProps {
  title: string;
  value: number;
  suffix?: string;
}

export default function StatsCard({ title, value, suffix = '%' }: StatsCardProps) {
  return (
    <Card 
      sx={{ 
        height: 120,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Stack spacing={1.5} alignItems="center">
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={700}>
          {value.toFixed(0)}{suffix}
        </Typography>
      </Stack>
    </Card>
  );
}
