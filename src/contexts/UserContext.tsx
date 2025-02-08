import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { showNotification } from '@mantine/notifications';
import { UserType, UserData } from '../types';
import { getUserData } from '../lib/firestore';
import { LoadingOverlay } from '@mantine/core';

interface UserContextType {
  currentUser: UserType;
  userData: UserData | null;
  setCurrentUser: (user: UserType) => void;
  isTransitioning: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserType>(() => 
    (localStorage.getItem('currentUser') as UserType) || 'El'
  );
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleUserChange = async (user: UserType) => {
    setIsTransitioning(true);
    localStorage.setItem('currentUser', user);
    setCurrentUser(user);
    
    // Force a small delay to ensure state updates propagate
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Show notification here instead of in the effect
    showNotification({
      title: 'User Switched',
      message: `Now viewing ${user}'s habits`,
      color: 'blue'
    });
    
    setIsTransitioning(false);
  };

  useEffect(() => {
    const loadUserData = async () => {
      if (!isTransitioning) {
        const data = await getUserData(currentUser);
        setUserData(data);
      }
    };

    loadUserData();
  }, [currentUser, isTransitioning]);

  return (
    <UserContext.Provider 
      value={{ 
        currentUser, 
        userData,
        setCurrentUser: handleUserChange, 
        isTransitioning 
      }}
    >
      {children}
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
