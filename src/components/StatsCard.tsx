import { Paper, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

interface StatsCardProps {
  title: string;
  value: number;
  suffix?: string;
}

const StatsContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 90,
  gap: theme.spacing(0.5),
  textAlign: 'center',
}));

export default function StatsCard({ title, value, suffix = '%' }: StatsCardProps) {
  return (
    <StatsContainer>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
        <Typography variant="h4" component="div" fontWeight="bold">
          {Math.round(value)}
        </Typography>
        {suffix && (
          <Typography variant="body1" color="text.secondary">
            {suffix}
          </Typography>
        )}
      </Box>
    </StatsContainer>
  );
}
