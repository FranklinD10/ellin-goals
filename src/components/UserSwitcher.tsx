import { Menu, IconButton, Avatar, Typography, Box, MenuItem } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useUser } from '../contexts/UserContext';
import { UserType } from '../types';
import { useState } from 'react';

export default function UserSwitcher() {
  const { currentUser, setCurrentUser } = useUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const userDetails: Record<UserType, { color: string; avatar: string }> = {
    El: { color: 'pink', avatar: '👩' },
    Lin: { color: 'blue', avatar: '👨' }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ 
          ml: 1,
          border: theme => `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          px: 1
        }}
      >
        <Avatar 
          sx={{ width: 24, height: 24, fontSize: '14px', mr: 1 }}
        >
          {userDetails[currentUser].avatar}
        </Avatar>
        <Typography variant="body2" sx={{ mx: 1 }}>
          {currentUser}
        </Typography>
        <KeyboardArrowDownIcon fontSize="small" />
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {Object.entries(userDetails).map(([user, details]) => (
          <MenuItem
            key={user}
            onClick={() => {
              setCurrentUser(user as UserType);
              handleClose();
            }}
            selected={currentUser === user}
          >
            <Box component="span" sx={{ mr: 1 }}>
              {details.avatar}
            </Box>
            {user}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
