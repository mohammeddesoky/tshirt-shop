import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-32 text-center">
      <p className="font-display font-bold text-7xl text-pine-600 mb-4">404</p>
      <h1 className="font-display text-2xl mb-3">الصفحة غير موجودة</h1>
      <p className="text-ink/50 text-sm mb-8">يبدو أن الصفحة التي تبحث عنها غير متوفرة أو تم نقلها.</p>
      <Link to="/" className="inline-block bg-ink text-paper dark:bg-paper-dark dark:text-ink-dark px-6 py-3 font-medium text-sm hover:bg-pine-600 transition-colors">
        العودة للرئيسية
      </Link>
    </div>
  );
}
