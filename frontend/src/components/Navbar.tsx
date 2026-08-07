import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Sun, Moon } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useDarkMode } from '@/hooks/useDarkMode';

const links = [
  { to: '/', label: 'الرئيسية' },
  { to: '/shop', label: 'المتجر' },
  { to: '/about', label: 'من نحن' },
  { to: '/contact', label: 'تواصل معنا' },
];

export default function Navbar() {
  const { count } = useCart();
  const { isDark, toggle } = useDarkMode();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-paper/90 dark:bg-paper-dark/90 backdrop-blur border-b border-ink/10 dark:border-ink-dark/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <button className="md:hidden" onClick={() => setMenuOpen((o) => !o)} aria-label="القائمة">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link to="/" className="font-display font-bold text-xl tracking-tight shrink-0">
          FIELD<span className="text-pine-600">GOODS</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm font-medium hover:text-pine-600 transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button onClick={() => setSearchOpen((o) => !o)} className="p-2 hover:text-pine-600" aria-label="بحث">
            <Search size={20} />
          </button>
          <button onClick={toggle} className="p-2 hover:text-pine-600" aria-label="تبديل الوضع الليلي">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link to="/cart" className="relative p-2 hover:text-pine-600" aria-label="السلة">
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -top-0.5 -end-0.5 bg-rust-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <form onSubmit={submitSearch} className="border-t border-ink/10 dark:border-ink-dark/10 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <Search size={18} className="text-ink/40" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="flex-1 bg-transparent outline-none text-sm py-1"
            />
          </div>
        </form>
      )}

      {menuOpen && (
        <nav className="md:hidden border-t border-ink/10 dark:border-ink-dark/10 px-4 py-3 flex flex-col gap-3">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)} className="text-sm font-medium">
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
