import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/api/client';

interface AdminUser {
  id: number;
  email: string;
  full_name: string;
}

interface AuthContextValue {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  initializing: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setInitializing(false);
      return;
    }
    api
      .get<AdminUser>('/api/auth/me')
      .then(setAdmin)
      .catch(() => localStorage.removeItem('admin_token'))
      .finally(() => setInitializing(false));
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post<{ access_token: string }>('/api/auth/login', { email, password });
      localStorage.setItem('admin_token', res.access_token);
      const me = await api.get<AdminUser>('/api/auth/me');
      setAdmin(me);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, isAuthenticated: !!admin, login, logout, loading, initializing }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
