import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Check, Truck, CreditCard, MapPin } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';

const STEPS = ['Shipping', 'Delivery', 'Payment', 'Review'];

type ShippingInfo = {
  firstName: string; lastName: string; email: string; phone: string;
  address: string; apartment: string; city: string; state: string; zip: string; country: string;
};

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [shipping, setShipping] = useState<ShippingInfo>({
    firstName: '', lastName: '', email: user?.email ?? '', phone: '',
    address: '', apartment: '', city: '', state: '', zip: '', country: 'US',
  });
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [placing, setPlacing] = useState(false);

  const shipping2 = total >= 500 ? 0 : deliveryMethod === 'express' ? 35 : 0;
  const tax = Math.round(total * 0.08);
  const grandTotal = total + shipping2 + tax;

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-20 text-center max-w-container-max mx-auto px-margin-mobile lg:px-margin-desktop">
        <p className="font-headline-sm text-on-surface-variant mb-4">Your cart is empty</p>
        <Link to="/" className="font-button text-secondary hover:underline">Continue Shopping</Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!user) { addToast('Please sign in to place an order', 'error'); return; }
    setPlacing(true);
    try {
      const { data: order } = await supabase.from('orders').insert({
        user_id: user.id,
        status: 'pending',
        total: grandTotal,
        shipping_address: shipping,
        billing_address: shipping,
      }).select().single();

      if (order) {
        const orderItems = items.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.product?.name ?? '',
          quantity: item.quantity,
          unit_price: item.product?.price ?? 0,
          total_price: (item.product?.price ?? 0) * item.quantity,
        }));
        await supabase.from('order_items').insert(orderItems);
        await clearCart();
        addToast('Order placed successfully!', 'success');
        navigate('/account/orders');
      }
    } catch {
      addToast('Failed to place order. Please try again.', 'error');
    }
    setPlacing(false);
  };

  const updateShipping = (field: keyof ShippingInfo, value: string) => {
    setShipping(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="pt-24 pb-20 lg:pb-section-gap">
      <div className="max-w-container-max mx-auto px-margin-mobile lg:px-margin-desktop">
        <h1 className="font-headline-lg text-on-surface mb-stack-md">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-stack-lg overflow-x-auto hide-scrollbar">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button onClick={() => i < step && setStep(i)} className={`flex items-center gap-2 font-label-caps px-4 py-2 rounded-full border transition-colors ${i === step ? 'bg-charcoal text-white border-charcoal' : i < step ? 'bg-secondary/10 text-secondary border-secondary/30' : 'border-outline-variant text-on-surface-variant'}`}>
                {i < step ? <Check size={14} /> : <span>{i + 1}</span>} {s}
              </button>
              {i < STEPS.length - 1 && <ChevronRight size={14} className="text-on-surface-variant flex-shrink-0" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack-lg">
          <div className="lg:col-span-2">
            {/* Step 0: Shipping */}
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="font-headline-sm text-on-surface flex items-center gap-2"><MapPin size={20} /> Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="font-label-caps text-on-surface-variant block mb-1">First Name</label><input value={shipping.firstName} onChange={e => updateShipping('firstName', e.target.value)} className="form-input" /></div>
                  <div><label className="font-label-caps text-on-surface-variant block mb-1">Last Name</label><input value={shipping.lastName} onChange={e => updateShipping('lastName', e.target.value)} className="form-input" /></div>
                  <div><label className="font-label-caps text-on-surface-variant block mb-1">Email</label><input type="email" value={shipping.email} onChange={e => updateShipping('email', e.target.value)} className="form-input" /></div>
                  <div><label className="font-label-caps text-on-surface-variant block mb-1">Phone</label><input type="tel" value={shipping.phone} onChange={e => updateShipping('phone', e.target.value)} className="form-input" /></div>
                  <div className="col-span-2"><label className="font-label-caps text-on-surface-variant block mb-1">Street Address</label><input value={shipping.address} onChange={e => updateShipping('address', e.target.value)} className="form-input" /></div>
                  <div><label className="font-label-caps text-on-surface-variant block mb-1">Apt / Suite</label><input value={shipping.apartment} onChange={e => updateShipping('apartment', e.target.value)} className="form-input" /></div>
                  <div><label className="font-label-caps text-on-surface-variant block mb-1">City</label><input value={shipping.city} onChange={e => updateShipping('city', e.target.value)} className="form-input" /></div>
                  <div><label className="font-label-caps text-on-surface-variant block mb-1">State</label><input value={shipping.state} onChange={e => updateShipping('state', e.target.value)} className="form-input" /></div>
                  <div><label className="font-label-caps text-on-surface-variant block mb-1">ZIP Code</label><input value={shipping.zip} onChange={e => updateShipping('zip', e.target.value)} className="form-input" /></div>
                </div>
                <button onClick={() => setStep(1)} className="bg-charcoal text-white font-button px-8 py-4 rounded-lg btn-hover-lift mt-4">Continue to Delivery</button>
              </div>
            )}

            {/* Step 1: Delivery */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-headline-sm text-on-surface flex items-center gap-2"><Truck size={20} /> Delivery Method</h2>
                {[
                  { id: 'standard', label: 'Standard Delivery', desc: '5-7 business days', price: 'Free' },
                  { id: 'express', label: 'Express Delivery', desc: '2-3 business days', price: '$35' },
                  { id: 'whiteglove', label: 'White-Glove Service', desc: 'In-home setup & removal', price: '$150' },
                ].map(opt => (
                  <label key={opt.id} className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${deliveryMethod === opt.id ? 'border-secondary bg-secondary/5' : 'border-outline-variant hover:border-on-surface-variant'}`}>
                    <input type="radio" name="delivery" value={opt.id} checked={deliveryMethod === opt.id} onChange={() => setDeliveryMethod(opt.id)} className="accent-secondary" />
                    <div className="flex-1">
                      <p className="font-body-md font-medium text-on-surface">{opt.label}</p>
                      <p className="font-label-caps text-on-surface-variant">{opt.desc}</p>
                    </div>
                    <span className="font-body-md font-semibold text-on-surface">{opt.price}</span>
                  </label>
                ))}
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep(0)} className="border border-outline-variant font-button px-6 py-4 rounded-lg">Back</button>
                  <button onClick={() => setStep(2)} className="bg-charcoal text-white font-button px-8 py-4 rounded-lg btn-hover-lift">Continue to Payment</button>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-headline-sm text-on-surface flex items-center gap-2"><CreditCard size={20} /> Payment Method</h2>
                {[
                  { id: 'card', label: 'Credit / Debit Card' },
                  { id: 'paypal', label: 'PayPal' },
                  { id: 'bank', label: 'Bank Transfer' },
                ].map(opt => (
                  <label key={opt.id} className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === opt.id ? 'border-secondary bg-secondary/5' : 'border-outline-variant hover:border-on-surface-variant'}`}>
                    <input type="radio" name="payment" value={opt.id} checked={paymentMethod === opt.id} onChange={() => setPaymentMethod(opt.id)} className="accent-secondary" />
                    <p className="font-body-md font-medium text-on-surface">{opt.label}</p>
                  </label>
                ))}
                {paymentMethod === 'card' && (
                  <div className="space-y-4 mt-4 p-4 border border-outline-variant rounded-lg">
                    <div><label className="font-label-caps text-on-surface-variant block mb-1">Card Number</label><input placeholder="1234 5678 9012 3456" className="form-input" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="font-label-caps text-on-surface-variant block mb-1">Expiry</label><input placeholder="MM/YY" className="form-input" /></div>
                      <div><label className="font-label-caps text-on-surface-variant block mb-1">CVV</label><input placeholder="123" className="form-input" /></div>
                    </div>
                  </div>
                )}
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep(1)} className="border border-outline-variant font-button px-6 py-4 rounded-lg">Back</button>
                  <button onClick={() => setStep(3)} className="bg-charcoal text-white font-button px-8 py-4 rounded-lg btn-hover-lift">Review Order</button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="font-headline-sm text-on-surface flex items-center gap-2"><Check size={20} /> Review Your Order</h2>

                <div className="border border-outline-variant rounded-lg p-4">
                  <h3 className="font-label-caps text-on-surface-variant mb-2">Shipping To</h3>
                  <p className="font-body-md text-on-surface">{shipping.firstName} {shipping.lastName}</p>
                  <p className="font-body-md text-on-surface-variant">{shipping.address}, {shipping.city}, {shipping.state} {shipping.zip}</p>
                </div>

                <div className="border border-outline-variant rounded-lg p-4">
                  <h3 className="font-label-caps text-on-surface-variant mb-2">Items ({items.length})</h3>
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 py-2">
                      <img src={item.product?.image_urls?.[0]} alt="" className="w-12 h-14 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-body-md text-on-surface truncate">{item.product?.name}</p>
                        <p className="font-label-caps text-on-surface-variant">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-body-md text-on-surface">${((item.product?.price ?? 0) * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="border border-outline-variant font-button px-6 py-4 rounded-lg">Back</button>
                  <button onClick={handlePlaceOrder} disabled={placing} className="flex-1 bg-secondary text-on-secondary font-button py-4 rounded-lg btn-hover-lift disabled:opacity-50">
                    {placing ? 'Placing Order...' : `Place Order — $${grandTotal.toLocaleString()}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <div className="bg-surface-container rounded-lg p-6 sticky top-24">
              <h3 className="font-headline-sm text-on-surface mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={item.product?.image_urls?.[0]} alt="" className="w-12 h-14 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-body-md text-on-surface truncate">{item.product?.name}</p>
                      <p className="font-label-caps text-on-surface-variant">x{item.quantity}</p>
                    </div>
                    <span className="font-body-md text-on-surface">${((item.product?.price ?? 0) * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-outline-variant pt-3 space-y-2">
                <div className="flex justify-between font-body-md"><span className="text-on-surface-variant">Subtotal</span><span>${total.toLocaleString()}</span></div>
                <div className="flex justify-between font-body-md"><span className="text-on-surface-variant">Shipping</span><span>{shipping2 === 0 ? 'Free' : `$${shipping2}`}</span></div>
                <div className="flex justify-between font-body-md"><span className="text-on-surface-variant">Tax</span><span>${tax.toLocaleString()}</span></div>
                <div className="flex justify-between font-headline-sm pt-2 border-t border-outline-variant"><span>Total</span><span>${grandTotal.toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
