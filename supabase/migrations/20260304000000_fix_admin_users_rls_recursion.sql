-- Fix infinite recursion in admin_users RLS policy.
-- The original policy used EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
-- which caused recursion when instagram_posts (and other tables) check admin status.
-- Replace with a simple self-check: users can only read their own row.

DROP POLICY IF EXISTS "Only admins can view admin_users" ON admin_users;

CREATE POLICY "Users can view own admin row" ON admin_users
  FOR SELECT USING (id = auth.uid());
