import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { api, imageUrl } from '@/api/client';
import { Order, OrderStatus } from '@/types';
import { useToast } from '@/context/ToastContext';
import Spinner from '@/components/Spinner';

const STATUSES: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const STATUS_LABELS: Record<OrderStatus, string> = {
  Pending: 'قيد الانتظار', Confirmed: 'تم التأكيد', Processing: 'قيد التجهيز',
  Shipped: 'تم الشحن', Delivered: 'تم التسليم', Cancelled: 'ملغي',
};
const STATUS_COLORS: Record<OrderStatus, string> = {
  Pending: 'bg-sand-300/60 text-ink', Confirmed: 'bg-pine-100 text-pine-700', Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700', Delivered: 'bg-pine-600 text-white', Cancelled: 'bg-rust-400/20 text-rust-500',
};

export default function AdminOrders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filter, setFilter] = useState<OrderStatus | ''>('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = () => {
    const qs = filter ? `?status=${filter}` : '';
    api.get<Order[]>(`/api/orders${qs}`).then(setOrders);
  };

  useEffect(load, [filter]);

  const handleStatusChange = async (id: number, status: OrderStatus) => {
    try {
      await api.patch(`/api/orders/${id}/status`, { status });
      showToast('تم تحديث حالة الطلب');
      load();
    } catch {
      showToast('فشل التحديث', 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl">الطلبات</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value as OrderStatus | '')} className="border border-ink/20 bg-transparent text-sm px-3 py-2">
          <option value="">كل الحالات</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {orders === null ? (
        <div className="flex justify-center py-20"><Spinner size={28} /></div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-ink/50 py-10 text-center">لا توجد طلبات</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="border border-ink/10 dark:border-ink-dark/10">
              <button
                onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                className="w-full flex items-center justify-between p-4 text-start"
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="font-mono text-sm font-medium">{o.order_number}</span>
                  <span className="text-sm text-ink/60">{o.customer.name} · {o.customer.phone}</span>
                  <span className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[o.status]}`}>{STATUS_LABELS[o.status]}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm">{o.total.toFixed(0)} ج.م</span>
                  {expanded === o.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {expanded === o.id && (
                <div className="border-t border-ink/10 dark:border-ink-dark/10 p-4">
                  <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <div className="text-sm space-y-1">
                      <p><span className="text-ink/50">العنوان:</span> {o.address}, {o.city}, {o.governorate}</p>
                      {o.notes && <p><span className="text-ink/50">ملاحظات:</span> {o.notes}</p>}
                      <p><span className="text-ink/50">التاريخ:</span> {new Date(o.created_at).toLocaleString('ar-EG')}</p>
                    </div>
                    <div>
                      <label className="text-xs text-ink/50 block mb-1.5">تغيير الحالة</label>
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                        className="border border-ink/20 bg-transparent text-sm px-3 py-2 w-full"
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="divide-y divide-ink/10 dark:divide-ink-dark/10">
                    {o.items.map((item) => (
                      <div key={item.id} className="flex gap-3 py-2 items-center">
                        <img src={imageUrl(item.image_url)} className="w-10 h-12 object-cover bg-sand-100" />
                        <div className="flex-1 text-sm">
                          <p>{item.product_name}</p>
                          <p className="text-xs text-ink/50">{item.color_name} · {item.size_label} · ×{item.quantity}</p>
                        </div>
                        <span className="font-mono text-sm">{item.line_total.toFixed(0)} ج.م</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
