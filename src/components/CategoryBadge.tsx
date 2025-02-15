import { Chip, alpha } from '@mui/material';

const categoryColors: Record<string, { light: string; main: string }> = {
  health: { light: '#E8F5E9', main: '#4CAF50' },
  productivity: { light: '#E3F2FD', main: '#2196F3' },
  personal: { light: '#FFF3E0', main: '#FF9800' },
  mindfulness: { light: '#F3E5F5', main: '#9C27B0' },
  learning: { light: '#E8EAF6', main: '#3F51B5' },
  social: { light: '#FCE4EC', main: '#E91E63' },
  creative: { light: '#F1F8E9', main: '#8BC34A' },
  finance: { light: '#EFEBE9', main: '#795548' },
  spiritual: { light: '#E1F5FE', main: '#03A9F4' },
  test: { light: '#FAFAFA', main: '#9E9E9E' }
};

interface CategoryBadgeProps {
  category: string;
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  const colors = categoryColors[category] || categoryColors.test;

  return (
    <Chip
      label={category}
      size="small"
      sx={theme => ({
        backgroundColor: theme.palette.mode === 'dark' 
          ? alpha(colors.main, 0.2)
          : colors.light,
        color: theme.palette.mode === 'dark'
          ? alpha(colors.main, 0.8)
          : colors.main,
        fontWeight: 500,
        borderRadius: 1,
      })}
    />
  );
}
