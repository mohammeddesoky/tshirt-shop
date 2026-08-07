import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { ContactMessage } from '@/types';
import Spinner from '@/components/Spinner';

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);

  useEffect(() => {
    api.get<ContactMessage[]>('/api/messages').then(setMessages);
  }, []);

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-8">الرسائل</h1>

      {messages === null ? (
        <div className="flex justify-center py-20"><Spinner size={28} /></div>
      ) : messages.length === 0 ? (
        <p className="text-sm text-ink/50 py-10 text-center">لا توجد رسائل بعد</p>
      ) : (
        <div className="border border-ink/10 dark:border-ink-dark/10 overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="border-b border-ink/10 dark:border-ink-dark/10 text-ink/50">
              <tr>
                <th className="text-start p-3 font-medium">الاسم</th>
                <th className="text-start p-3 font-medium">البريد الإلكتروني</th>
                <th className="text-start p-3 font-medium">الرسالة</th>
                <th className="text-start p-3 font-medium">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10 dark:divide-ink-dark/10">
              {messages.map((message) => (
                <tr key={message.id}>
                  <td className="p-3 font-medium">{message.name}</td>
                  <td className="p-3 font-mono" dir="ltr">{message.email}</td>
                  <td className="p-3 max-w-[40rem] whitespace-pre-line">{message.message}</td>
                  <td className="p-3 font-mono">{new Date(message.created_at).toLocaleString('ar-EG')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
