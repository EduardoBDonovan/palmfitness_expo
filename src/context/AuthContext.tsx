import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User as AppUser } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: AppUser | null;
  isAuthenticated: boolean;
  isProfileReady: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileReady, setIsProfileReady] = useState(false);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setIsProfileReady(false);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          body_metrics:user_body_metrics(*),
          goals:user_goals(*),
          credentials:user_credentials(*)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile not found
          setIsProfileReady(false);
        } else {
          console.error('Error fetching profile:', error);
        }
      } else {
        const metricsData = Array.isArray(data.body_metrics) ? data.body_metrics[0] : data.body_metrics;
        
        // Map data to ensure arrays are correctly handled
        const mappedProfile: AppUser = {
          ...data,
          body_metrics: metricsData,
          build: metricsData ? {
            body_type: metricsData.body_type,
            activity_level: metricsData.activity_level,
            experience_level: metricsData.experience_level,
            last_updated: metricsData.build_updated_at || metricsData.updated_at
          } : undefined,
          goals: data.goals || [],
          credentials: data.credentials || [],
          is_physio_tab_visible: data.is_physio_tab_visible ?? data.physio_tab_visible ?? true,
          posts_count: data.posts ?? 0,
          followers_count: data.followers ?? 0,
          following_count: data.following ?? 0,
          subscribers_count: data.subscribers ?? 0,
          subscriptions_count: data.subscriptions ?? 0,
        };
        setProfile(mappedProfile);
        setIsProfileReady(true);
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const value = {
    session,
    user,
    profile,
    isAuthenticated: !!user,
    isProfileReady,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
