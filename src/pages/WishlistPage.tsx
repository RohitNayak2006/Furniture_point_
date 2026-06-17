import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';

export default function WishlistPage() {
  const { items, toggle } = useWishlist();
  const { addItem } = useCart();
  const { addToast } = useToast();

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-container-max mx-auto px-margin-mobile lg:px-margin-desktop">
        <h1 className="font-headline-lg text-on-surface mb-stack-md">Wishlist</h1>
        {items.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={48} className="mx-auto text-on-surface-variant/20 mb-4" />
            <p className="font-headline-sm text-on-surface-variant mb-4">Your wishlist is empty</p>
            <Link to="/" className="font-button text-secondary hover:underline">Explore Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {items.map(item => (
              <div key={item.id} className="group">
                <Link to={`/product/${item.product?.slug}`} className="block relative aspect-[3/4] rounded-lg overflow-hidden bg-surface-container">
                  <img src={item.product?.image_urls?.[0]} alt={item.product?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </Link>
                <div className="mt-3">
                  <h3 className="font-body-md font-medium text-on-surface">{item.product?.name}</h3>
                  <p className="font-body-md text-on-surface-variant">${(item.product?.price ?? 0).toLocaleString()}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={async () => { if (item.product) { await addItem(item.product); addToast('Added to cart', 'success'); } }}
                      className="font-label-caps text-secondary flex items-center gap-1 hover:underline"
                    ><ShoppingBag size={14} /> Add to Cart</button>
                    <button onClick={() => toggle(item.product!)} className="font-label-caps text-error hover:underline">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
