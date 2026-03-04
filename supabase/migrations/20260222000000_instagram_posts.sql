-- Instagram posts table for hand-picked Instagram Moments section
-- image_url stores public links (Instagram CDN or any public URL)

CREATE TABLE instagram_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  permalink TEXT NOT NULL,
  media_type VARCHAR(20) DEFAULT 'IMAGE' CHECK (media_type IN ('IMAGE', 'VIDEO')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_instagram_posts_sort ON instagram_posts(sort_order);

-- Row Level Security
ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY;

-- Public can view all posts
CREATE POLICY "Instagram posts are viewable by everyone" ON instagram_posts
  FOR SELECT USING (true);

-- Only admins can insert, update, delete
CREATE POLICY "Admins can insert instagram_posts" ON instagram_posts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update instagram_posts" ON instagram_posts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can delete instagram_posts" ON instagram_posts
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );
