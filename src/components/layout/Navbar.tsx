import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useScrollHeader } from '../../hooks/useScrollHeader';

const NAV_LINKS = [
  { label: 'Sofas', to: '/category/sofas' },
  { label: 'Beds', to: '/category/beds' },
  { label: 'Dining', to: '/category/dining' },
  { label: 'Lighting', to: '/category/lighting' },
  { label: 'Tables', to: '/category/tables' },
  { label: 'Decor', to: '/category/decor' },
  { label: 'Textiles', to: '/category/textiles' },
  { label: 'Storage', to: '/category/storage' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const scrolled = useScrollHeader();
  const { count, openCart } = useCart();
  const { openWishlist } = useWishlist();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      setSearchOpen(false);
    }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-surface/95 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-container-max mx-auto px-margin-mobile lg:px-margin-desktop">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <button className="lg:hidden p-2 -ml-2" onClick={() => setMobileOpen(true)}>
              <Menu size={24} />
            </button>

            <Link to="/" className="font-display text-headline-sm lg:text-headline-lg tracking-tight text-on-surface">
              Furniture<span className="text-secondary">Point</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`font-label-caps text-on-surface-variant hover:text-on-surface transition-colors ${location.pathname === link.to ? 'text-on-surface' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <button onClick={() => setSearchOpen(true)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                <Search size={20} className="text-on-surface-variant" />
              </button>
              <button onClick={openWishlist} className="p-2 hover:bg-surface-container rounded-full transition-colors relative">
                <Heart size={20} className="text-on-surface-variant" />
              </button>
              <button onClick={openCart} className="p-2 hover:bg-surface-container rounded-full transition-colors relative">
                <ShoppingBag size={20} className="text-on-surface-variant" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-secondary text-on-secondary text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>
              <Link to="/account" className="p-2 hover:bg-surface-container rounded-full transition-colors">
                <User size={20} className="text-on-surface-variant" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-surface/95 backdrop-blur-md flex items-start justify-center pt-24 px-4">
          <div className="w-full max-w-2xl">
            <form onSubmit={handleSearch} className="flex items-center gap-4 border-b-2 border-on-surface pb-4">
              <Search size={24} className="text-on-surface-variant" />
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 bg-transparent text-headline-md text-on-surface placeholder:text-on-surface-variant focus:outline-none"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="p-2">
                <X size={24} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-surface">
          <div className="flex items-center justify-between px-margin-mobile h-16">
            <Link to="/" className="font-display text-headline-sm text-on-surface" onClick={() => setMobileOpen(false)}>
              Furniture<span className="text-secondary">Point</span>
            </Link>
            <button onClick={() => setMobileOpen(false)} className="p-2">
              <X size={24} />
            </button>
          </div>
          <nav className="px-margin-mobile py-8 space-y-6">
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block font-headline-md text-on-surface hover:text-secondary transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-8 border-t border-outline-variant space-y-6">
              <Link to="/account" onClick={() => setMobileOpen(false)} className="block font-body-lg text-on-surface-variant">My Account</Link>
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="block font-body-lg text-on-surface-variant">Admin</Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
