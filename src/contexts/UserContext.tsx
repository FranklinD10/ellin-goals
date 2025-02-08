import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { showNotification } from '@mantine/notifications';
import { UserType, UserData } from '../types';
import { getUserData, getUserHabits } from '../lib/firestore';
import { LoadingOverlay } from '@mantine/core';

interface UserContextType {
  currentUser: UserType;
  userData: UserData | null;
  setCurrentUser: (user: UserType) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserType>(
    (localStorage.getItem('currentUser') as UserType) || 'El'
  );
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      const data = await getUserData(currentUser);
      setUserData(data);
      setIsLoading(false);
    };

    loadUserData();
  }, [currentUser]);

  const handleSetUser = (user: UserType) => {
    setIsLoading(true);
    setCurrentUser(user);
    localStorage.setItem('currentUser', user);
  };

  useEffect(() => {
    if (!isLoading) {
      showNotification({
        title: 'User Switched',
        message: `Now viewing ${currentUser}'s habits`,
        color: 'blue'
      });
    }
  }, [currentUser, isLoading]);

  if (isLoading) {
    return <LoadingOverlay visible={true} overlayBlur={2} />;
  }

  return (
    <UserContext.Provider 
      value={{ 
        currentUser, 
        userData,
        setCurrentUser: handleSetUser, 
        isLoading 
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
