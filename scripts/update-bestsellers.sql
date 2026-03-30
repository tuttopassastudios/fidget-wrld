-- Add is_out_of_stock column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_out_of_stock BOOLEAN NOT NULL DEFAULT false;

-- Mark old products as out of stock and remove bestseller status
UPDATE products
SET is_out_of_stock = true, is_bestseller = false
WHERE slug IN ('magnet-balls', 'stress-ball-set', 'fidget-cube');

-- Ensure CJ products are bestsellers (not out of stock)
UPDATE products
SET is_bestseller = true, is_out_of_stock = false
WHERE slug IN ('cj-spinner-keychain', 'cj-popcorn-squishy', 'cj-sticky-wall-ball');

-- Verify the changes
SELECT slug, name, is_bestseller, is_out_of_stock
FROM products
WHERE is_bestseller = true OR slug IN ('magnet-balls', 'stress-ball-set', 'fidget-cube')
ORDER BY is_bestseller DESC, slug;
