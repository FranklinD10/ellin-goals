import { ActionIcon, Tooltip } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export default function FloatingActionButton() {
  const navigate = useNavigate();

  return (
    <Tooltip label="Add New Habit">
      <ActionIcon
        color="primary"
        variant="filled"
        size="xl"
        radius="xl"
        onClick={() => navigate('/manage')}
        sx={(theme) => ({
          position: 'fixed',
          right: 20,
          bottom: 80,
          width: 56,
          height: 56,
          backgroundColor: theme.colors.primary[0],
          '&:hover': {
            backgroundColor: theme.fn.darken(theme.colors.primary[0], 0.1),
          },
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        })}
      >
        <IconPlus size={24} />
      </ActionIcon>
    </Tooltip>
  );
}
