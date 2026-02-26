import { createContext } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

type UserRole = Database['public']['Tables']['users']['Row']['role'];

export interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithOtp: (email: string) => Promise<{ error: any }>;
  bypassAuth: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
