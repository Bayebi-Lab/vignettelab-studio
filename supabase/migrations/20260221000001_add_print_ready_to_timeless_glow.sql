-- Add Print-ready files to Timeless Glow package features

UPDATE products SET
  features = features || '["Print-ready files"]'::jsonb,
  updated_at = NOW()
WHERE slug = 'timeless-glow';
