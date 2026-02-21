-- Update product packages with new names, descriptions, and pricing

UPDATE products SET
  name = 'Timeless Glow',
  slug = 'timeless-glow',
  description = 'Perfect for moms who want a few beautiful maternity portraits to capture this special moment.',
  price = 39.00,
  compare_at_price = NULL,
  updated_at = NOW()
WHERE slug = 'essential-glow';

UPDATE products SET
  name = 'Radiance Collection',
  slug = 'radiance-collection',
  description = 'Our most loved package for expecting mothers who want variety and premium quality.',
  price = 79.00,
  compare_at_price = NULL,
  updated_at = NOW()
WHERE slug = 'glow-package';

UPDATE products SET
  name = 'Eternal Moments',
  slug = 'eternal-moments',
  description = 'The ultimate maternity portrait experience with maximum portraits, premium retouching, and dedicated support.',
  price = 149.00,
  compare_at_price = NULL,
  updated_at = NOW()
WHERE slug = 'complete-collection';
