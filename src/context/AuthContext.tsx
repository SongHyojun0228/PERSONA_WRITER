import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  username: string | null;
  loading: boolean;
  inspirationCount: number | null;
  needsUsername: boolean;
  setUsername: (username: string) => void;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) =>  {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [inspirationCount, setInspirationCount] = useState<number | null>(null);

  const fetchAndSetInspirationCount = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('inspiration_count')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching inspiration count:', error);
      setInspirationCount(0);
    } else {
      setInspirationCount(data?.inspiration_count || 0);
    }
  };

  const refreshUserProfile = async () => {
    if (user?.id) {
      await fetchAndSetInspirationCount(user.id);
    }
  };

  // Called after setting username via API - updates local state to reflect new username
  const handleSetUsername = (newUsername: string) => {
    setUsername(newUsername);
    // Update the user object's metadata so needsUsername becomes false
    setUser(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        user_metadata: { ...prev.user_metadata, username: newUsername },
      };
    });
  };

  const resolveUsername = (user: User | null): string | null => {
    if (!user) return null;
    const meta = user.user_metadata;
    return (meta?.username as string)
      || (meta?.full_name as string)
      || (meta?.name as string)
      || (meta?.preferred_username as string)
      || null;
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setUsername(resolveUsername(session?.user || null));
      setLoading(false);
    });

    // Initial session load
    supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user || null);
        setUsername(resolveUsername(session?.user || null));
        setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchAndSetInspirationCount(user.id);
    } else {
      setInspirationCount(null);
    }
  }, [user]);

  // User is logged in but has no username in metadata (e.g. Kakao OAuth without username setup)
  const needsUsername = !loading && !!session && !user?.user_metadata?.username;

  const value = { session, user, username, loading, inspirationCount, needsUsername, setUsername: handleSetUsername, refreshUserProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};