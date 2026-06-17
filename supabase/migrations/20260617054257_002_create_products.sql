CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  price numeric(10,2) NOT NULL,
  compare_at_price numeric(10,2),
  material text,
  color text,
  style text,
  sku text,
  description text,
  specs jsonb DEFAULT '{}',
  image_urls text[] DEFAULT '{}',
  is_new_arrival boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  is_special_edition boolean DEFAULT false,
  is_sustainable boolean DEFAULT false,
  stock_count int DEFAULT 0,
  status text DEFAULT 'in_stock' CHECK (status IN ('in_stock','low_stock','out_of_stock')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_public_select" ON products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "products_admin_insert" ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "products_admin_update" ON products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "products_admin_delete" ON products FOR DELETE TO authenticated USING (true);
