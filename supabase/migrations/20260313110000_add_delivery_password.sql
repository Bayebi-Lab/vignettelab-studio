-- Add delivery password for protected download access
-- Generated when order is completed; customer receives it in the email
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_password VARCHAR(20);
