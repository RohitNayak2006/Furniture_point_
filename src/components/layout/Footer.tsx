import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';

const FOOTER_LINKS = {
  Shop: [
    { label: 'Sofas', to: '/category/sofas' },
    { label: 'Beds', to: '/category/beds' },
    { label: 'Dining', to: '/category/dining' },
    { label: 'Lighting', to: '/category/lighting' },
    { label: 'Tables', to: '/category/tables' },
    { label: 'Decor', to: '/category/decor' },
    { label: 'Textiles', to: '/category/textiles' },
    { label: 'Storage', to: '/category/storage' },
  ],
  Company: [
    { label: 'About Us', to: '/about' },
    { label: 'Our Story', to: '/about' },
    { label: 'Sustainability', to: '/about' },
    { label: 'Careers', to: '/about' },
  ],
  Support: [
    { label: 'Contact Us', to: '/contact' },
    { label: 'Shipping & Returns', to: '/contact' },
    { label: 'FAQ', to: '/contact' },
    { label: 'Care Guide', to: '/contact' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      <div className="max-w-container-max mx-auto px-margin-mobile lg:px-margin-desktop py-section-gap">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-stack-lg mb-stack-lg">
          {/* Brand */}
          <div>
            <Link to="/" className="font-display text-headline-md text-white">
              Furniture<span className="text-gold">Point</span>
            </Link>
            <p className="mt-4 font-body-md text-white/60 max-w-xs">
              Crafting timeless furniture that transforms houses into homes. Quality materials, thoughtful design.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="p-2 border border-white/20 rounded-full hover:bg-white/10 transition-colors"><Instagram size={18} /></a>
              <a href="#" className="p-2 border border-white/20 rounded-full hover:bg-white/10 transition-colors"><Twitter size={18} /></a>
              <a href="#" className="p-2 border border-white/20 rounded-full hover:bg-white/10 transition-colors"><Facebook size={18} /></a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="font-label-caps text-gold mb-6">{heading}</h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.label}>
                    <Link to={link.to} className="font-body-md text-white/60 hover:text-white transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="border-t border-white/10 pt-stack-md flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 font-body-md text-white/50">
            <span className="flex items-center gap-2"><Mail size={16} /> hello@furniturepoint.com</span>
            <span className="flex items-center gap-2"><Phone size={16} /> +1 (555) 012-3456</span>
            <span className="flex items-center gap-2"><MapPin size={16} /> New York, NY</span>
          </div>
          <p className="font-label-caps text-white/30">
            &copy; {new Date().getFullYear()} Furniture Point. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
