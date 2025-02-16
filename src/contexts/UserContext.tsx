import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Box, CircularProgress, Dialog, DialogTitle, List, ListItem, ListItemText, Avatar, Stack } from '@mui/material';
import { UserType, UserData } from '../types';
import { getUserData } from '../lib/firestore';
import { useNotification } from './NotificationContext';
import { getLastActiveUser, setLastActiveUser } from '../utils/userStorage';
import { useTheme } from './ThemeContext';
import { themes } from '../utils/theme-constants';

interface UserContextType {
  currentUser: UserType | null;
  userData: UserData | null;
  setCurrentUser: (user: UserType | null) => void;
  isTransitioning: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showUserSelect, setShowUserSelect] = useState(false);
  const { showNotification } = useNotification();
  const { themeColor } = useTheme();

  const userDetails: Record<UserType, { color: string; avatar: string }> = {
    El: { color: themes[themeColor]?.color || themes.pink.color, avatar: '👩' },
    Lin: { color: themes[themeColor]?.color || themes.blue.color, avatar: '👨' }
  };

  useEffect(() => {
    const lastUser = getLastActiveUser();
    if (lastUser && (lastUser === 'El' || lastUser === 'Lin')) {
      handleUserChange(lastUser as UserType);
    } else {
      setShowUserSelect(true);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setUserData(null);
      return;
    }

    const loadUserData = async () => {
      try {
        const data = await getUserData(currentUser);
        setUserData(data);
      } catch (error) {
        console.error('Error loading user data:', error);
        showNotification({
          title: 'Error',
          message: 'Failed to load user data',
          color: 'error'
        });
      }
    };

    loadUserData();
  }, [currentUser, showNotification]);

  const handleUserChange = (user: UserType | null) => {
    setIsTransitioning(true);
    setCurrentUser(user);
    if (user) {
      setLastActiveUser(user);
    }
    setShowUserSelect(false);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  return (
    <UserContext.Provider 
      value={{ 
        currentUser, 
        userData,
        setCurrentUser: handleUserChange, 
        isTransitioning 
      }}
    >
      <Dialog open={showUserSelect} disableEscapeKeyDown>
        <DialogTitle>Select User</DialogTitle>
        <List sx={{ pt: 0 }}>
          {Object.entries(userDetails).map(([user, details]) => (
            <ListItem 
              key={user}
              onClick={() => handleUserChange(user as UserType)}
              sx={{ cursor: 'pointer' }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: details.color }}>
                  {details.avatar}
                </Avatar>
                <ListItemText primary={user} />
              </Stack>
            </ListItem>
          ))}
        </List>
      </Dialog>
      <Box sx={{ position: 'relative', minHeight: '100vh' }}>
        {isTransitioning && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999
            }}
          >
            <CircularProgress size={48} />
          </Box>
        )}
        {children}
      </Box>
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
