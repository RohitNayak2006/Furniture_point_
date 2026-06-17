import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase, type Product, type WishlistItem } from '../lib/supabase';
import { useAuth } from './AuthContext';

type WishlistContextType = {
  items: WishlistItem[];
  productIds: Set<string>;
  toggle: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  isOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const LOCAL_KEY = 'fp_guest_wishlist';

function loadLocalWishlist(): string[] {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'); }
  catch { return []; }
}

function saveLocalWishlist(ids: string[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(ids));
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const productIds = new Set(items.map(i => i.product_id));
  const isInWishlist = (productId: string) => productIds.has(productId);

  const loadWishlist = useCallback(async () => {
    if (user) {
      const { data } = await supabase
        .from('wishlists')
        .select('*, product:products(*)')
        .eq('user_id', user.id);
      if (data) setItems(data as WishlistItem[]);
    } else {
      const ids = loadLocalWishlist();
      setItems(ids.map(id => ({ id: `local_${id}`, user_id: '', product_id: id })));
    }
  }, [user]);

  useEffect(() => { loadWishlist(); }, [loadWishlist]);

  useEffect(() => {
    if (!user) return;
    const local = loadLocalWishlist();
    if (local.length === 0) return;
    const inserts = local.map(product_id => ({ user_id: user.id, product_id }));
    supabase.from('wishlists').upsert(inserts, { onConflict: 'user_id,product_id' }).then(() => {
      localStorage.removeItem(LOCAL_KEY);
      loadWishlist();
    });
  }, [user, loadWishlist]);

  const toggle = async (product: Product) => {
    if (user) {
      if (isInWishlist(product.id)) {
        await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', product.id);
      } else {
        await supabase.from('wishlists').insert({ user_id: user.id, product_id: product.id });
      }
      loadWishlist();
    } else {
      const ids = loadLocalWishlist();
      if (ids.includes(product.id)) {
        saveLocalWishlist(ids.filter(id => id !== product.id));
      } else {
        saveLocalWishlist([...ids, product.id]);
      }
      loadWishlist();
    }
  };

  return (
    <WishlistContext.Provider value={{ items, productIds, toggle, isInWishlist, isOpen, openWishlist: () => setIsOpen(true), closeWishlist: () => setIsOpen(false) }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
