import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { showNotification } from '@mantine/notifications';
import { UserType } from '../types';

interface UserContextType {
  currentUser: UserType;
  setCurrentUser: (user: UserType) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserType>(() => {
    return localStorage.getItem('currentUser') as UserType || 'El';
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSetCurrentUser = (user: UserType) => {
    setIsLoading(true);
    setCurrentUser(user);
    setTimeout(() => setIsLoading(false), 100); // Give time for state to update
  };

  useEffect(() => {
    localStorage.setItem('currentUser', currentUser);
    showNotification({
      title: 'User Switched',
      message: `Now viewing ${currentUser}'s habits`,
      color: 'blue'
    });
  }, [currentUser]);

  const value = useMemo(() => ({
    currentUser,
    setCurrentUser: handleSetCurrentUser,
    isLoading
  }), [currentUser, isLoading]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
