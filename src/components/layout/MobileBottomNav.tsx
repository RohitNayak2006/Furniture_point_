import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingBag, Heart, User } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', to: '/' },
  { icon: Search, label: 'Search', to: '/search' },
  { icon: ShoppingBag, label: 'Cart', to: '/cart' },
  { icon: Heart, label: 'Wishlist', to: '/wishlist' },
  { icon: User, label: 'Account', to: '/account' },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const { count } = useCart();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest border-t border-outline-variant safe-bottom">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map(({ icon: Icon, label, to }) => {
          const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
          return (
            <Link key={to} to={to} className="flex flex-col items-center gap-1 relative">
              <Icon size={20} className={active ? 'text-secondary' : 'text-on-surface-variant'} />
              <span className={`text-[10px] ${active ? 'text-secondary font-semibold' : 'text-on-surface-variant'}`}>{label}</span>
              {label === 'Cart' && count > 0 && (
                <span className="absolute -top-1 right-1 bg-secondary text-on-secondary text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
