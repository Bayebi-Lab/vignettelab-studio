-- Add is_most_popular attribute to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_most_popular BOOLEAN NOT NULL DEFAULT false;

-- Set Radiance Collection as the most popular package
UPDATE products SET is_most_popular = true WHERE slug = 'radiance-collection';
