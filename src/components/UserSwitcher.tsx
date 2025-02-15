import { Menu, MenuItem, IconButton, Avatar, Typography, Stack } from '@mui/material';
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

  const handleUserChange = (user: UserType) => {
    setCurrentUser(user);
    handleClose();
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          px: 1,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 24, height: 24, fontSize: '1rem' }}>
            {userDetails[currentUser].avatar}
          </Avatar>
          <Typography variant="body2" fontWeight={500}>
            {currentUser}
          </Typography>
          <KeyboardArrowDownIcon fontSize="small" />
        </Stack>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {Object.entries(userDetails).map(([user, details]) => (
          <MenuItem
            key={user}
            onClick={() => handleUserChange(user as UserType)}
            selected={currentUser === user}
            sx={{ minWidth: 150 }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography>{details.avatar}</Typography>
              <Typography>{user}</Typography>
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
