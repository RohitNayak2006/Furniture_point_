CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  banner_image_url text,
  display_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_select" ON categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "categories_admin_insert" ON categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "categories_admin_update" ON categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "categories_admin_delete" ON categories FOR DELETE TO authenticated USING (true);
