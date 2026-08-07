export default function ProductCardSkeleton() {
  return (
    <div>
      <div className="skeleton aspect-[4/5] mb-3" />
      <div className="skeleton h-4 w-3/4 mb-2" />
      <div className="skeleton h-3 w-1/3 mb-2" />
      <div className="skeleton h-5 w-20" />
    </div>
  );
}
