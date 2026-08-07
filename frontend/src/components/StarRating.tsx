import { Star } from 'lucide-react';

export default function StarRating({ rating, count, size = 14 }: { rating: number; count?: number; size?: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`تقييم ${rating} من 5`}>
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={size}
            className={i < Math.round(rating) ? 'fill-pine-600 text-pine-600' : 'fill-transparent text-sand-300'}
          />
        ))}
      </div>
      {count !== undefined && <span className="text-xs text-ink/50 dark:text-ink-dark/50">({count})</span>}
    </div>
  );
}
