-- TEST: Set first package (Timeless Glow) to 1 EUR for payment testing
-- Remove or revert this migration before production

UPDATE products SET
  price = 1.00,
  updated_at = NOW()
WHERE slug = 'timeless-glow';
