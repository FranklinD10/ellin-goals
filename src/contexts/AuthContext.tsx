import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth, signInAnonymousUser } from '../lib/firebase';
import { useNotification } from './NotificationContext';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    let retryCount = 0;
    let mounted = true;

    const connectAuth = async () => {
      try {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (!mounted) return;
          setUser(user);
          setLoading(false);

          // If no user, sign in anonymously
          if (!user) {
            signInAnonymousUser().catch(console.error);
          }
        });
        return unsubscribe;
      } catch (error) {
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return connectAuth();
        }
        showNotification({
          title: 'Authentication Error',
          message: 'Failed to connect to authentication service',
          color: 'error'
        });
        setLoading(false);
      }
    };

    connectAuth();
    return () => { mounted = false; };
  }, [showNotification]);

  const signIn = async () => {
    try {
      await signInAnonymousUser();
    } catch (error) {
      console.error('Failed to sign in:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
