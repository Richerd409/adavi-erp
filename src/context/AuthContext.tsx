import React, { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import { AuthContext, AuthContextType } from './auth-context';

type UserRole = Database['public']['Tables']['users']['Row']['role'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserDetails(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserDetails(session.user.id);
      } else {
        setRole(null);
        setLocation(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserDetails = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role, location')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user details:', error);
        setRole(null);
        setLocation(null);
      } else {
        setRole(data.role);
        setLocation(data.location);
      }
    } catch (err) {
      console.error('Unexpected error fetching details:', err);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setLocation(null);
  };

  const value: AuthContextType = { user, role, location, loading, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
