import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SlidersHorizontal, Grid3X3, LayoutList, ChevronDown } from 'lucide-react';
import { supabase, type Product, type Category } from '../lib/supabase';
import ProductCard from '../components/ui/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { useReveal } from '../hooks/useReveal';

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Name A-Z', value: 'name_asc' },
];

const ALL_CATEGORIES = ['sofas', 'beds', 'dining', 'lighting', 'tables', 'decor', 'textiles', 'storage'];

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [styles, setStyles] = useState<string[]>([]);
  const revealRef = useReveal();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: catData } = await supabase.from('categories').select('*').eq('slug', slug).single();
      setCategory(catData);

      let query = supabase.from('products').select('*').eq('category_id', catData?.id);
      if (sortBy === 'price_asc') query = query.order('price', { ascending: true });
      else if (sortBy === 'price_desc') query = query.order('price', { ascending: false });
      else if (sortBy === 'name_asc') query = query.order('name', { ascending: true });
      else query = query.order('created_at', { ascending: false });

      const { data: prods } = await query;
      const filtered = (prods as Product[] || []).filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
      setProducts(filtered);

      if (prods) {
        const uniqueStyles = [...new Set(prods.map((p: Product) => p.style).filter(Boolean))];
        setStyles(uniqueStyles);
      }
      setLoading(false);
    }
    if (slug) load();
  }, [slug, sortBy, priceRange]);

  return (
    <div ref={revealRef} className="pt-24 pb-20 lg:pb-section-gap">
      {/* Category Header */}
      <div className="max-w-container-max mx-auto px-margin-mobile lg:px-margin-desktop mb-stack-md">
        <div className="flex items-center gap-2 font-label-caps text-on-surface-variant mb-4 reveal">
          <Link to="/" className="hover:text-on-surface transition-colors">Home</Link>
          <span>/</span>
          <span className="text-on-surface">{category?.name ?? slug}</span>
        </div>
        <h1 className="font-headline-lg text-on-surface mb-2 reveal">{category?.name ?? slug}</h1>
        {category?.description && <p className="font-body-lg text-on-surface-variant max-w-2xl reveal">{category.description}</p>}
      </div>

      {/* Category Chips */}
      <div className="max-w-container-max mx-auto px-margin-mobile lg:px-margin-desktop mb-stack-sm reveal">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {ALL_CATEGORIES.map(c => (
            <Link
              key={c}
              to={`/category/${c}`}
              className={`font-label-caps px-4 py-2 rounded-full border transition-colors whitespace-nowrap ${c === slug ? 'bg-charcoal text-white border-charcoal' : 'border-outline-variant text-on-surface-variant hover:border-on-surface-variant'}`}
            >
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </Link>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="max-w-container-max mx-auto px-margin-mobile lg:px-margin-desktop mb-stack-sm reveal">
        <div className="flex items-center justify-between py-3 border-b border-outline-variant">
          <span className="font-body-md text-on-surface-variant">{products.length} products</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 font-button text-on-surface-variant hover:text-on-surface transition-colors lg:hidden">
              <SlidersHorizontal size={16} /> Filters
            </button>
            <div className="relative">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="appearance-none bg-transparent font-button text-on-surface pr-6 focus:outline-none cursor-pointer">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="py-4 border-b border-outline-variant space-y-4">
            <div>
              <p className="font-label-caps text-on-surface-variant mb-2">Price Range</p>
              <div className="flex items-center gap-3">
                <input type="number" value={priceRange[0]} onChange={e => setPriceRange([+e.target.value, priceRange[1]])} className="w-24 bg-surface-container border border-outline-variant rounded px-2 py-1 font-body-md" />
                <span className="text-on-surface-variant">—</span>
                <input type="number" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], +e.target.value])} className="w-24 bg-surface-container border border-outline-variant rounded px-2 py-1 font-body-md" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Grid */}
      <div className="max-w-container-max mx-auto px-margin-mobile lg:px-margin-desktop">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {loading ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />) :
            products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
        {!loading && products.length === 0 && (
          <div className="text-center py-20">
            <p className="font-body-lg text-on-surface-variant">No products found in this category.</p>
            <Link to="/" className="font-button text-secondary mt-4 inline-block hover:underline">Continue Shopping</Link>
          </div>
        )}
      </div>
    </div>
  );
}
