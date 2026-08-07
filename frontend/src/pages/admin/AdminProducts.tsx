import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { api, imageUrl } from '@/api/client';
import { PaginatedProducts, ProductListItem, ProductDetail, Category, Color, Size } from '@/types';
import { useToast } from '@/context/ToastContext';
import Spinner from '@/components/Spinner';

export default function AdminProducts() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<ProductListItem[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    api.get<PaginatedProducts>('/api/products?page_size=100&include_inactive=true').then((r) => setProducts(r.items));
  };

  useEffect(() => {
    load();
    api.get<Category[]>('/api/meta/categories').then(setCategories);
    api.get<Color[]>('/api/meta/colors').then(setColors);
    api.get<Size[]>('/api/meta/sizes').then(setSizes);
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${name}"؟`)) return;
    try {
      await api.delete(`/api/products/${id}`);
      showToast('تم حذف المنتج');
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'فشل الحذف', 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-2xl">المنتجات</h1>
        <button
          onClick={() => { setEditingSlug(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-ink text-paper dark:bg-paper-dark dark:text-ink-dark px-4 py-2.5 text-sm font-medium hover:bg-pine-600"
        >
          <Plus size={16} /> إضافة منتج
        </button>
      </div>

      {products === null ? (
        <div className="flex justify-center py-20"><Spinner size={28} /></div>
      ) : (
        <div className="border border-ink/10 dark:border-ink-dark/10 overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="border-b border-ink/10 dark:border-ink-dark/10 text-ink/50">
              <tr>
                <th className="text-start p-3 font-medium">المنتج</th>
                <th className="text-start p-3 font-medium">السعر</th>
                <th className="text-start p-3 font-medium">المخزون</th>
                <th className="text-start p-3 font-medium">الحالة</th>
                <th className="text-start p-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10 dark:divide-ink-dark/10">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="p-3 flex items-center gap-3">
                    <img src={imageUrl(p.primary_image)} className="w-10 h-12 object-cover bg-sand-100" />
                    <span className="font-medium line-clamp-1">{p.name}</span>
                  </td>
                  <td className="p-3 font-mono">{p.price.toFixed(0)} ج.م</td>
                  <td className="p-3">{p.total_stock}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded ${p.is_active ? 'bg-pine-100 text-pine-700' : 'bg-rust-400/20 text-rust-500'}`}>
                      {p.is_active ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingSlug(p.slug); setShowForm(true); }} className="p-1.5 hover:text-pine-600">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 hover:text-rust-500">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <ProductFormModal
          slug={editingSlug}
          categories={categories}
          colors={colors}
          sizes={sizes}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}

function ProductFormModal({
  slug, categories, colors, sizes, onClose, onSaved,
}: {
  slug: string | null;
  categories: Category[];
  colors: Color[];
  sizes: Size[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(!!slug);
  const [saving, setSaving] = useState(false);
  const [productId, setProductId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '', description: '', price: '', compare_at_price: '', category_id: '', is_active: true, is_featured: false,
  });
  const [stockByColorSize, setStockByColorSize] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    api.get<ProductDetail>(`/api/products/${slug}`).then((p) => {
      setProductId(p.id);
      setForm({
        name: p.name, description: p.description, price: String(p.price),
        compare_at_price: p.compare_at_price ? String(p.compare_at_price) : '',
        category_id: p.category?.id ? String(p.category.id) : '', is_active: p.is_active, is_featured: p.is_featured,
      });
      const stock: Record<string, number> = {};
      p.variants.forEach((v) => { stock[`${v.color.id}-${v.size.id}`] = v.stock; });
      setStockByColorSize(stock);
      setLoading(false);
    });
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
        category_id: form.category_id ? parseInt(form.category_id) : null,
        is_active: form.is_active,
        is_featured: form.is_featured,
      };

      let id = productId;
      if (!id) {
        const variants = Object.entries(stockByColorSize)
          .filter(([, stock]) => stock > 0)
          .map(([key, stock]) => {
            const [color_id, size_id] = key.split('-').map(Number);
            return { color_id, size_id, stock };
          });
        const created = await api.post<ProductDetail>('/api/products', { ...payload, variants });
        id = created.id;
      } else {
        await api.put(`/api/products/${id}`, payload);
        const variants = Object.entries(stockByColorSize)
          .filter(([, stock]) => stock > 0)
          .map(([key, stock]) => {
            const [color_id, size_id] = key.split('-').map(Number);
            return { color_id, size_id, stock };
          });
        await api.put(`/api/products/${id}/variants`, variants);
      }
      showToast(slug ? 'تم تحديث المنتج' : 'تم إنشاء المنتج');
      onSaved();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'حدث خطأ', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-paper dark:bg-paper-dark w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-semibold text-xl">{slug ? 'تعديل المنتج' : 'إضافة منتج'}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input required placeholder="اسم المنتج" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-ink/20 px-3 py-2.5 text-sm bg-transparent" />
            <textarea placeholder="الوصف" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-ink/20 px-3 py-2.5 text-sm bg-transparent" />
            <div className="grid grid-cols-2 gap-3">
              <input required type="number" step="0.01" placeholder="السعر" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border border-ink/20 px-3 py-2.5 text-sm bg-transparent" />
              <input type="number" step="0.01" placeholder="السعر قبل الخصم (اختياري)" value={form.compare_at_price} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })}
                className="w-full border border-ink/20 px-3 py-2.5 text-sm bg-transparent" />
            </div>
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full border border-ink/20 px-3 py-2.5 text-sm bg-transparent">
              <option value="">بدون فئة</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-pine-600" />
                نشط
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="accent-pine-600" />
                مميز
              </label>
            </div>

            <div>
              <h4 className="eyebrow mb-3">المخزون حسب اللون والمقاس</h4>
              <div className="overflow-x-auto">
                <table className="text-xs w-full">
                  <thead>
                    <tr>
                      <th className="p-1.5 text-start">اللون</th>
                      {sizes.map((s) => <th key={s.id} className="p-1.5">{s.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {colors.map((c) => (
                      <tr key={c.id}>
                        <td className="p-1.5 flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: c.hex_code }} />
                          {c.name}
                        </td>
                        {sizes.map((s) => (
                          <td key={s.id} className="p-1.5">
                            <input
                              type="number" min={0} className="w-14 border border-ink/15 px-1.5 py-1 text-center bg-transparent"
                              value={stockByColorSize[`${c.id}-${s.id}`] ?? 0}
                              onChange={(e) =>
                                setStockByColorSize({ ...stockByColorSize, [`${c.id}-${s.id}`]: parseInt(e.target.value) || 0 })
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-ink/40 mt-2">
                ملاحظة: صور المنتج تُضاف عبر واجهة الرفع بعد إنشاء المنتج (POST /api/upload/product-image/&#123;id&#125;).
              </p>
            </div>

            <button disabled={saving} className="w-full flex items-center justify-center gap-2 bg-ink text-paper dark:bg-paper-dark dark:text-ink-dark py-3 font-medium hover:bg-pine-600 disabled:opacity-60">
              {saving && <Spinner size={16} />}
              حفظ
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
