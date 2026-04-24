import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

type UserRole = 'Gardener' | 'Land Host' | 'Both';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location?: { lat: number; lng: number };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  // Supabase Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'Gardener',
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'Gardener',
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('API key') || error.message.includes('anon key') || import.meta.env.VITE_SUPABASE_URL?.includes('placeholder')) {
         console.warn('Falling back to mock login (Supabase credentials missing)');
         setUser({ id: 'mock-1', name: 'Demo User', email, role: 'Gardener' });
         return;
      }
      throw error;
    }
    
    if (data?.session?.user) {
      setUser({
        id: data.session.user.id,
        name: data.session.user.user_metadata?.name || data.session.user.email?.split('@')[0] || 'User',
        email: data.session.user.email || '',
        role: data.session.user.user_metadata?.role || 'Gardener',
      });
    }
  };

  const signup = async (userData: any) => {
    const { email, password, name, role } = userData;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role }
      }
    });
    if (error) {
      if (error.message.includes('API key') || error.message.includes('anon key') || import.meta.env.VITE_SUPABASE_URL?.includes('placeholder')) {
         console.warn('Falling back to mock signup (Supabase credentials missing)');
         setUser({ id: 'mock-1', name, email, role });
         return;
      }
      throw error;
    }

    if (data?.session?.user) {
      setUser({
        id: data.session.user.id,
        name: data.session.user.user_metadata?.name || data.session.user.email?.split('@')[0] || 'User',
        email: data.session.user.email || '',
        role: data.session.user.user_metadata?.role || 'Gardener',
      });
    } else if (data?.user && !data?.session) {
      throw new Error("Signup successful! Please check your email to confirm your account before logging in. If you don't receive an email, disable 'Confirm email' in Supabase Authentication settings.");
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user, theme, toggleTheme }}>
      {children}
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
