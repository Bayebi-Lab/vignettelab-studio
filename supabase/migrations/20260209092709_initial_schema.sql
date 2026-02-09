-- Enable UUID extension (Supabase uses gen_random_uuid() by default)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Packages table
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  portraits_count INTEGER NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email VARCHAR(255) NOT NULL,
  package_id UUID REFERENCES packages(id),
  package_name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  stripe_payment_intent_id VARCHAR(255),
  stripe_checkout_session_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order images table
CREATE TABLE order_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('uploaded', 'final')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users table (for Supabase Auth integration)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_images_order_id ON order_images(order_id);
CREATE INDEX idx_order_images_type ON order_images(type);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default packages
INSERT INTO packages (name, price, portraits_count, features) VALUES
  ('Starter', 29.00, 5, '["5 AI-generated portraits", "1 portrait style", "Standard resolution", "24-hour delivery", "Basic retouching"]'::jsonb),
  ('Family', 79.00, 20, '["20 AI-generated portraits", "3 portrait styles", "High resolution", "12-hour priority delivery", "Advanced retouching", "2 revision rounds", "Print-ready files"]'::jsonb),
  ('Professional', 149.00, 50, '["50 AI-generated portraits", "Unlimited styles", "Ultra-high resolution", "6-hour express delivery", "Premium retouching", "Unlimited revisions", "Print-ready files", "Custom backgrounds", "Dedicated support"]'::jsonb);

-- Row Level Security (RLS) Policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policies for packages (public read)
CREATE POLICY "Packages are viewable by everyone" ON packages
  FOR SELECT USING (true);

-- Policies for orders (users can only see their own orders)
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (true); -- We'll filter by email in application logic

-- Policies for order_images (users can only see images for their orders)
CREATE POLICY "Users can view images for their orders" ON order_images
  FOR SELECT USING (true); -- We'll filter by order_id in application logic

-- Policies for admin_users (only admins can view)
CREATE POLICY "Only admins can view admin_users" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );
