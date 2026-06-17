import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { User, Package, Settings, LayoutDashboard, Heart, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '../contexts/ToastContext';
import { supabase, type Product } from '../lib/supabase';

const ACCOUNT_NAV = [
  { label: 'Profile', icon: User, path: '/account' },
  { label: 'Orders', icon: Package, path: '/account/orders' },
  { label: 'Wishlist', icon: Heart, path: '/account/wishlist' },
  { label: 'Settings', icon: Settings, path: '/account/settings' },
  { label: 'Admin', icon: LayoutDashboard, path: '/admin' },
];

export default function AccountPage() {
  const { user, signOut, isAdmin } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User size={48} className="mx-auto text-on-surface-variant/30 mb-4" />
          <p className="font-headline-sm text-on-surface-variant mb-4">Please sign in to access your account</p>
          <Link to="/login" className="inline-block bg-charcoal text-white font-button px-8 py-4 rounded-lg btn-hover-lift">Sign In</Link>
        </div>
      </div>
    );
  }

  const navItems = ACCOUNT_NAV.filter(item => item.path !== '/admin' || isAdmin);

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-container-max mx-auto px-margin-mobile lg:px-margin-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-stack-lg">
          <div>
            <div className="p-4 bg-surface-container rounded-lg mb-4">
              <p className="font-body-lg font-medium text-on-surface">{user.user_metadata?.name || user.email}</p>
              <p className="font-label-caps text-on-surface-variant mt-0.5">{user.email}</p>
            </div>
            <nav className="space-y-1">
              {navItems.map(({ label, icon: Icon, path }) => (
                <Link key={path} to={path} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-body-md transition-colors ${location.pathname === path ? 'bg-secondary/10 text-secondary font-medium' : 'text-on-surface-variant hover:bg-surface-container'}`}>
                  <Icon size={18} /> {label}
                </Link>
              ))}
              <button onClick={signOut} className="flex items-center gap-3 px-4 py-3 rounded-lg font-body-md text-error hover:bg-error-container w-full">
                <LogOut size={18} /> Sign Out
              </button>
            </nav>
          </div>
          <div className="lg:col-span-3">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileTab() {
  const { user } = useAuth();
  return (
    <div>
      <h2 className="font-headline-md text-on-surface mb-6">My Profile</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'Name', value: user?.user_metadata?.name || 'Not set' },
          { label: 'Email', value: user?.email || '' },
          { label: 'Phone', value: user?.user_metadata?.phone || 'Not set' },
          { label: 'Member Since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : '' },
        ].map(({ label, value }) => (
          <div key={label} className="p-4 bg-surface-container rounded-lg">
            <p className="font-label-caps text-on-surface-variant mb-1">{label}</p>
            <p className="font-body-md text-on-surface">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrdersTab() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => setOrders(data ?? []));
  }, [user]);

  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-gold/20 text-gold',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-secondary-fixed-dim text-on-secondary-fixed',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-error-container text-on-error-container',
  };

  return (
    <div>
      <h2 className="font-headline-md text-on-surface mb-6">My Orders</h2>
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-on-surface-variant/20 mb-4" />
          <p className="font-body-lg text-on-surface-variant">No orders yet</p>
          <Link to="/" className="font-button text-secondary mt-2 inline-block hover:underline">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="border border-outline-variant rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-body-md font-medium text-on-surface">Order #{order.id.slice(0, 8)}</p>
                  <p className="font-label-caps text-on-surface-variant">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`font-label-caps px-3 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-surface-container text-on-surface-variant'}`}>{order.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body-md text-on-surface-variant">{order.order_items?.length || 0} items</span>
                <span className="font-body-lg font-semibold text-on-surface">${order.total.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function WishlistTab() {
  const { items } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (items.length === 0) return;
    const ids = items.map(i => i.product_id);
    supabase.from('products').select('*').in('id', ids).then(({ data }) => setProducts(data ?? []));
  }, [items]);

  return (
    <div>
      <h2 className="font-headline-md text-on-surface mb-6">My Wishlist</h2>
      {products.length === 0 ? (
        <div className="text-center py-12">
          <Heart size={48} className="mx-auto text-on-surface-variant/20 mb-4" />
          <p className="font-body-lg text-on-surface-variant">Your wishlist is empty</p>
          <Link to="/" className="font-button text-secondary mt-2 inline-block hover:underline">Explore Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(p => (
            <Link key={p.id} to={`/product/${p.slug}`} className="group block">
              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-surface-container mb-2">
                <img src={p.image_urls?.[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h3 className="font-body-md font-medium text-on-surface">{p.name}</h3>
              <p className="font-body-md text-on-surface-variant">${p.price.toLocaleString()}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function SettingsTab() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [phone, setPhone] = useState(user?.user_metadata?.phone || '');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ data: { name, phone } });
    if (error) addToast(error.message, 'error');
    else addToast('Profile updated', 'success');
    setSaving(false);
  };

  return (
    <div>
      <h2 className="font-headline-md text-on-surface mb-6">Account Settings</h2>
      <div className="max-w-md space-y-4">
        <div>
          <label className="font-label-caps text-on-surface-variant block mb-1">Display Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="form-input" />
        </div>
        <div>
          <label className="font-label-caps text-on-surface-variant block mb-1">Phone</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} className="form-input" />
        </div>
        <div>
          <label className="font-label-caps text-on-surface-variant block mb-1">Email</label>
          <input value={user?.email || ''} disabled className="form-input opacity-50" />
        </div>
        <button onClick={handleSave} disabled={saving} className="bg-charcoal text-white font-button px-8 py-3 rounded-lg btn-hover-lift disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
