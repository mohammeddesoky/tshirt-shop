import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { api } from '@/api/client';
import { Order } from '@/types';
import Spinner from '@/components/Spinner';

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'المنوفية', 'القليوبية',
  'الغربية', 'كفر الشيخ', 'البحيرة', 'بورسعيد', 'الإسماعيلية', 'السويس', 'الفيوم',
  'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان',
];

const SHIPPING_FLAT_RATE = 50;
const FREE_SHIPPING_THRESHOLD = 1500;

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', phone: '', governorate: '', city: '', address: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (items.length === 0) return <Navigate to="/cart" replace />;

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  const total = subtotal + shipping;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'الاسم مطلوب';
    if (!/^01[0-2,5]{1}[0-9]{8}$/.test(form.phone.trim())) e.phone = 'رقم هاتف غير صحيح (مثال: 01012345678)';
    if (!form.governorate) e.governorate = 'اختر المحافظة';
    if (!form.city.trim()) e.city = 'المدينة مطلوبة';
    if (!form.address.trim()) e.address = 'العنوان مطلوب';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const order = await api.post<Order>('/api/orders', {
        ...form,
        items: items.map((i) => ({
          product_id: i.productId, color_id: i.colorId, size_id: i.sizeId, quantity: i.quantity,
        })),
      });
      clearCart();
      showToast('تم إرسال طلبك بنجاح!');
      navigate('/order-confirmation', { state: { order } });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'حدث خطأ أثناء إرسال الطلب', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = (field: string) =>
    `w-full border px-3 py-2.5 text-sm bg-transparent outline-none focus:border-pine-600 ${
      errors[field] ? 'border-rust-500' : 'border-ink/20'
    }`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display font-bold text-3xl mb-8">إتمام الطلب</h1>
      <div className="grid md:grid-cols-[1fr_320px] gap-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium block mb-1.5">الاسم الكامل</label>
            <input className={inputCls('name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            {errors.name && <p className="text-xs text-rust-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">رقم الهاتف</label>
            <input className={inputCls('phone')} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01012345678" dir="ltr" />
            {errors.phone && <p className="text-xs text-rust-500 mt-1">{errors.phone}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">المحافظة</label>
              <select className={inputCls('governorate')} value={form.governorate} onChange={(e) => setForm({ ...form, governorate: e.target.value })}>
                <option value="">اختر المحافظة</option>
                {GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              {errors.governorate && <p className="text-xs text-rust-500 mt-1">{errors.governorate}</p>}
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">المدينة</label>
              <input className={inputCls('city')} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              {errors.city && <p className="text-xs text-rust-500 mt-1">{errors.city}</p>}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">العنوان بالتفصيل</label>
            <textarea className={inputCls('address')} rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            {errors.address && <p className="text-xs text-rust-500 mt-1">{errors.address}</p>}
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">ملاحظات (اختياري)</label>
            <textarea className={inputCls('notes')} rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-ink text-paper dark:bg-paper-dark dark:text-ink-dark py-3.5 font-medium hover:bg-pine-600 transition-colors disabled:opacity-60"
          >
            {submitting ? <Spinner size={18} /> : null}
            تأكيد الطلب
          </button>
        </form>

        <div className="border border-ink/10 dark:border-ink-dark/10 p-6 h-fit sticky top-24">
          <h2 className="font-display font-semibold text-lg mb-5">ملخص الطلب</h2>
          <div className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-1">
            {items.map((i) => (
              <div key={`${i.productId}-${i.colorId}-${i.sizeId}`} className="flex justify-between text-sm">
                <span className="text-ink/70 line-clamp-1">{i.productName} × {i.quantity}</span>
                <span className="font-mono shrink-0 ms-2">{(i.price * i.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm border-t border-ink/10 dark:border-ink-dark/10 pt-4">
            <div className="flex justify-between"><span className="text-ink/60">المجموع الفرعي</span><span className="font-mono">{subtotal.toFixed(0)} ج.م</span></div>
            <div className="flex justify-between"><span className="text-ink/60">الشحن</span><span className="font-mono">{shipping === 0 ? 'مجاني' : `${shipping} ج.م`}</span></div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-ink/10 dark:border-ink-dark/10"><span>الإجمالي</span><span className="font-mono">{total.toFixed(0)} ج.م</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
