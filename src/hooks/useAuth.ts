import { useState, useEffect } from 'react';
import { getCurrentAdmin, signInAdmin, signOutAdmin, type AdminUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkSession();
      } else {
        setAdmin(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const currentAdmin = await getCurrentAdmin();
      setAdmin(currentAdmin);
    } catch (error) {
      console.error('Error checking session:', error);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { adminUser } = await signInAdmin(email, password);
      setAdmin(adminUser);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sign in',
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await signOutAdmin();
      setAdmin(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    admin,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!admin,
  };
}
