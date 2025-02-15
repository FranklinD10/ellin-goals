import { Tooltip, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function FloatingActionButton() {
  const navigate = useNavigate();
  const { themeColor } = useTheme();

  return (
    <Tooltip title="Add New Habit" placement="left">
      <Fab
        color="primary"
        onClick={() => navigate('/manage')}
        sx={{
          position: 'fixed',
          right: 20,
          bottom: 80,
          width: 56,
          height: 56,
        }}
      >
        <AddIcon />
      </Fab>
    </Tooltip>
  );
}
