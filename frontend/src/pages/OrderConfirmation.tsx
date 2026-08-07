import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Order } from '@/types';

export default function OrderConfirmation() {
  const location = useLocation();
  const order = (location.state as { order?: Order } | null)?.order;

  if (!order) return <Navigate to="/" replace />;

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <CheckCircle2 size={56} className="mx-auto mb-5 text-pine-600" />
      <h1 className="font-display font-bold text-2xl mb-2">تم استلام طلبك!</h1>
      <p className="text-ink/60 text-sm mb-1">رقم الطلب</p>
      <p className="price-tag text-base mb-6">{order.order_number}</p>
      <p className="text-ink/60 text-sm mb-8 leading-relaxed">
        سيتواصل معك فريقنا قريبًا لتأكيد الطلب. يمكنك تتبع حالة طلبك في أي وقت باستخدام رقم الطلب ورقم هاتفك.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link to="/shop" className="border border-ink/20 px-5 py-3 text-sm font-medium hover:border-pine-600">
          متابعة التسوق
        </Link>
        <Link to="/track-order" className="bg-ink text-paper dark:bg-paper-dark dark:text-ink-dark px-5 py-3 text-sm font-medium hover:bg-pine-600">
          تتبع الطلب
        </Link>
      </div>
    </div>
  );
}
