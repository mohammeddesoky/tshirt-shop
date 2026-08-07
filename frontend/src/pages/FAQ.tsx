import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  { q: 'كم تستغرق مدة التوصيل؟', a: 'عادة من 2 إلى 5 أيام عمل حسب المحافظة.' },
  { q: 'هل يمكنني استبدال المقاس؟', a: 'نعم، يمكنك الاستبدال خلال 14 يومًا من الاستلام، شرط أن تكون القطعة بحالتها الأصلية.' },
  { q: 'ما هي طرق الدفع المتاحة؟', a: 'الدفع عند الاستلام حاليًا، مع خطط لإضافة طرق دفع إلكترونية قريبًا.' },
  { q: 'كيف أعرف مقاسي الصحيح؟', a: 'راجع جدول المقاسات في صفحة كل منتج، أو تواصل معنا وسنساعدك في الاختيار.' },
  { q: 'هل الشحن مجاني؟', a: 'الشحن مجاني للطلبات التي تتجاوز 1500 ج.م، وبخلاف ذلك رسوم شحن ثابتة 50 ج.م.' },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <span className="eyebrow">الأسئلة الشائعة</span>
      <h1 className="font-display font-bold text-4xl mt-3 mb-10">هل لديك سؤال؟</h1>

      <div className="divide-y divide-ink/10 dark:divide-ink-dark/10">
        {FAQS.map((f, i) => (
          <div key={i}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between py-5 text-start font-medium"
            >
              {f.q}
              <ChevronDown size={18} className={`shrink-0 transition-transform ${open === i ? 'rotate-180 text-pine-600' : ''}`} />
            </button>
            {open === i && <p className="text-sm text-ink/60 dark:text-ink-dark/60 pb-5 leading-relaxed">{f.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
