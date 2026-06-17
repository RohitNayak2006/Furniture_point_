import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import type { Product } from '../../lib/supabase';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useToast } from '../../contexts/ToastContext';

type Props = {
  product: Product;
  compact?: boolean;
};

export default function ProductCard({ product, compact }: Props) {
  const { addItem } = useCart();
  const { toggle, isInWishlist } = useWishlist();
  const { addToast } = useToast();
  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addItem(product);
    addToast(`${product.name} added to cart`, 'success');
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggle(product);
    addToast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist', wishlisted ? 'info' : 'success');
  };

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="relative overflow-hidden bg-surface-container rounded-lg aspect-[3/4]">
        <img
          src={product.image_urls?.[0] || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.is_new_arrival && (
            <span className="bg-secondary text-on-secondary font-label-caps px-3 py-1 rounded-full">New</span>
          )}
          {product.compare_at_price && (
            <span className="bg-error text-on-error font-label-caps px-3 py-1 rounded-full">
              -{Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
            </span>
          )}
          {product.is_sustainable && (
            <span className="bg-primary-fixed text-on-primary-fixed font-label-caps px-3 py-1 rounded-full">Eco</span>
          )}
        </div>

        {/* Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleWishlist}
            className={`p-2.5 rounded-full shadow-md transition-colors ${wishlisted ? 'bg-secondary text-on-secondary' : 'bg-surface-container-lowest text-on-surface-variant hover:text-secondary'}`}
          >
            <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Quick add */}
        {!compact && product.status !== 'out_of_stock' && (
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              className="w-full bg-charcoal text-white font-button py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-charcoal/90 transition-colors"
            >
              <ShoppingBag size={16} />
              Add to Cart
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <p className="font-label-caps text-on-surface-variant">{product.style}</p>
        <h3 className="font-body-lg font-medium text-on-surface group-hover:text-secondary transition-colors line-clamp-1">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="font-body-lg font-semibold text-on-surface">${product.price.toLocaleString()}</span>
          {product.compare_at_price && (
            <span className="font-body-md text-on-surface-variant line-through">${product.compare_at_price.toLocaleString()}</span>
          )}
        </div>
        {product.status === 'out_of_stock' && (
          <p className="font-label-caps text-error">Out of Stock</p>
        )}
      </div>
    </Link>
  );
}
