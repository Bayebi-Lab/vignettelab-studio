import { supabase } from './supabase';

export interface AdminUser {
  id: string;
  email: string;
}

/**
 * Sign in admin user
 * Uses /api/verify-admin to check admin status (bypasses RLS via service role)
 */
export async function signInAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  const token = data.session?.access_token;
  if (!token) {
    await supabase.auth.signOut();
    throw new Error('Failed to get session');
  }

  const res = await fetch('/api/verify-admin', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    await supabase.auth.signOut();
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Access denied. Admin privileges required.');
  }

  const { admin: adminUser } = await res.json();
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
 * Uses /api/verify-admin to bypass RLS (client query to admin_users can fail due to circular policy)
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    return null;
  }

  const res = await fetch('/api/verify-admin', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    return null;
  }

  const { admin: adminUser } = await res.json();
  return adminUser || null;
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const admin = await getCurrentAdmin();
  return admin !== null;
}
