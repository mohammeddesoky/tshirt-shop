import { Link } from 'react-router-dom';
import { Instagram, Facebook, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink/10 dark:border-ink-dark/10 bg-sand-100/40 dark:bg-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="font-display font-bold text-lg">
            FIELD<span className="text-pine-600">GOODS</span>
          </Link>
          <p className="text-sm text-ink/60 dark:text-ink-dark/60 mt-3 leading-relaxed">
            تيشرتات قطنية 100%، تصميم يدوم، وجودة تستحق الثقة.
          </p>
          <div className="flex gap-3 mt-4">
            <a href="#" aria-label="Instagram" className="p-2 border border-ink/15 dark:border-ink-dark/15 hover:border-pine-600 hover:text-pine-600 transition-colors">
              <Instagram size={16} />
            </a>
            <a href="#" aria-label="Facebook" className="p-2 border border-ink/15 dark:border-ink-dark/15 hover:border-pine-600 hover:text-pine-600 transition-colors">
              <Facebook size={16} />
            </a>
            <a href="#" aria-label="WhatsApp" className="p-2 border border-ink/15 dark:border-ink-dark/15 hover:border-pine-600 hover:text-pine-600 transition-colors">
              <MessageCircle size={16} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="eyebrow mb-3">تسوق</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/shop" className="hover:text-pine-600">كل المنتجات</Link></li>
            <li><Link to="/track-order" className="hover:text-pine-600">تتبع طلبك</Link></li>
            <li><Link to="/cart" className="hover:text-pine-600">السلة</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow mb-3">الشركة</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-pine-600">من نحن</Link></li>
            <li><Link to="/contact" className="hover:text-pine-600">تواصل معنا</Link></li>
            <li><Link to="/faq" className="hover:text-pine-600">الأسئلة الشائعة</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow mb-3">السياسات</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/returns-policy" className="hover:text-pine-600">الاستبدال والاسترجاع</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-pine-600">سياسة الخصوصية</Link></li>
            <li><Link to="/terms" className="hover:text-pine-600">شروط الاستخدام</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink/10 dark:border-ink-dark/10 py-5 text-center text-xs text-ink/50 dark:text-ink-dark/50">
        © {new Date().getFullYear()} AfterEight. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
