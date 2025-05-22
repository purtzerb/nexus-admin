'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Define user type based on the User model
interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SOLUTIONS_ENGINEER' | 'CLIENT_USER';
  assignedClientIds?: string[];
  costRate?: number;
  billRate?: number;
  clientId?: string;
  departmentId?: string;
  notifyByEmailForExceptions?: boolean;
  notifyBySmsForExceptions?: boolean;
  hasBillingAccess?: boolean;
  isClientAdmin?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isSolutionsEngineer: boolean;
  isClientUser: boolean;
  isAdminOrSE: boolean;
}

// Create an authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Provider component that wraps the app and makes auth available to any child component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if the user is authenticated on mount and when the component updates
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/auth/me');

        if (!response.ok) {
          if (response.status === 401) {
            // If not authenticated, redirect to login
            router.push('/login');
            return;
          }
          throw new Error('Authentication check failed');
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error('Authentication error:', error);
        setError(error instanceof Error ? error.message : 'Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      setUser(data.user);

      // Redirect based on role
      if (data.user.role === 'CLIENT_USER') {
        router.push('/client/dashboard');
      } else {
        router.push('/admin/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setError(error instanceof Error ? error.message : 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAdmin: user?.role === 'ADMIN',
    isSolutionsEngineer: user?.role === 'SOLUTIONS_ENGINEER',
    isClientUser: user?.role === 'CLIENT_USER',
    isAdminOrSE: user?.role === 'ADMIN' || user?.role === 'SOLUTIONS_ENGINEER',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
