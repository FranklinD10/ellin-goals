import { Badge } from '@mantine/core';

const categoryColors: Record<string, string> = {
  health: 'green',
  productivity: 'blue',
  personal: 'grape',
  default: 'gray'
};

interface CategoryBadgeProps {
  category: string;
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <Badge 
      color={categoryColors[category] || categoryColors.default}
      variant="light"
      size="sm"
    >
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </Badge>
  );
}
