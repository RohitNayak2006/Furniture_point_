import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, type Product, type Category } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';

const ADMIN_NAV = [
  { label: 'Overview', icon: LayoutDashboard, path: '/admin' },
  { label: 'Inventory', icon: Package, path: '/admin/inventory' },
  { label: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
];

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  if (!user || !isAdmin) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LayoutDashboard size={48} className="mx-auto text-on-surface-variant/30 mb-4" />
          <p className="font-headline-sm text-on-surface-variant mb-4">Admin access required</p>
          <Link to="/login" className="font-button text-secondary hover:underline">Sign In as Admin</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-container-max mx-auto px-margin-mobile lg:px-margin-desktop">
        <h1 className="font-headline-lg text-on-surface mb-stack-md">Admin Dashboard</h1>
        <div className="flex gap-2 mb-stack-lg overflow-x-auto hide-scrollbar">
          {ADMIN_NAV.map(({ label, icon: Icon, path }) => (
            <Link key={path} to={path} className={`flex items-center gap-2 font-label-caps px-4 py-2 rounded-full border transition-colors whitespace-nowrap ${location.pathname === path ? 'bg-charcoal text-white border-charcoal' : 'border-outline-variant text-on-surface-variant hover:border-on-surface-variant'}`}>
              <Icon size={14} /> {label}
            </Link>
          ))}
        </div>
        <Outlet />
      </div>
    </div>
  );
}

