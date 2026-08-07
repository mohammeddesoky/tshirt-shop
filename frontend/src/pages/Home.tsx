import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/api/client';
import { ProductListItem } from '@/types';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';

export default function Home() {
  const [featured, setFeatured] = useState<ProductListItem[] | null>(null);
  const [bestSellers, setBestSellers] = useState<ProductListItem[] | null>(null);
  const [newArrivals, setNewArrivals] = useState<ProductListItem[] | null>(null);

  useEffect(() => {
    document.title = 'AfterEight — تيشرتات عصرية بجودة عالية';
    api.get<{ items: ProductListItem[] }>('/api/products?featured=true&page_size=4').then((r) => setFeatured(r.items));
    api.get<ProductListItem[]>('/api/products/best-sellers?limit=4').then(setBestSellers);
    api.get<ProductListItem[]>('/api/products/new-arrivals?limit=4').then(setNewArrivals);
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink/10 dark:border-ink-dark/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-10 items-center py-14 md:py-20">
          <div className="animate-fade-up order-2 md:order-1">
            <span className="eyebrow">مجموعة خريف ٢٠٢٦</span>
            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl leading-[1.05] mt-4 mb-6">
              قطن نقي.
              <br />
              قصّة تدوم.
            </h1>
            <p className="text-ink/60 dark:text-ink-dark/60 text-base md:text-lg max-w-md mb-8 leading-relaxed">
              تيشرتات مصنوعة من قطن مشط 100%، بتصاميم مدروسة تناسب كل الأذواق، وشحن سريع لكل المحافظات.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-ink text-paper dark:bg-paper-dark dark:text-ink-dark px-7 py-3.5 font-medium text-sm hover:bg-pine-600 dark:hover:bg-pine-500 transition-colors"
            >
              تسوّق الآن
              <ArrowLeft size={16} />
            </Link>
          </div>
          <div className="order-1 md:order-2 relative">
            <div className="aspect-[4/5] bg-sand-100 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=80"
                alt="تيشرت أساسي"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -start-4 price-tag text-base px-3 py-1.5">من ٤٠٠ ج.م</div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <Section title="مختارات مميزة" items={featured} viewAllHref="/shop?featured=true" />
      {/* Best sellers */}
      <Section title="الأكثر مبيعًا" items={bestSellers} viewAllHref="/shop" />
      {/* New arrivals */}
      <Section title="وصل حديثًا" items={newArrivals} viewAllHref="/shop?sort=newest" />
    </div>
  );
}

function Section({
  title,
  items,
  viewAllHref,
}: {
  title: string;
  items: ProductListItem[] | null;
  viewAllHref: string;
}) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
      <div className="flex items-end justify-between mb-8">
        <h2 className="font-display font-semibold text-2xl">{title}</h2>
        <Link to={viewAllHref} className="text-sm font-medium text-pine-600 hover:underline flex items-center gap-1">
          عرض الكل <ArrowLeft size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
        {items === null
          ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : items.length === 0
          ? <p className="col-span-full text-sm text-ink/50">لا توجد منتجات حاليًا.</p>
          : items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
