import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

export default function CartDrawer() {
  const { items, count, total, isOpen, closeCart, removeItem, updateQuantity } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[55] bg-on-surface/30 backdrop-blur-sm" onClick={closeCart} />
      <div className="fixed top-0 right-0 bottom-0 z-[56] w-full max-w-md bg-surface-container-lowest shadow-2xl flex flex-col toast-enter">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant">
          <h2 className="font-headline-sm text-on-surface flex items-center gap-2">
            <ShoppingBag size={22} /> Cart ({count})
          </h2>
          <button onClick={closeCart} className="p-2 hover:bg-surface-container rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag size={48} className="mx-auto text-on-surface-variant/30 mb-4" />
              <p className="font-body-lg text-on-surface-variant">Your cart is empty</p>
              <Link to="/" onClick={closeCart} className="inline-block mt-4 font-button text-secondary hover:underline">Continue Shopping</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 py-4 border-b border-outline-variant/50">
                  <Link to={`/product/${item.product?.slug}`} onClick={closeCart} className="w-20 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.product?.image_urls?.[0]} alt={item.product?.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product?.slug}`} onClick={closeCart}>
                      <h4 className="font-body-md font-medium text-on-surface truncate">{item.product?.name}</h4>
                    </Link>
                    <p className="font-label-caps text-on-surface-variant mt-0.5">{item.product?.material}</p>
                    <p className="font-body-md font-semibold text-on-surface mt-1">${(item.product?.price ?? 0).toLocaleString()}</p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 border border-outline-variant rounded-full">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 hover:bg-surface-container transition-colors rounded-l-full">
                          <Minus size={14} />
                        </button>
                        <span className="font-button text-on-surface w-8 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 hover:bg-surface-container transition-colors rounded-r-full">
                          <Plus size={14} />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="font-label-caps text-error hover:underline">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-outline-variant px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-body-lg text-on-surface-variant">Subtotal</span>
              <span className="font-headline-sm text-on-surface">${total.toLocaleString()}</span>
            </div>
            <Link
              to="/checkout"
              onClick={closeCart}
              className="w-full bg-charcoal text-white font-button py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-charcoal/90 transition-colors btn-hover-lift"
            >
              Checkout <ArrowRight size={16} />
            </Link>
            <Link to="/cart" onClick={closeCart} className="block text-center font-button text-on-surface-variant hover:text-on-surface transition-colors">
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
