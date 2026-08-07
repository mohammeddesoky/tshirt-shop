import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Share2, Facebook, MessageCircle } from 'lucide-react';
import { api, imageUrl } from '@/api/client';
import { ProductDetail as ProductDetailType, ProductListItem, Color, Size } from '@/types';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import StarRating from '@/components/StarRating';
import ProductCard from '@/components/ProductCard';
import Spinner from '@/components/Spinner';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState<ProductDetailType | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [similar, setSimilar] = useState<ProductListItem[]>([]);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!slug) return;
    setProduct(null);
    setNotFound(false);
    api
      .get<ProductDetailType>(`/api/products/${slug}`)
      .then((p) => {
        setProduct(p);
        document.title = `${p.name} — AfterEight`;
        const firstColor = p.colors[0] || null;
        setSelectedColor(firstColor);
        setSelectedSize(null);
        setQuantity(1);
        const primary = p.images.find((i) => i.color_id === firstColor?.id) || p.images.find((i) => i.is_primary) || p.images[0];
        setActiveImage(primary?.url || null);
      })
      .catch(() => setNotFound(true));
    api.get<ProductListItem[]>(`/api/products/${slug}/similar`).then(setSimilar).catch(() => {});
  }, [slug]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    if (!selectedColor) return product.images;
    const forColor = product.images.filter((i) => i.color_id === selectedColor.id);
    return forColor.length > 0 ? forColor : product.images;
  }, [product, selectedColor]);

  useEffect(() => {
    if (galleryImages.length > 0) setActiveImage(galleryImages[0].url);
  }, [galleryImages]);

  const currentVariant = useMemo(() => {
    if (!product || !selectedColor || !selectedSize) return null;
    return product.variants.find((v) => v.color.id === selectedColor.id && v.size.id === selectedSize.id) || null;
  }, [product, selectedColor, selectedSize]);

  const isSizeAvailable = (size: Size) => {
    if (!product || !selectedColor) return false;
    const v = product.variants.find((v) => v.color.id === selectedColor.id && v.size.id === size.id);
    return !!v && v.stock > 0;
  };

  const maxQty = currentVariant?.stock ?? 1;

  const handleAddToCart = () => {
    if (!product || !selectedColor) return;
    if (!selectedSize) {
      showToast('يرجى اختيار المقاس أولًا', 'error');
      return;
    }
    if (!currentVariant || currentVariant.stock <= 0) {
      showToast('هذا الخيار غير متوفر حاليًا', 'error');
      return;
    }
    addItem({
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      colorId: selectedColor.id,
      colorName: selectedColor.name,
      sizeId: selectedSize.id,
      sizeLabel: selectedSize.label,
      quantity,
      price: product.price,
      image: activeImage || '',
      maxStock: currentVariant.stock,
    });
    showToast('تمت الإضافة إلى السلة');
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (notFound) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-2xl mb-3">المنتج غير موجود</h1>
        <Link to="/shop" className="text-pine-600 hover:underline text-sm">العودة إلى المتجر</Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  const onSale = product.compare_at_price && product.compare_at_price > product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Gallery */}
        <div>
          <div className="aspect-[4/5] bg-sand-100 overflow-hidden mb-3">
            <img src={imageUrl(activeImage)} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {galleryImages.length > 1 && (
            <div className="flex gap-2">
              {galleryImages.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.url)}
                  className={`w-16 h-20 shrink-0 overflow-hidden border-2 ${
                    activeImage === img.url ? 'border-pine-600' : 'border-transparent'
                  }`}
                >
                  <img src={imageUrl(img.url)} alt="" className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category && <span className="eyebrow">{product.category.name}</span>}
          <h1 className="font-display font-bold text-3xl mt-2 mb-3">{product.name}</h1>
          <StarRating rating={product.rating} count={product.rating_count} size={16} />

          <div className="flex items-center gap-3 mt-4 mb-6">
            <span className="price-tag text-base px-3 py-1.5">{product.price.toFixed(0)} ج.م</span>
            {onSale && (
              <span className="text-ink/40 line-through">{product.compare_at_price!.toFixed(0)} ج.م</span>
            )}
          </div>

          <p className="text-ink/70 dark:text-ink-dark/70 leading-relaxed mb-8">{product.description}</p>

          {/* Colors */}
          <div className="mb-6">
            <h4 className="eyebrow mb-3">اللون: {selectedColor?.name}</h4>
            <div className="flex gap-2">
              {product.colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedColor(c);
                    setSelectedSize(null);
                  }}
                  title={c.name}
                  className={`w-9 h-9 rounded-full border-2 transition-transform ${
                    selectedColor?.id === c.id ? 'border-pine-600 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.hex_code, boxShadow: '0 0 0 1px rgba(0,0,0,0.15)' }}
                />
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="mb-6">
            <h4 className="eyebrow mb-3">المقاس</h4>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const available = isSizeAvailable(s);
                return (
                  <button
                    key={s.id}
                    disabled={!available}
                    onClick={() => setSelectedSize(s)}
                    className={`w-12 h-11 text-sm font-medium border transition-colors ${
                      !available
                        ? 'border-ink/10 text-ink/25 line-through cursor-not-allowed'
                        : selectedSize?.id === s.id
                        ? 'border-ink bg-ink text-paper dark:bg-paper-dark dark:text-ink-dark'
                        : 'border-ink/20 hover:border-ink'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
            {currentVariant && currentVariant.stock <= 5 && currentVariant.stock > 0 && (
              <p className="text-xs text-rust-500 mt-2">متبقي {currentVariant.stock} قطع فقط</p>
            )}
          </div>

          {/* Quantity */}
          <div className="mb-8">
            <h4 className="eyebrow mb-3">الكمية</h4>
            <div className="inline-flex items-center border border-ink/20">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-ink/5"
                aria-label="إنقاص الكمية"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(maxQty || 1, q + 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-ink/5"
                aria-label="زيادة الكمية"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.total_stock <= 0}
            className="w-full flex items-center justify-center gap-2 bg-ink text-paper dark:bg-paper-dark dark:text-ink-dark py-4 font-medium hover:bg-pine-600 dark:hover:bg-pine-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={18} />
            {product.total_stock <= 0 ? 'نفذت الكمية' : 'أضف إلى السلة'}
          </button>

          {/* Share */}
          <div className="flex items-center gap-3 mt-6">
            <span className="text-xs text-ink/50 flex items-center gap-1"><Share2 size={14} /> مشاركة:</span>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(product.name + ' ' + shareUrl)}`}
              target="_blank" rel="noopener noreferrer"
              className="p-2 border border-ink/15 hover:border-pine-600 hover:text-pine-600"
            >
              <MessageCircle size={16} />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank" rel="noopener noreferrer"
              className="p-2 border border-ink/15 hover:border-pine-600 hover:text-pine-600"
            >
              <Facebook size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* Similar products */}
      {similar.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display font-semibold text-2xl mb-8">منتجات مشابهة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
            {similar.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
