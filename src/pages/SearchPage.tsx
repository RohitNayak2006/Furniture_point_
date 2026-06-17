import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { supabase, type Product } from '../lib/supabase';
import ProductCard from '../components/ui/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';

export default function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) { setProducts([]); return; }
    setLoading(true);
    supabase.from('products').select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,material.ilike.%${query}%,style.ilike.%${query}%,color.ilike.%${query}%`)
      .then(({ data }) => { setProducts(data ?? []); setLoading(false); });
  }, [query]);

  return (
    <div className="pt-24 pb-20 max-w-container-max mx-auto px-margin-mobile lg:px-margin-desktop">
      <div className="mb-stack-md">
        <div className="flex items-center gap-2 font-label-caps text-on-surface-variant mb-4">
          <Link to="/" className="hover:text-on-surface">Home</Link>
          <span>/</span>
          <span className="text-on-surface">Search</span>
        </div>
        <h1 className="font-headline-lg text-on-surface">
          {query ? `Results for "${query}"` : 'Search Products'}
        </h1>
        {query && <p className="font-body-md text-on-surface-variant mt-2">{products.length} results found</p>}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {loading ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />) :
          products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>

      {!loading && query && products.length === 0 && (
        <div className="text-center py-20">
          <SearchIcon size={48} className="mx-auto text-on-surface-variant/30 mb-4" />
          <p className="font-body-lg text-on-surface-variant">No products found for "{query}"</p>
          <Link to="/" className="font-button text-secondary mt-4 inline-block hover:underline">Browse Categories</Link>
        </div>
      )}
    </div>
  );
}
