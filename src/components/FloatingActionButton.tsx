import { ActionIcon, Tooltip } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { themes } from '../utils/theme-constants';

export default function FloatingActionButton() {
  const navigate = useNavigate();
  const { themeColor } = useTheme();

  return (
    <Tooltip label="Add New Habit">
      <ActionIcon
        color={themeColor}
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
          backgroundColor: themes[themeColor].color,
          '&:hover': {
            backgroundColor: theme.fn.darken(themes[themeColor].color, 0.1),
          },
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        })}
      >
        <IconPlus size={24} />
      </ActionIcon>
    </Tooltip>
  );
}
