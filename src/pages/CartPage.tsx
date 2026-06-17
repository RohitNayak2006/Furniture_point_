import { Link } from 'react-router-dom';
import { Minus, Plus, X, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useReveal } from '../hooks/useReveal';

export default function CartPage() {
  const { items, count, total, removeItem, updateQuantity, clearCart } = useCart();
  const revealRef = useReveal();

  const shipping = total >= 500 ? 0 : 75;
  const tax = Math.round(total * 0.08);
  const grandTotal = total + shipping + tax;

  return (
    <div ref={revealRef} className="pt-24 pb-20 lg:pb-section-gap">
      <div className="max-w-container-max mx-auto px-margin-mobile lg:px-margin-desktop">
        <h1 className="font-headline-lg text-on-surface mb-stack-md reveal">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 reveal">
            <ShoppingBag size={64} className="mx-auto text-on-surface-variant/20 mb-6" />
            <p className="font-headline-sm text-on-surface-variant mb-4">Your cart is empty</p>
            <Link to="/" className="inline-flex items-center gap-2 bg-charcoal text-white font-button px-8 py-4 rounded-lg btn-hover-lift">
              Continue Shopping <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack-lg">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4 reveal">
              <div className="flex items-center justify-between mb-2">
                <span className="font-body-md text-on-surface-variant">{count} items</span>
                <button onClick={clearCart} className="font-label-caps text-error hover:underline">Clear All</button>
              </div>
              {items.map(item => (
                <div key={item.id} className="flex gap-4 sm:gap-6 p-4 bg-surface-container-low rounded-lg">
                  <Link to={`/product/${item.product?.slug}`} className="w-24 h-28 sm:w-32 sm:h-36 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.product?.image_urls?.[0]} alt={item.product?.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link to={`/product/${item.product?.slug}`} className="font-body-lg font-medium text-on-surface hover:text-secondary transition-colors">{item.product?.name}</Link>
                        <p className="font-label-caps text-on-surface-variant mt-0.5">{item.product?.material} / {item.product?.color}</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-1 text-on-surface-variant hover:text-error transition-colors flex-shrink-0">
                        <X size={18} />
                      </button>
                    </div>
                    <div className="flex items-end justify-between mt-4">
                      <div className="flex items-center border border-outline-variant rounded-lg">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-surface-container transition-colors"><Minus size={14} /></button>
                        <span className="px-3 font-body-md text-on-surface">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-surface-container transition-colors"><Plus size={14} /></button>
                      </div>
                      <span className="font-body-lg font-semibold text-on-surface">${((item.product?.price ?? 0) * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="reveal" style={{ animationDelay: '0.1s' }}>
              <div className="bg-surface-container rounded-lg p-6 sticky top-24">
                <h2 className="font-headline-sm text-on-surface mb-6">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between font-body-md">
                    <span className="text-on-surface-variant">Subtotal</span>
                    <span className="text-on-surface">${total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-body-md">
                    <span className="text-on-surface-variant">Shipping</span>
                    <span className="text-on-surface">{shipping === 0 ? 'Free' : `$${shipping}`}</span>
                  </div>
                  <div className="flex justify-between font-body-md">
                    <span className="text-on-surface-variant">Estimated Tax</span>
                    <span className="text-on-surface">${tax.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-outline-variant pt-3 flex justify-between font-headline-sm">
                    <span className="text-on-surface">Total</span>
                    <span className="text-on-surface">${grandTotal.toLocaleString()}</span>
                  </div>
                </div>
                {total < 500 && (
                  <p className="font-label-caps text-secondary mb-4">Add ${(500 - total).toLocaleString()} more for free shipping!</p>
                )}
                <Link to="/checkout" className="w-full bg-charcoal text-white font-button py-4 rounded-lg flex items-center justify-center gap-2 btn-hover-lift">
                  Proceed to Checkout <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
