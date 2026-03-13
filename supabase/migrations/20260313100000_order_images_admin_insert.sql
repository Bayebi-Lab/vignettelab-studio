-- Allow admins to insert order_images (final portraits) and update orders
-- Fixes: "new row violates row-level security policy for table order_images"

-- Admins can insert order_images (for final portraits upload)
CREATE POLICY "Admins can insert order_images" ON order_images
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- Admins can update orders (e.g. status to completed)
CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );
