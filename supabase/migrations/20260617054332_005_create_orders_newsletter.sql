CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing','shipped','delivered','cancelled')),
  subtotal numeric(10,2) NOT NULL,
  shipping_cost numeric(10,2) DEFAULT 0,
  tax numeric(10,2) DEFAULT 0,
  total numeric(10,2) NOT NULL,
  shipping_address jsonb DEFAULT '{}',
  billing_address jsonb DEFAULT '{}',
  delivery_method text DEFAULT 'standard',
  tracking_number text,
  concierge_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_image text,
  variant_info text,
  price numeric(10,2) NOT NULL,
  quantity int NOT NULL DEFAULT 1
);

CREATE TABLE newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  subscribed_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_user_select" ON orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "orders_user_insert" ON orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_user_update" ON orders FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "orders_admin_select" ON orders FOR SELECT TO authenticated USING (true);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_user_select" ON order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "order_items_user_insert" ON order_items FOR INSERT TO authenticated WITH CHECK (true);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "newsletter_insert" ON newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
