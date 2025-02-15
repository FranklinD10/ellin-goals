import { Fab, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function FloatingActionButton() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <Tooltip title="Add New Habit" placement="left">
      <Fab
        color="primary"
        onClick={() => navigate('/manage')}
        sx={{
          position: 'fixed',
          right: 20,
          bottom: 80,
          boxShadow: theme.shadows[4],
        }}
      >
        <AddIcon />
      </Fab>
    </Tooltip>
  );
}
