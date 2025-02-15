import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { UserType, UserData } from '../types';
import { getUserData } from '../lib/firestore';
import { useNotification } from './NotificationContext';

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
  const { showNotification } = useNotification();

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
