import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase, type Product, type CartItem } from '../lib/supabase';
import { useAuth } from './AuthContext';

type CartContextType = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_KEY = 'fp_guest_cart';

type LocalCartItem = { productId: string; quantity: number; product: Product };

function loadLocalCart(): LocalCartItem[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch { return []; }
}

function saveLocalCart(items: LocalCartItem[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + (i.product?.price ?? 0) * i.quantity, 0);

  const loadCart = useCallback(async () => {
    if (user) {
      const { data } = await supabase
        .from('cart_items')
        .select('*, product:products(*)')
        .eq('user_id', user.id);
      if (data) setItems(data as CartItem[]);
    } else {
      const local = loadLocalCart();
      setItems(local.map(i => ({
        id: `local_${i.productId}`,
        user_id: '',
        product_id: i.productId,
        variant_id: null,
        quantity: i.quantity,
        product: i.product,
      })));
    }
  }, [user]);

  useEffect(() => { loadCart(); }, [loadCart]);

  const mergeLocalToSupabase = useCallback(async () => {
    if (!user) return;
    const local = loadLocalCart();
    if (local.length === 0) return;
    for (const item of local) {
      await supabase
        .from('cart_items')
        .upsert({ user_id: user.id, product_id: item.productId, quantity: item.quantity }, { onConflict: 'user_id,product_id,variant_id' });
    }
    localStorage.removeItem(LOCAL_KEY);
    loadCart();
  }, [user, loadCart]);

  useEffect(() => { if (user) mergeLocalToSupabase(); }, [user, mergeLocalToSupabase]);

  const addItem = async (product: Product, quantity = 1) => {
    if (user) {
      const existing = items.find(i => i.product_id === product.id);
      if (existing) {
        await supabase.from('cart_items').update({ quantity: existing.quantity + quantity }).eq('id', existing.id);
      } else {
        await supabase.from('cart_items').insert({ user_id: user.id, product_id: product.id, quantity });
      }
      loadCart();
    } else {
      const local = loadLocalCart();
      const existing = local.find(i => i.productId === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        local.push({ productId: product.id, quantity, product });
      }
      saveLocalCart(local);
      loadCart();
    }
  };

  const removeItem = async (itemId: string) => {
    if (user && !itemId.startsWith('local_')) {
      await supabase.from('cart_items').delete().eq('id', itemId);
      loadCart();
    } else {
      const productId = itemId.replace('local_', '');
      const local = loadLocalCart().filter(i => i.productId !== productId);
      saveLocalCart(local);
      loadCart();
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) { removeItem(itemId); return; }
    if (user && !itemId.startsWith('local_')) {
      await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
      loadCart();
    } else {
      const productId = itemId.replace('local_', '');
      const local = loadLocalCart().map(i => i.productId === productId ? { ...i, quantity } : i);
      saveLocalCart(local);
      loadCart();
    }
  };

  const clearCart = async () => {
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id);
    } else {
      localStorage.removeItem(LOCAL_KEY);
    }
    setItems([]);
  };

  return (
    <CartContext.Provider value={{ items, count, total, addItem, removeItem, updateQuantity, clearCart, isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false) }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
