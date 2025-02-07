import { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { UserType } from '../types';

interface UserContextType {
  currentUser: UserType;
  setCurrentUser: (user: UserType) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserType>('El');
  const [isLoading, setIsLoading] = useState(false);

  const value = useMemo(() => ({
    currentUser,
    setCurrentUser,
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
