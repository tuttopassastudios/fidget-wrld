-- Fidget WRLD Database Schema for Supabase
-- Run this in the Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types (enums)
CREATE TYPE product_category AS ENUM (
  'Magnetic',
  'Squishy',
  'Clicky',
  'Stretchy',
  'Desk Toy',
  'Collectible',
  'Gift Set'
);

CREATE TYPE mood AS ENUM ('calm', 'focus', 'play', 'collect');
CREATE TYPE audience AS ENUM ('kids', 'adults', 'office', 'all');
CREATE TYPE texture AS ENUM ('smooth', 'bumpy', 'soft', 'firm', 'mixed');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'cancelled');

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  category product_category NOT NULL,
  subcategory TEXT,
  variants JSONB NOT NULL DEFAULT '[]',
  default_variant_index INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  specifications JSONB NOT NULL DEFAULT '{}',
  moods mood[] NOT NULL DEFAULT '{}',
  audiences audience[] NOT NULL DEFAULT '{}',
  textures texture[] NOT NULL DEFAULT '{}',
  age_recommendation TEXT,
  materials TEXT[],
  dimensions TEXT,
  weight TEXT,
  is_new BOOLEAN NOT NULL DEFAULT false,
  is_bestseller BOOLEAN NOT NULL DEFAULT false,
  is_limited BOOLEAN NOT NULL DEFAULT false,
  related_slugs TEXT[],
  about TEXT,
  care_instructions TEXT,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster slug lookups
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_bestseller ON products(is_bestseller) WHERE is_bestseller = true;
CREATE INDEX idx_products_is_new ON products(is_new) WHERE is_new = true;

-- Collections table
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  product_slugs TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT false,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_collections_slug ON collections(slug);
CREATE INDEX idx_collections_featured ON collections(featured) WHERE featured = true;

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  email TEXT NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  stripe_payment_intent_id TEXT,
  promo_code TEXT,
  discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  print_status TEXT CHECK (print_status IN ('pending_review', 'approved', 'printing', 'ready_to_ship', 'shipped')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql'
SET search_path = '';

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Products: Anyone can read, only service role can write
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Products are editable by service role"
  ON products FOR ALL
  USING (auth.role() = 'service_role');

-- Collections: Anyone can read, only service role can write
CREATE POLICY "Collections are viewable by everyone"
  ON collections FOR SELECT
  USING (true);

CREATE POLICY "Collections are editable by service role"
  ON collections FOR ALL
  USING (auth.role() = 'service_role');

-- Orders: Users can view their own orders, service role can do everything
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Orders are fully managed by service role"
  ON orders FOR ALL
  USING (auth.role() = 'service_role');
