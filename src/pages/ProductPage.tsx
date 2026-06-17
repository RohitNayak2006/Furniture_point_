import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Minus, Plus, Truck, Shield, RotateCcw, Star, ChevronRight } from 'lucide-react';
import { supabase, type Product, type ProductReview } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '../contexts/ToastContext';
import ProductCard from '../components/ui/ProductCard';
import { useReveal } from '../hooks/useReveal';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const revealRef = useReveal();
  const { addItem } = useCart();
  const { toggle, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: prod } = await supabase.from('products').select('*').eq('slug', slug).single();
      setProduct(prod);
      setSelectedImage(0);
      setQuantity(1);

      if (prod) {
        const [revRes, relRes] = await Promise.all([
          supabase.from('product_reviews').select('*').eq('product_id', prod.id).order('created_at', { ascending: false }),
          supabase.from('products').select('*').eq('category_id', prod.category_id).neq('id', prod.id).limit(4),
        ]);
        setReviews(revRes.data ?? []);
        setRelated(relRes.data ?? []);
      }
      setLoading(false);
    }
    if (slug) load();
  }, [slug]);

  if (loading) return <div className="pt-24 pb-20 max-w-container-max mx-auto px-margin-mobile lg:px-margin-desktop"><div className="animate-pulse h-96 bg-surface-container rounded-lg" /></div>;
  if (!product) return <div className="pt-24 pb-20 text-center"><p className="font-body-lg text-on-surface-variant">Product not found.</p></div>;

  const wishlisted = isInWishlist(product.id);
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const handleAddToCart = async () => {
    await addItem(product, quantity);
    addToast(`${product.name} added to cart`, 'success');
  };

  const handleWishlist = async () => {
    await toggle(product);
    addToast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist', wishlisted ? 'info' : 'success');
  };

  return (
    <div ref={revealRef} className="pt-24 pb-20 lg:pb-section-gap">
      <div className="max-w-container-max mx-auto px-margin-mobile lg:px-margin-desktop">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-label-caps text-on-surface-variant mb-6 reveal">
          <Link to="/" className="hover:text-on-surface">Home</Link>
          <ChevronRight size={12} />
          <Link to={`/category/${product.style?.toLowerCase()}`} className="hover:text-on-surface">Products</Link>
          <ChevronRight size={12} />
          <span className="text-on-surface">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack-lg">
          {/* Images */}
          <div className="reveal">
            <div className="aspect-[4/5] rounded-lg overflow-hidden bg-surface-container mb-4">
              <img src={product.image_urls?.[selectedImage] || product.image_urls?.[0]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {product.image_urls && product.image_urls.length > 1 && (
              <div className="flex gap-3 overflow-x-auto hide-scrollbar">
                {product.image_urls.map((url, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${i === selectedImage ? 'border-secondary' : 'border-transparent'}`}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="reveal" style={{ animationDelay: '0.1s' }}>
            {product.is_new_arrival && <span className="font-label-caps text-secondary mb-2 inline-block">New Arrival</span>}
            <h1 className="font-headline-lg text-on-surface mb-2">{product.name}</h1>
            <div className="flex items-center gap-3 mb-4">
              {avgRating > 0 && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} className={i < Math.round(avgRating) ? 'text-gold fill-gold' : 'text-outline-variant'} />)}
                  <span className="font-body-md text-on-surface-variant ml-1">({reviews.length})</span>
                </div>
              )}
              <span className="font-label-caps text-on-surface-variant">{product.sku}</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-on-surface">${product.price.toLocaleString()}</span>
              {product.compare_at_price && (
                <span className="font-body-lg text-on-surface-variant line-through">${product.compare_at_price.toLocaleString()}</span>
              )}
            </div>

            <p className="font-body-lg text-on-surface-variant mb-8 leading-relaxed">{product.description}</p>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { label: 'Material', value: product.material },
                { label: 'Color', value: product.color },
                { label: 'Style', value: product.style },
                ...Object.entries(product.specs || {}),
              ].filter(s => s.value).map(({ label, value }) => (
                <div key={label} className="border-b border-outline-variant py-2">
                  <p className="font-label-caps text-on-surface-variant">{label}</p>
                  <p className="font-body-md text-on-surface">{value}</p>
                </div>
              ))}
            </div>

            {/* Quantity + Actions */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-outline-variant rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-surface-container transition-colors"><Minus size={16} /></button>
                <span className="px-4 font-body-md text-on-surface">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-surface-container transition-colors"><Plus size={16} /></button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.status === 'out_of_stock'}
                className="flex-1 bg-charcoal text-white font-button py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-charcoal/90 transition-colors btn-hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={18} />
                {product.status === 'out_of_stock' ? 'Out of Stock' : 'Add to Cart'}
              </button>

              <button
                onClick={handleWishlist}
                className={`p-4 border rounded-lg transition-colors ${wishlisted ? 'border-secondary bg-secondary/10 text-secondary' : 'border-outline-variant text-on-surface-variant hover:border-secondary hover:text-secondary'}`}
              >
                <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-outline-variant">
              {[
                { icon: Truck, label: 'Free Delivery' },
                { icon: Shield, label: '10-Year Warranty' },
                { icon: RotateCcw, label: '30-Day Returns' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 text-center">
                  <Icon size={20} className="text-secondary" />
                  <span className="font-label-caps text-on-surface-variant">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <section className="mt-section-gap reveal">
            <h2 className="font-headline-md text-on-surface mb-stack-md">Customer Reviews</h2>
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="border-b border-outline-variant pb-6">
                  <div className="flex items-center gap-2 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className={i < review.rating ? 'text-gold fill-gold' : 'text-outline-variant'} />)}
                    {review.is_verified && <span className="font-label-caps text-green-600 ml-2">Verified Purchase</span>}
                  </div>
                  <h4 className="font-body-md font-semibold text-on-surface">{review.title}</h4>
                  <p className="font-body-md text-on-surface-variant mt-1">{review.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-section-gap reveal">
            <h2 className="font-headline-md text-on-surface mb-stack-md">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
