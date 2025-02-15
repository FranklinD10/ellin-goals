import { Chip } from '@mui/material';

interface CategoryBadgeProps {
  category: string;
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  const getEmoji = () => {
    switch (category) {
      case 'health':
        return '🏃';
      case 'productivity':
        return '💼';
      case 'personal':
        return '🎯';
      default:
        return '📝';
    }
  };

  const getLabel = () => {
    switch (category) {
      case 'health':
        return 'Health & Fitness';
      case 'productivity':
        return 'Productivity';
      case 'personal':
        return 'Personal Growth';
      default:
        return category;
    }
  };

  return (
    <Chip
      label={`${getEmoji()} ${getLabel()}`}
      size="small"
      sx={{
        borderRadius: 'full',
        fontWeight: 500,
      }}
    />
  );
}
