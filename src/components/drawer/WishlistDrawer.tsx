import { X, Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';

export default function WishlistDrawer() {
  const { items, isOpen, closeWishlist, toggle } = useWishlist();
  const { addItem } = useCart();
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleAddAllToCart = async () => {
    for (const item of items) {
      if (item.product) await addItem(item.product);
    }
    addToast(`${items.length} items added to cart`, 'success');
  };

  return (
    <>
      <div className="fixed inset-0 z-[55] bg-on-surface/30 backdrop-blur-sm" onClick={closeWishlist} />
      <div className="fixed top-0 right-0 bottom-0 z-[56] w-full max-w-md bg-surface-container-lowest shadow-2xl flex flex-col toast-enter">
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant">
          <h2 className="font-headline-sm text-on-surface flex items-center gap-2">
            <Heart size={22} /> Wishlist ({items.length})
          </h2>
          <button onClick={closeWishlist} className="p-2 hover:bg-surface-container rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <Heart size={48} className="mx-auto text-on-surface-variant/30 mb-4" />
              <p className="font-body-lg text-on-surface-variant">Your wishlist is empty</p>
              <Link to="/" onClick={closeWishlist} className="inline-block mt-4 font-button text-secondary hover:underline">Explore Products</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 py-4 border-b border-outline-variant/50">
                  <Link to={`/product/${item.product?.slug}`} onClick={closeWishlist} className="w-20 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.product?.image_urls?.[0]} alt={item.product?.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product?.slug}`} onClick={closeWishlist}>
                      <h4 className="font-body-md font-medium text-on-surface truncate">{item.product?.name}</h4>
                    </Link>
                    <p className="font-body-md font-semibold text-on-surface mt-1">${(item.product?.price ?? 0).toLocaleString()}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={async () => { if (item.product) { await addItem(item.product); addToast(`${item.product.name} added to cart`, 'success'); } }}
                        className="font-label-caps text-secondary hover:underline flex items-center gap-1"
                      >
                        <ShoppingBag size={14} /> Add to Cart
                      </button>
                      <button
                        onClick={() => toggle(item.product!)}
                        className="font-label-caps text-error hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-outline-variant px-6 py-5">
            <button
              onClick={handleAddAllToCart}
              className="w-full bg-charcoal text-white font-button py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-charcoal/90 transition-colors btn-hover-lift"
            >
              <ShoppingBag size={16} /> Add All to Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
