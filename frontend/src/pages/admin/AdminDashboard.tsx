import { useEffect, useState } from 'react';
import { ShoppingCart, DollarSign, Users, Package, Clock } from 'lucide-react';
import { api } from '@/api/client';
import { DashboardStats } from '@/types';
import Spinner from '@/components/Spinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.get<DashboardStats>('/api/dashboard/stats').then(setStats);
  }, []);

  if (!stats) {
    return <div className="flex justify-center py-20"><Spinner size={28} /></div>;
  }

  const maxDaily = Math.max(...stats.daily_sales.map((d) => d.sales), 1);
  const maxTop = Math.max(...stats.top_products.map((p) => p.sold), 1);

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-8">الإحصائيات</h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <StatCard icon={<ShoppingCart size={18} />} label="إجمالي الطلبات" value={stats.total_orders} />
        <StatCard icon={<DollarSign size={18} />} label="إجمالي المبيعات" value={`${stats.total_sales.toFixed(0)} ج.م`} />
        <StatCard icon={<Users size={18} />} label="العملاء" value={stats.total_customers} />
        <StatCard icon={<Package size={18} />} label="المنتجات" value={stats.total_products} />
        <StatCard icon={<Clock size={18} />} label="طلبات معلّقة" value={stats.pending_orders} accent />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="border border-ink/10 dark:border-ink-dark/10 p-5">
          <h2 className="font-display font-semibold mb-5">المبيعات اليومية (آخر 14 يوم)</h2>
          <div className="flex items-end gap-1.5 h-40">
            {stats.daily_sales.length === 0 && <p className="text-sm text-ink/40">لا توجد بيانات كافية بعد</p>}
            {stats.daily_sales.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className="w-full bg-pine-500 hover:bg-pine-600 transition-colors"
                  style={{ height: `${(d.sales / maxDaily) * 100}%`, minHeight: d.sales > 0 ? 4 : 0 }}
                  title={`${d.date}: ${d.sales.toFixed(0)} ج.م`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="border border-ink/10 dark:border-ink-dark/10 p-5">
          <h2 className="font-display font-semibold mb-5">الأكثر مبيعًا</h2>
          <div className="space-y-3">
            {stats.top_products.length === 0 && <p className="text-sm text-ink/40">لا توجد بيانات كافية بعد</p>}
            {stats.top_products.map((p) => (
              <div key={p.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="line-clamp-1">{p.name}</span>
                  <span className="font-mono text-ink/50">{p.sold}</span>
                </div>
                <div className="h-1.5 bg-sand-100 dark:bg-ink/30">
                  <div className="h-full bg-pine-600" style={{ width: `${(p.sold / maxTop) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="border border-ink/10 dark:border-ink-dark/10 p-4">
      <div className={`mb-3 ${accent ? 'text-rust-500' : 'text-pine-600'}`}>{icon}</div>
      <p className="font-display font-bold text-xl">{value}</p>
      <p className="text-xs text-ink/50 mt-0.5">{label}</p>
    </div>
  );
}
