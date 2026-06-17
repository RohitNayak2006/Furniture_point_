import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, Leaf } from 'lucide-react';
import { supabase, type Product, type Category } from '../lib/supabase';
import ProductCard from '../components/ui/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { useReveal } from '../hooks/useReveal';

const FEATURED_CATS = [
  { slug: 'sofas', name: 'Sofas', image: 'https://images.pexels.com/photos/186377/pexels-photo-186377.jpeg' },
  { slug: 'beds', name: 'Beds', image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg' },
  { slug: 'dining', name: 'Dining', image: 'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg' },
  { slug: 'lighting', name: 'Lighting', image: 'https://images.pexels.com/photos/1123262/pexels-photo-1123262.jpeg' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const revealRef = useReveal();

  useEffect(() => {
    async function load() {
      const [featRes, newRes] = await Promise.all([
        supabase.from('products').select('*').eq('is_featured', true).eq('status', 'in_stock').limit(8),
        supabase.from('products').select('*').eq('is_new_arrival', true).eq('status', 'in_stock').limit(8),
      ]);
      setFeatured(featRes.data ?? []);
      setNewArrivals(newRes.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div ref={revealRef}>
      {/* Hero */}
      <section className="relative h-screen min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg" alt="Hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/70 via-charcoal/40 to-transparent" />
        </div>
        <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile lg:px-margin-desktop w-full">
          <div className="max-w-xl">
            <p className="font-label-caps text-gold mb-4 reveal">Handcrafted Since 2010</p>
            <h1 className="font-display text-display text-white mb-6 reveal" style={{ animationDelay: '0.1s' }}>
              Where Design<br />Meets Comfort
            </h1>
            <p className="font-body-lg text-white/80 mb-8 reveal" style={{ animationDelay: '0.2s' }}>
              Discover curated collections of premium furniture designed to transform your living spaces into sanctuaries of style.
            </p>
            <div className="flex flex-wrap gap-4 reveal" style={{ animationDelay: '0.3s' }}>
              <Link to="/category/sofas" className="bg-secondary text-on-secondary font-button px-8 py-4 rounded-lg btn-hover-lift flex items-center gap-2">
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link to="/category/decor" className="border border-white/30 text-white font-button px-8 py-4 rounded-lg hover:bg-white/10 transition-colors">
                Explore Collections
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="max-w-container-max mx-auto px-margin-mobile lg:px-margin-desktop py-section-gap">
        <h2 className="font-headline-lg text-on-surface mb-stack-md reveal">Shop by Category</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURED_CATS.map((cat, i) => (
            <Link key={cat.slug} to={`/category/${cat.slug}`} className="group relative overflow-hidden rounded-lg aspect-[3/4] reveal" style={{ animationDelay: `${i * 0.1}s` }}>
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-headline-sm text-white">{cat.name}</h3>
                <span className="font-label-caps text-gold mt-1 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Explore <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-container-max mx-auto px-margin-mobile lg:px-margin-desktop py-section-gap">
        <div className="flex items-end justify-between mb-stack-md reveal">
          <h2 className="font-headline-lg text-on-surface">Featured Pieces</h2>
          <Link to="/search?q=featured" className="font-button text-secondary flex items-center gap-1 hover:gap-2 transition-all">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {loading ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />) :
            featured.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Values Banner */}
      <section className="bg-charcoal text-white py-section-gap">
        <div className="max-w-container-max mx-auto px-margin-mobile lg:px-margin-desktop">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-lg reveal">
            {[
              { icon: Truck, title: 'Free White-Glove Delivery', desc: 'Complimentary in-home delivery and setup on all orders over $500.' },
              { icon: Shield, title: '10-Year Warranty', desc: 'Every piece backed by our decade-long commitment to quality.' },
              { icon: Leaf, title: 'Sustainably Sourced', desc: 'FSC-certified woods and eco-friendly materials throughout.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="p-3 border border-gold/30 rounded-lg flex-shrink-0"><Icon size={24} className="text-gold" /></div>
                <div>
                  <h3 className="font-headline-sm mb-2">{title}</h3>
                  <p className="font-body-md text-white/60">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-container-max mx-auto px-margin-mobile lg:px-margin-desktop py-section-gap">
        <div className="flex items-end justify-between mb-stack-md reveal">
          <h2 className="font-headline-lg text-on-surface">New Arrivals</h2>
          <Link to="/search?q=new" className="font-button text-secondary flex items-center gap-1 hover:gap-2 transition-all">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {loading ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />) :
            newArrivals.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-secondary-fixed-dim py-section-gap reveal">
        <div className="max-w-container-max mx-auto px-margin-mobile lg:px-margin-desktop text-center">
          <h2 className="font-headline-lg text-on-secondary-fixed mb-4">Join the Inner Circle</h2>
          <p className="font-body-lg text-on-secondary-fixed-variant max-w-md mx-auto mb-8">Early access to new collections, design tips, and exclusive offers delivered to your inbox.</p>
          <form onSubmit={async (e) => { e.preventDefault(); const form = e.currentTarget; const email = new FormData(form).get('email') as string; await supabase.from('newsletter_subscribers').insert({ email }); form.reset(); }} className="flex max-w-md mx-auto gap-3">
            <input name="email" type="email" required placeholder="your@email.com" className="flex-1 bg-surface-container-lowest border border-outline text-on-surface font-body-md px-4 py-3 rounded-lg focus:outline-none focus:border-secondary" />
            <button type="submit" className="bg-charcoal text-white font-button px-6 py-3 rounded-lg btn-hover-lift">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
}
