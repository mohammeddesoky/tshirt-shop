import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { CustomerAdmin } from '@/types';
import Spinner from '@/components/Spinner';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerAdmin[] | null>(null);

  useEffect(() => {
    api.get<CustomerAdmin[]>('/api/customers').then(setCustomers);
  }, []);

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-8">العملاء</h1>

      {customers === null ? (
        <div className="flex justify-center py-20"><Spinner size={28} /></div>
      ) : customers.length === 0 ? (
        <p className="text-sm text-ink/50 py-10 text-center">لا يوجد عملاء بعد</p>
      ) : (
        <div className="border border-ink/10 dark:border-ink-dark/10 overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead className="border-b border-ink/10 dark:border-ink-dark/10 text-ink/50">
              <tr>
                <th className="text-start p-3 font-medium">الاسم</th>
                <th className="text-start p-3 font-medium">الهاتف</th>
                <th className="text-start p-3 font-medium">عدد الطلبات</th>
                <th className="text-start p-3 font-medium">إجمالي المشتريات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10 dark:divide-ink-dark/10">
              {customers
                .sort((a, b) => b.total_spent - a.total_spent)
                .map((c) => (
                  <tr key={c.id}>
                    <td className="p-3 font-medium">{c.name}</td>
                    <td className="p-3 font-mono" dir="ltr">{c.phone}</td>
                    <td className="p-3">{c.total_orders}</td>
                    <td className="p-3 font-mono">{c.total_spent.toFixed(0)} ج.م</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
