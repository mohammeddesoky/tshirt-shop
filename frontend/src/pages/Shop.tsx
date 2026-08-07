import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { api } from '@/api/client';
import { PaginatedProducts, Category, Color, Size } from '@/types';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<PaginatedProducts | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const q = params.get('q') || '';
  const categoryId = params.get('category_id') || '';
  const colorId = params.get('color_id') || '';
  const sizeId = params.get('size_id') || '';
  const minPrice = params.get('min_price') || '';
  const maxPrice = params.get('max_price') || '';
  const sort = params.get('sort') || 'newest';
  const page = Number(params.get('page') || '1');
  const featured = params.get('featured') || '';

  useEffect(() => {
    document.title = 'المتجر — AfterEight';
    api.get<Category[]>('/api/meta/categories').then(setCategories);
    api.get<Color[]>('/api/meta/colors').then(setColors);
    api.get<Size[]>('/api/meta/sizes').then(setSizes);
  }, []);

  useEffect(() => {
    setData(null);
    const qs = new URLSearchParams();
    if (q) qs.set('q', q);
    if (categoryId) qs.set('category_id', categoryId);
    if (colorId) qs.set('color_id', colorId);
    if (sizeId) qs.set('size_id', sizeId);
    if (minPrice) qs.set('min_price', minPrice);
    if (maxPrice) qs.set('max_price', maxPrice);
    if (featured) qs.set('featured', featured);
    qs.set('sort', sort);
    qs.set('page', String(page));
    qs.set('page_size', '12');
    api.get<PaginatedProducts>(`/api/products?${qs.toString()}`).then(setData);
  }, [q, categoryId, colorId, sizeId, minPrice, maxPrice, sort, page, featured]);

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params);
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete('page');
      setParams(next);
    },
    [params, setParams]
  );

  const clearFilters = () => setParams(q ? new URLSearchParams({ q }) : new URLSearchParams());

  const hasFilters = categoryId || colorId || sizeId || minPrice || maxPrice || featured;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl">{q ? `نتائج البحث: "${q}"` : 'كل المنتجات'}</h1>
          {data && <p className="text-sm text-ink/50 mt-1">{data.total} منتج</p>}
        </div>
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="md:hidden flex items-center gap-2 border border-ink/15 px-3 py-2 text-sm"
        >
          <SlidersHorizontal size={16} /> فلاتر
        </button>
      </div>

      <div className="grid md:grid-cols-[220px_1fr] gap-10">
        {/* Filters sidebar */}
        <aside className={`${filtersOpen ? 'block' : 'hidden'} md:block`}>
          <div className="flex items-center justify-between mb-4 md:hidden">
            <span className="font-medium">الفلاتر</span>
            <button onClick={() => setFiltersOpen(false)}><X size={18} /></button>
          </div>

          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-rust-500 mb-4 hover:underline">
              مسح كل الفلاتر
            </button>
          )}

          <FilterGroup title="الفئة">
            {categories.map((c) => (
              <FilterCheckbox
                key={c.id}
                label={c.name}
                checked={categoryId === String(c.id)}
                onChange={(checked) => setParam('category_id', checked ? String(c.id) : '')}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="اللون">
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setParam('color_id', colorId === String(c.id) ? '' : String(c.id))}
                  title={c.name}
                  className={`w-7 h-7 rounded-full border-2 ${colorId === String(c.id) ? 'border-pine-600' : 'border-transparent'}`}
                  style={{ backgroundColor: c.hex_code, boxShadow: '0 0 0 1px rgba(0,0,0,0.1)' }}
                />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="المقاس">
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setParam('size_id', sizeId === String(s.id) ? '' : String(s.id))}
                  className={`w-10 h-9 text-xs font-medium border ${
                    sizeId === String(s.id) ? 'border-ink bg-ink text-paper dark:bg-paper-dark dark:text-ink-dark' : 'border-ink/20'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="السعر">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="من"
                defaultValue={minPrice}
                onBlur={(e) => setParam('min_price', e.target.value)}
                className="w-full border border-ink/20 px-2 py-1.5 text-sm bg-transparent"
              />
              <span className="text-ink/40">—</span>
              <input
                type="number"
                placeholder="إلى"
                defaultValue={maxPrice}
                onBlur={(e) => setParam('max_price', e.target.value)}
                className="w-full border border-ink/20 px-2 py-1.5 text-sm bg-transparent"
              />
            </div>
          </FilterGroup>
        </aside>

        {/* Products grid */}
        <div>
          <div className="flex justify-end mb-6">
            <select
              value={sort}
              onChange={(e) => setParam('sort', e.target.value)}
              className="border border-ink/20 bg-transparent text-sm px-3 py-2"
            >
              <option value="newest">الأحدث</option>
              <option value="price_asc">السعر: من الأقل</option>
              <option value="price_desc">السعر: من الأعلى</option>
              <option value="rating">الأعلى تقييمًا</option>
            </select>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10">
            {data === null
              ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : data.items.length === 0
              ? (
                <div className="col-span-full text-center py-20">
                  <p className="font-display text-lg mb-1">لا توجد منتجات مطابقة</p>
                  <p className="text-sm text-ink/50">جرّب تعديل الفلاتر أو البحث بكلمات مختلفة.</p>
                </div>
              )
              : data.items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>

          {data && data.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              {Array.from({ length: data.pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setParam('page', String(i + 1))}
                  className={`w-9 h-9 text-sm font-medium ${
                    page === i + 1 ? 'bg-ink text-paper dark:bg-paper-dark dark:text-ink-dark' : 'border border-ink/15'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-7">
      <h4 className="eyebrow mb-3">{title}</h4>
      {children}
    </div>
  );
}

function FilterCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (c: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm mb-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-pine-600" />
      {label}
    </label>
  );
}
