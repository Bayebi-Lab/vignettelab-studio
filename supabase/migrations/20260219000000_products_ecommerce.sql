-- Create products table (ecommerce model - replaces packages)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2),
  portraits_count INTEGER NOT NULL DEFAULT 1,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  category VARCHAR(100) DEFAULT 'maternity',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for slug lookups
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category);

-- Add product_id to orders (for new product-based orders)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id);

-- Trigger for products updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS for products (public read)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- Insert default products
INSERT INTO products (name, slug, description, price, compare_at_price, portraits_count, features, images)
VALUES
  (
    'Essential Glow',
    'essential-glow',
    'Capture your pregnancy glow with our entry-level maternity portrait package. Perfect for first-time moms who want beautiful, shareable bump photos without the hassle of a photoshoot.',
    29.00,
    NULL,
    5,
    '["5 AI-generated maternity portraits", "1 portrait style", "Standard resolution", "24-hour delivery", "Basic retouching"]'::jsonb,
    '[]'::jsonb
  ),
  (
    'Glow Package',
    'glow-package',
    'Our most popular package for expecting mothers. Get a beautiful collection of maternity portraits in multiple styles to cherish forever.',
    79.00,
    99.00,
    20,
    '["20 AI-generated maternity portraits", "3 portrait styles", "High resolution", "12-hour priority delivery", "Advanced retouching", "2 revision rounds", "Print-ready files"]'::jsonb,
    '[]'::jsonb
  ),
  (
    'Complete Collection',
    'complete-collection',
    'The ultimate maternity portrait experience. Everything you need for a complete pregnancy photography collection including unlimited styles and dedicated support.',
    149.00,
    199.00,
    50,
    '["50 AI-generated maternity portraits", "Unlimited styles", "Ultra-high resolution", "6-hour express delivery", "Premium retouching", "Unlimited revisions", "Print-ready files", "Custom backgrounds", "Dedicated support"]'::jsonb,
    '[]'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;
