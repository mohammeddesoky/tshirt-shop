import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { imageUrl } from '@/api/client';

const SHIPPING_FLAT_RATE = 50;
const FREE_SHIPPING_THRESHOLD = 1500;

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart();
  const navigate = useNavigate();

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FLAT_RATE;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <ShoppingBag size={48} className="mx-auto mb-5 text-ink/20" />
        <h1 className="font-display text-2xl mb-2">سلتك فارغة</h1>
        <p className="text-ink/50 text-sm mb-8">لم تقم بإضافة أي منتجات بعد.</p>
        <Link to="/shop" className="inline-block bg-ink text-paper dark:bg-paper-dark dark:text-ink-dark px-6 py-3 font-medium text-sm hover:bg-pine-600 transition-colors">
          تصفح المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-3xl">السلة</h1>
        <button onClick={clearCart} className="text-xs text-rust-500 hover:underline">مسح السلة بالكامل</button>
      </div>

      <div className="grid md:grid-cols-[1fr_320px] gap-10">
        <div className="divide-y divide-ink/10 dark:divide-ink-dark/10">
          {items.map((item) => (
            <div key={`${item.productId}-${item.colorId}-${item.sizeId}`} className="flex gap-4 py-5">
              <Link to={`/product/${item.slug}`} className="w-20 h-24 bg-sand-100 shrink-0 overflow-hidden">
                <img src={imageUrl(item.image)} alt={item.productName} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.slug}`} className="font-medium hover:text-pine-600 line-clamp-2">
                  {item.productName}
                </Link>
                <p className="text-xs text-ink/50 mt-1">{item.colorName} · {item.sizeLabel}</p>
                <p className="price-tag mt-2">{item.price.toFixed(0)} ج.م</p>

                <div className="flex items-center justify-between mt-3">
                  <div className="inline-flex items-center border border-ink/20">
                    <button
                      onClick={() => updateQuantity(item.productId, item.colorId, item.sizeId, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-ink/5"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-9 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.colorId, item.sizeId, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-ink/5"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.colorId, item.sizeId)}
                    className="p-2 text-ink/40 hover:text-rust-500"
                    aria-label="حذف"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="font-mono text-sm font-medium shrink-0">
                {(item.price * item.quantity).toFixed(0)} ج.م
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="border border-ink/10 dark:border-ink-dark/10 p-6 h-fit sticky top-24">
          <h2 className="font-display font-semibold text-lg mb-5">ملخص الطلب</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/60">المجموع الفرعي</span>
              <span className="font-mono">{subtotal.toFixed(0)} ج.م</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/60">الشحن</span>
              <span className="font-mono">{shipping === 0 ? 'مجاني' : `${shipping.toFixed(0)} ج.م`}</span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-pine-600">أضف {(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(0)} ج.م أخرى للحصول على شحن مجاني</p>
            )}
            <div className="flex justify-between pt-3 border-t border-ink/10 dark:border-ink-dark/10 font-semibold text-base">
              <span>الإجمالي</span>
              <span className="font-mono">{total.toFixed(0)} ج.م</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full mt-6 bg-ink text-paper dark:bg-paper-dark dark:text-ink-dark py-3.5 font-medium hover:bg-pine-600 dark:hover:bg-pine-500 transition-colors"
          >
            إتمام الطلب
          </button>
        </div>
      </div>
    </div>
  );
}
