export default function MovieCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden glass">
      <div className="aspect-[2/3] bg-muted animate-pulse" />
      <div className="p-4">
        <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        <div className="h-8 w-full bg-muted animate-pulse rounded-md mt-3" />
      </div>
    </div>
  );
}
