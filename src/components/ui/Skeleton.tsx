export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-container-highest rounded ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[3/4] rounded-lg" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}
