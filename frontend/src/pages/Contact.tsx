import { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function Contact() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('تم إرسال رسالتك، سنتواصل معك قريبًا!');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <span className="eyebrow">تواصل معنا</span>
      <h1 className="font-display font-bold text-4xl mt-3 mb-10">نحن هنا لمساعدتك</h1>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <ContactItem icon={<Mail size={18} />} label="البريد الإلكتروني" value="support@AfterEight.com" />
          <ContactItem icon={<Phone size={18} />} label="الهاتف" value="+20 100 000 0000" />
          <ContactItem icon={<MapPin size={18} />} label="العنوان" value="القاهرة، مصر" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="الاسم" className="w-full border border-ink/20 px-3 py-2.5 text-sm bg-transparent"
          />
          <input
            required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="البريد الإلكتروني" className="w-full border border-ink/20 px-3 py-2.5 text-sm bg-transparent"
          />
          <textarea
            required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="رسالتك" className="w-full border border-ink/20 px-3 py-2.5 text-sm bg-transparent"
          />
          <button className="bg-ink text-paper dark:bg-paper-dark dark:text-ink-dark px-6 py-3 text-sm font-medium hover:bg-pine-600">
            إرسال الرسالة
          </button>
        </form>
      </div>
    </div>
  );
}

function ContactItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-pine-600 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-ink/50">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
