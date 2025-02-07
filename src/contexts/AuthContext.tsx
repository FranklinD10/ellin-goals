import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth, signInAnonymousUser } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);

      // If no user, sign in anonymously
      if (!user) {
        signInAnonymousUser().catch(console.error);
      }
    });

    return unsubscribe;
  }, []);

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
