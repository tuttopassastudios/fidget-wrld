-- Add print_status column to orders table for 3D-printed order workflow
-- Values: pending_review → approved → printing → ready_to_ship → shipped

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS print_status TEXT
    CHECK (print_status IN ('pending_review', 'approved', 'printing', 'ready_to_ship', 'shipped'));

CREATE INDEX IF NOT EXISTS idx_orders_print_status ON orders(print_status)
  WHERE print_status IS NOT NULL;