export function AdminOverview() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, categories: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const [pRes, oRes, cRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('categories').select('id', { count: 'exact' }),
      ]);
      setStats({
        products: pRes.count ?? 0,
        orders: oRes.data?.length ?? 0,
        revenue: oRes.data?.reduce((s: number, o: any) => s + (o.total || 0), 0) ?? 0,
        categories: cRes.count ?? 0,
      });
      setRecentOrders(oRes.data ?? []);
    }
    load();
  }, []);

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-stack-lg">
        {[
          { label: 'Total Products', value: stats.products },
          { label: 'Categories', value: stats.categories },
          { label: 'Orders', value: stats.orders },
          { label: 'Revenue', value: `$${stats.revenue.toLocaleString()}` },
        ].map(stat => (
          <div key={stat.label} className="bg-surface-container rounded-lg p-6">
            <p className="font-label-caps text-on-surface-variant mb-1">{stat.label}</p>
            <p className="font-headline-lg text-on-surface">{stat.value}</p>
          </div>
        ))}
      </div>
      <h2 className="font-headline-sm text-on-surface mb-4">Recent Orders</h2>
      {recentOrders.length === 0 ? (
        <p className="font-body-md text-on-surface-variant">No orders yet.</p>
      ) : (
        <div className="border border-outline-variant rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-container">
              <tr>
                <th className="text-left font-label-caps text-on-surface-variant px-4 py-3">Order</th>
                <th className="text-left font-label-caps text-on-surface-variant px-4 py-3">Date</th>
                <th className="text-left font-label-caps text-on-surface-variant px-4 py-3">Status</th>
                <th className="text-right font-label-caps text-on-surface-variant px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} className="border-t border-outline-variant">
                  <td className="px-4 py-3 font-body-md text-on-surface">#{order.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 font-body-md text-on-surface-variant">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><span className="font-label-caps px-2 py-1 rounded-full bg-surface-container">{order.status}</span></td>
                  <td className="px-4 py-3 font-body-md font-semibold text-on-surface text-right">${order.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const { addToast } = useToast();

  const [form, setForm] = useState({
    name: '', slug: '', category_id: '', price: '', compare_at_price: '',
    material: '', color: '', style: '', sku: '', description: '', image_url: '',
    is_new_arrival: false, is_featured: false, is_sustainable: false, stock_count: '0', status: 'in_stock' as string,
  });

  useEffect(() => {
    async function load() {
      const [pRes, cRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('display_order'),
      ]);
      setProducts(pRes.data ?? []);
      setCategories(cRes.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const resetForm = () => {
    setForm({ name: '', slug: '', category_id: '', price: '', compare_at_price: '', material: '', color: '', style: '', sku: '', description: '', image_url: '', is_new_arrival: false, is_featured: false, is_sustainable: false, stock_count: '0', status: 'in_stock' });
    setEditProduct(null);
    setShowForm(false);
  };

  const startEdit = (p: Product) => {
    setForm({
      name: p.name, slug: p.slug, category_id: p.category_id, price: String(p.price),
      compare_at_price: p.compare_at_price ? String(p.compare_at_price) : '',
      material: p.material, color: p.color, style: p.style, sku: p.sku,
      description: p.description, image_url: p.image_urls?.[0] || '',
      is_new_arrival: p.is_new_arrival, is_featured: p.is_featured, is_sustainable: p.is_sustainable,
      stock_count: String(p.stock_count), status: p.status,
    });
    setEditProduct(p);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, ''),
      category_id: form.category_id,
      price: parseFloat(form.price),
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      material: form.material, color: form.color, style: form.style, sku: form.sku,
      description: form.description,
      image_urls: form.image_url ? [form.image_url] : [],
      is_new_arrival: form.is_new_arrival, is_featured: form.is_featured, is_sustainable: form.is_sustainable,
      stock_count: parseInt(form.stock_count), status: form.status,
    };

    if (editProduct) {
      const { error } = await supabase.from('products').update(payload).eq('id', editProduct.id);
      if (error) { addToast(error.message, 'error'); return; }
      addToast('Product updated', 'success');
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) { addToast(error.message, 'error'); return; }
      addToast('Product created', 'success');
    }

    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data ?? []);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { addToast(error.message, 'error'); return; }
    addToast('Product deleted', 'success');
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateForm = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-headline-sm text-on-surface">Product Inventory</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-charcoal text-white font-button px-4 py-2 rounded-lg flex items-center gap-2 btn-hover-lift">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[60] bg-on-surface/40 backdrop-blur-sm flex items-start justify-center pt-10 overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-lg p-6 w-full max-w-2xl my-8">
            <h3 className="font-headline-sm text-on-surface mb-4">{editProduct ? 'Edit Product' : 'New Product'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="font-label-caps text-on-surface-variant block mb-1">Name</label><input value={form.name} onChange={e => updateForm('name', e.target.value)} required className="form-input" /></div>
                <div><label className="font-label-caps text-on-surface-variant block mb-1">Slug</label><input value={form.slug} onChange={e => updateForm('slug', e.target.value)} placeholder="auto-generated" className="form-input" /></div>
                <div><label className="font-label-caps text-on-surface-variant block mb-1">Category</label>
                  <select value={form.category_id} onChange={e => updateForm('category_id', e.target.value)} required className="form-input">
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div><label className="font-label-caps text-on-surface-variant block mb-1">Price</label><input type="number" step="0.01" value={form.price} onChange={e => updateForm('price', e.target.value)} required className="form-input" /></div>
                <div><label className="font-label-caps text-on-surface-variant block mb-1">Compare At Price</label><input type="number" step="0.01" value={form.compare_at_price} onChange={e => updateForm('compare_at_price', e.target.value)} className="form-input" /></div>
                <div><label className="font-label-caps text-on-surface-variant block mb-1">SKU</label><input value={form.sku} onChange={e => updateForm('sku', e.target.value)} className="form-input" /></div>
                <div><label className="font-label-caps text-on-surface-variant block mb-1">Material</label><input value={form.material} onChange={e => updateForm('material', e.target.value)} className="form-input" /></div>
                <div><label className="font-label-caps text-on-surface-variant block mb-1">Color</label><input value={form.color} onChange={e => updateForm('color', e.target.value)} className="form-input" /></div>
                <div><label className="font-label-caps text-on-surface-variant block mb-1">Style</label><input value={form.style} onChange={e => updateForm('style', e.target.value)} className="form-input" /></div>
                <div><label className="font-label-caps text-on-surface-variant block mb-1">Stock</label><input type="number" value={form.stock_count} onChange={e => updateForm('stock_count', e.target.value)} className="form-input" /></div>
                <div><label className="font-label-caps text-on-surface-variant block mb-1">Status</label>
                  <select value={form.status} onChange={e => updateForm('status', e.target.value)} className="form-input">
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
                <div><label className="font-label-caps text-on-surface-variant block mb-1">Image URL</label><input value={form.image_url} onChange={e => updateForm('image_url', e.target.value)} className="form-input" /></div>
              </div>
              <div><label className="font-label-caps text-on-surface-variant block mb-1">Description</label><textarea value={form.description} onChange={e => updateForm('description', e.target.value)} rows={3} className="form-input resize-none" /></div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 font-body-md text-on-surface"><input type="checkbox" checked={form.is_new_arrival} onChange={e => updateForm('is_new_arrival', e.target.checked)} className="accent-secondary" /> New Arrival</label>
                <label className="flex items-center gap-2 font-body-md text-on-surface"><input type="checkbox" checked={form.is_featured} onChange={e => updateForm('is_featured', e.target.checked)} className="accent-secondary" /> Featured</label>
                <label className="flex items-center gap-2 font-body-md text-on-surface"><input type="checkbox" checked={form.is_sustainable} onChange={e => updateForm('is_sustainable', e.target.checked)} className="accent-secondary" /> Sustainable</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={resetForm} className="border border-outline-variant font-button px-6 py-3 rounded-lg">Cancel</button>
                <button type="submit" className="bg-charcoal text-white font-button px-8 py-3 rounded-lg btn-hover-lift">{editProduct ? 'Update Product' : 'Create Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      {loading ? <div className="animate-pulse h-64 bg-surface-container rounded-lg" /> : (
        <div className="border border-outline-variant rounded-lg overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-surface-container">
              <tr>
                <th className="text-left font-label-caps text-on-surface-variant px-4 py-3">Product</th>
                <th className="text-left font-label-caps text-on-surface-variant px-4 py-3">Category</th>
                <th className="text-left font-label-caps text-on-surface-variant px-4 py-3">Price</th>
                <th className="text-left font-label-caps text-on-surface-variant px-4 py-3">Stock</th>
                <th className="text-left font-label-caps text-on-surface-variant px-4 py-3">Status</th>
                <th className="text-left font-label-caps text-on-surface-variant px-4 py-3">Flags</th>
                <th className="text-right font-label-caps text-on-surface-variant px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-t border-outline-variant hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image_urls?.[0]} alt="" className="w-10 h-12 rounded object-cover" />
                      <div>
                        <p className="font-body-md font-medium text-on-surface">{p.name}</p>
                        <p className="font-label-caps text-on-surface-variant">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-body-md text-on-surface-variant">{categories.find(c => c.id === p.category_id)?.name}</td>
                  <td className="px-4 py-3 font-body-md text-on-surface">${p.price.toLocaleString()}{p.compare_at_price ? <span className="text-on-surface-variant line-through ml-1">${p.compare_at_price.toLocaleString()}</span> : null}</td>
                  <td className="px-4 py-3 font-body-md text-on-surface">{p.stock_count}</td>
                  <td className="px-4 py-3"><span className={`font-label-caps px-2 py-1 rounded-full ${p.status === 'in_stock' ? 'bg-green-100 text-green-700' : p.status === 'low_stock' ? 'bg-gold/20 text-gold' : 'bg-error-container text-on-error-container'}`}>{p.status.replace('_', ' ')}</span></td>
                  <td className="px-4 py-3 font-body-md text-on-surface-variant">
                    {p.is_new_arrival && 'N '}{p.is_featured && 'F '}{p.is_sustainable && 'S'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => startEdit(p)} className="font-button text-secondary hover:underline mr-3">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="font-button text-error hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }).then(({ data }) => {
      setOrders(data ?? []);
      setLoading(false);
    });
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) { addToast(error.message, 'error'); return; }
    addToast('Order status updated', 'success');
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

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
      <h2 className="font-headline-sm text-on-surface mb-6">Order Management</h2>
      {loading ? <div className="animate-pulse h-64 bg-surface-container rounded-lg" /> : orders.length === 0 ? (
        <p className="font-body-lg text-on-surface-variant">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="border border-outline-variant rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-body-lg font-medium text-on-surface">Order #{order.id.slice(0, 8)}</p>
                  <p className="font-label-caps text-on-surface-variant">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)} className="font-label-caps px-3 py-1 rounded-full border border-outline-variant bg-transparent">
                  {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="font-body-md text-on-surface">
                    {item.product_name} x{item.quantity} — ${item.total_price.toLocaleString()}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-outline-variant">
                <div className="font-body-md text-on-surface-variant">
                  {order.shipping_address?.firstName} {order.shipping_address?.lastName} — {order.shipping_address?.city}, {order.shipping_address?.state}
                </div>
                <span className="font-body-lg font-semibold text-on-surface">${order.total.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
