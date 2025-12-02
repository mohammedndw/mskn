import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, saveTokens, saveUser, getUser, clearAuth, isAuthenticated } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  ownerLogin: (nationalId: string) => Promise<void>;
  logout: () => void;
  hasRole: (roles: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize auth state from local storage
  useEffect(() => {
    const initializeAuth = () => {
      const storedUser = getUser();
      if (storedUser && isAuthenticated()) {
        setUser(storedUser);
      } else {
        clearAuth();
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const response_data = await response.json();
      const { user, token } = response_data.data;

      // Check if user is blocked
      if (user.isBlocked) {
        throw new Error('Your account has been blocked. Please contact support.');
      }

      // Save tokens and user data
      saveTokens({ accessToken: token });
      saveUser(user);
      setUser(user);

      toast({
        title: 'Login successful',
        description: `Welcome back, ${user.firstName}!`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid email or password',
      });
      throw error;
    }
  };

  const ownerLogin = async (nationalId: string) => {
    try {
      const response = await fetch('/api/auth/owner-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nationalId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Owner login failed');
      }

      const response_data = await response.json();
      const { user, token, propertyCount } = response_data.data;

      // Save tokens and user data
      saveTokens({ accessToken: token });
      saveUser(user);
      setUser(user);

      toast({
        title: 'Welcome!',
        description: `You have ${propertyCount} ${propertyCount === 1 ? 'property' : 'properties'} in your portfolio.`,
      });
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    clearAuth();
    setUser(null);

    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
  };

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    ownerLogin,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
