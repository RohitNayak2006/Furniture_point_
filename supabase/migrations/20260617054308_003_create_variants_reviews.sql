CREATE TABLE product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size text,
  fabric text,
  leg_finish text,
  price_adjustment numeric(10,2) DEFAULT 0,
  stock_count int DEFAULT 0
);

CREATE TABLE product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  body text,
  is_verified boolean DEFAULT false,
  photos text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "variants_public_select" ON product_variants FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "variants_admin_all" ON product_variants FOR ALL TO authenticated USING (true);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_select" ON product_reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "reviews_user_insert" ON product_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_user_update" ON product_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);
