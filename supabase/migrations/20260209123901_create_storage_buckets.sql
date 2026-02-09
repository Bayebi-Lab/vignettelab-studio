-- Create storage buckets for image uploads
-- uploaded-images: private bucket for customer uploads
-- final-images: public bucket for final processed portraits

-- Create uploaded-images bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploaded-images',
  'uploaded-images',
  false,
  52428800, -- 50MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create final-images bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'final-images',
  'final-images',
  true,
  52428800, -- 50MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for uploaded-images bucket (private)
-- Allow anyone to upload (needed for anonymous checkout flow)
CREATE POLICY "Anyone can upload images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'uploaded-images');

-- Users can view their own uploaded images (by owner)
CREATE POLICY "Users can view their own uploaded images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'uploaded-images' AND owner = auth.uid());

-- Allow anonymous users to view if they have the path (for checkout flow)
-- Note: This is less secure but needed for the checkout flow
-- In production, consider using signed URLs instead
CREATE POLICY "Public can view uploaded images with path"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'uploaded-images');

-- Users can delete their own uploaded images
CREATE POLICY "Users can delete their own uploaded images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'uploaded-images' AND owner = auth.uid());

-- Storage policies for final-images bucket (public)
-- Anyone can view final images (public bucket)
CREATE POLICY "Public can view final images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'final-images');

-- Only authenticated users (admins) can upload final images
-- Check if user is admin via admin_users table
CREATE POLICY "Admins can upload final images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'final-images' AND
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
  )
);

-- Only authenticated users (admins) can delete final images
CREATE POLICY "Admins can delete final images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'final-images' AND
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
  )
);
