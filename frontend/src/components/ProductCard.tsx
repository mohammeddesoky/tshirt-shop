import { Link } from 'react-router-dom';
import { ProductListItem } from '@/types';
import { imageUrl } from '@/api/client';
import StarRating from './StarRating';

export default function ProductCard({ product }: { product: ProductListItem }) {
  const outOfStock = product.total_stock <= 0;
  const onSale = product.compare_at_price && product.compare_at_price > product.price;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block animate-fade-up"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-sand-100 mb-3">
        <img
          src={imageUrl(product.primary_image)}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {onSale && (
          <span className="absolute top-3 start-3 price-tag bg-rust-500">تخفيض</span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-ink/60 flex items-center justify-center">
            <span className="text-paper font-display text-sm tracking-wide">نفذت الكمية</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <span className="block w-full text-center bg-ink text-paper dark:bg-paper-dark dark:text-ink-dark text-xs font-medium py-2 tracking-wide">
            عرض التفاصيل
          </span>
        </div>
      </div>
      <h3 className="font-display font-medium text-[15px] leading-snug mb-1 group-hover:text-pine-600 transition-colors">
        {product.name}
      </h3>
      <StarRating rating={product.rating} count={product.rating_count} />
      <div className="flex items-center gap-2 mt-1.5">
        <span className="price-tag">{product.price.toFixed(0)} ج.م</span>
        {onSale && (
          <span className="text-xs text-ink/40 dark:text-ink-dark/40 line-through">
            {product.compare_at_price!.toFixed(0)} ج.م
          </span>
        )}
      </div>
    </Link>
  );
}
