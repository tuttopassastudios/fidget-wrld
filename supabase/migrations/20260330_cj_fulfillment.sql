-- Add CJ Dropshipping fulfillment fields to orders table
-- Run this migration in Supabase SQL Editor

-- Add phone number field (required by CJ for shipping)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add CJ fulfillment fields
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cj_order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cj_order_status TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cj_tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_error TEXT;

-- Create index for CJ order lookup
CREATE INDEX IF NOT EXISTS idx_orders_cj_order_id ON orders(cj_order_id);

-- Create index for finding orders that need fulfillment retry
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_retry
ON orders(cj_order_id, fulfillment_error)
WHERE cj_order_id IS NULL AND fulfillment_error IS NOT NULL;

COMMENT ON COLUMN orders.phone IS 'Customer phone number for CJ shipping';
COMMENT ON COLUMN orders.cj_order_id IS 'CJ Dropshipping order ID once fulfilled';
COMMENT ON COLUMN orders.cj_order_status IS 'CJ order status (pending, shipped, delivered, etc.)';
COMMENT ON COLUMN orders.cj_tracking_number IS 'Shipping tracking number from CJ';
COMMENT ON COLUMN orders.fulfillment_error IS 'Error message if CJ fulfillment failed';
