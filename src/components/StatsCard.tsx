import { Card, Typography, Stack } from '@mui/material';

interface StatsCardProps {
  title: string;
  value: number;
  suffix?: string;
}

export default function StatsCard({ title, value, suffix = '%' }: StatsCardProps) {
  return (    <Card sx={{ 
      p: 2,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <Stack spacing={1.5}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={700} sx={{ lineHeight: 1 }}>
          {value.toFixed(0)}{suffix}
        </Typography>
      </Stack>
    </Card>
  );
}
