// src/contexts/AuthContext.tsx  (fixed — login() returns user for redirect)
import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<User>;  // returns User
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState<boolean>(!!localStorage.getItem('access_token'));

  // On mount: if token exists, fetch current user to rehydrate state
  useEffect(() => {
    if (localStorage.getItem('access_token') && !user) {
      fetchCurrentUser();
    }
  }, []);

  const fetchCurrentUser = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch {
      localStorage.removeItem('access_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<User> => {
    // Step 1 — get the JWT token
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const tokenRes = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const { access_token } = tokenRes.data;
    localStorage.setItem('access_token', access_token);
    setToken(access_token);

    // Step 2 — fetch the user profile with the new token
    const meRes = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const fetchedUser: User = meRes.data;
    setUser(fetchedUser);

    // Step 3 — return the user so the caller can redirect based on is_admin
    return fetchedUser;
  };

  const signup = async (email: string, username: string, password: string) => {
    await api.post('/auth/signup', { email, username, password });
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
