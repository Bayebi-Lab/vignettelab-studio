import { supabase } from './supabase';

export interface AdminUser {
  id: string;
  email: string;
}

/**
 * Sign in admin user
 */
export async function signInAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  // Verify user is an admin
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id, email')
    .eq('id', data.user.id)
    .single();

  if (!adminUser) {
    await supabase.auth.signOut();
    throw new Error('Access denied. Admin privileges required.');
  }

  return { user: data.user, adminUser };
}

/**
 * Sign out admin user
 */
export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

/**
 * Get current admin user
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id, email')
    .eq('id', user.id)
    .single();

  return adminUser || null;
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const admin = await getCurrentAdmin();
  return admin !== null;
}
