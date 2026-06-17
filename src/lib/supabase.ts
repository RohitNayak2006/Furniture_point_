import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export type Product = {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  price: number;
  compare_at_price: number | null;
  material: string;
  color: string;
  style: string;
  sku: string;
  description: string;
  specs: Record<string, string>;
  image_urls: string[];
  is_new_arrival: boolean;
  is_featured: boolean;
  is_special_edition: boolean;
  is_sustainable: boolean;
  stock_count: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: number;
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  product?: Product;
};

export type WishlistItem = {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
};

export type Order = {
  id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  shipping_address: Record<string, string>;
  billing_address: Record<string, string> | null;
  tracking_number: string | null;
  created_at: string;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: Product;
};

export type ProductReview = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  body: string;
  is_verified: boolean;
  created_at: string;
};
