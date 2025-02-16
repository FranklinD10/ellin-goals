import { Chip } from '@mui/material';
import { getCategoryDetails } from '../utils/category-constants';

interface CategoryBadgeProps {
  category: string;
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  const { emoji, label } = getCategoryDetails(category);

  return (
    <Chip
      label={`${emoji} ${label}`}
      size="small"
      sx={{
        borderRadius: 'full',
        fontWeight: 500,
      }}
    />
  );
}
