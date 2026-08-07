import { useState } from 'react';
import { Package } from 'lucide-react';
import { api, imageUrl } from '@/api/client';
import { Order, OrderStatus } from '@/types';

const STATUS_STEPS: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
const STATUS_LABELS: Record<OrderStatus, string> = {
  Pending: 'قيد الانتظار', Confirmed: 'تم التأكيد', Processing: 'قيد التجهيز',
  Shipped: 'تم الشحن', Delivered: 'تم التسليم', Cancelled: 'ملغي',
};

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    setLoading(true);
    try {
      const res = await api.post<Order>('/api/orders/track', { order_number: orderNumber, phone });
      setOrder(res);
    } catch {
      setError('لم يتم العثور على الطلب. تأكد من رقم الطلب ورقم الهاتف.');
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order && order.status !== 'Cancelled' ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
      <div className="text-center mb-10">
        <Package size={40} className="mx-auto mb-4 text-pine-600" />
        <h1 className="font-display font-bold text-3xl mb-2">تتبع طلبك</h1>
        <p className="text-ink/60 text-sm">أدخل رقم الطلب ورقم الهاتف المستخدم عند الشراء</p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-10">
        <input
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="رقم الطلب (مثال: ORD-12345678)"
          className="flex-1 border border-ink/20 px-3 py-2.5 text-sm bg-transparent"
          required
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="رقم الهاتف"
          dir="ltr"
          className="flex-1 border border-ink/20 px-3 py-2.5 text-sm bg-transparent"
          required
        />
        <button disabled={loading} className="bg-ink text-paper dark:bg-paper-dark dark:text-ink-dark px-6 py-2.5 text-sm font-medium hover:bg-pine-600 disabled:opacity-60">
          {loading ? '...' : 'بحث'}
        </button>
      </form>

      {error && <p className="text-center text-rust-500 text-sm mb-6">{error}</p>}

      {order && (
        <div className="border border-ink/10 dark:border-ink-dark/10 p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs text-ink/50">رقم الطلب</p>
              <p className="font-mono font-medium">{order.order_number}</p>
            </div>
            <span className="price-tag">{order.total.toFixed(0)} ج.م</span>
          </div>

          {order.status !== 'Cancelled' ? (
            <div className="flex items-center mb-8">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex-1 flex flex-col items-center relative">
                  {i > 0 && (
                    <div className={`absolute top-3 -start-1/2 w-full h-0.5 ${i <= currentStepIndex ? 'bg-pine-600' : 'bg-ink/10'}`} />
                  )}
                  <div className={`w-6 h-6 rounded-full z-10 flex items-center justify-center text-[10px] font-bold ${
                    i <= currentStepIndex ? 'bg-pine-600 text-white' : 'bg-ink/10 text-ink/40'
                  }`}>
                    {i + 1}
                  </div>
                  <span className="text-[10px] mt-2 text-center text-ink/60">{STATUS_LABELS[step]}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-rust-500 font-medium mb-6">هذا الطلب ملغي</p>
          )}

          <div className="divide-y divide-ink/10 dark:divide-ink-dark/10">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-3 py-3">
                <img src={imageUrl(item.image_url)} alt="" className="w-14 h-16 object-cover bg-sand-100" />
                <div className="flex-1 text-sm">
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-xs text-ink/50">{item.color_name} · {item.size_label} · ×{item.quantity}</p>
                </div>
                <span className="font-mono text-sm">{item.line_total.toFixed(0)} ج.م</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
