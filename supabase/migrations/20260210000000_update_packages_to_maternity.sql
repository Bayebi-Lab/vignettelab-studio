-- Update package names to maternity-focused names
UPDATE packages 
SET name = 'Essential Glow',
    features = '["5 AI-generated maternity portraits", "1 portrait style", "Standard resolution", "24-hour delivery", "Basic retouching"]'::jsonb
WHERE name = 'Starter';

UPDATE packages 
SET name = 'Glow Package',
    features = '["20 AI-generated maternity portraits", "3 portrait styles", "High resolution", "12-hour priority delivery", "Advanced retouching", "2 revision rounds", "Print-ready files"]'::jsonb
WHERE name = 'Family';

UPDATE packages 
SET name = 'Complete Collection',
    features = '["50 AI-generated maternity portraits", "Unlimited styles", "Ultra-high resolution", "6-hour express delivery", "Premium retouching", "Unlimited revisions", "Print-ready files", "Custom backgrounds", "Dedicated support"]'::jsonb
WHERE name = 'Professional';
