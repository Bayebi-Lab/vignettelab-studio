-- Add customer name and pregnancy week to orders

ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pregnancy_week INTEGER;
