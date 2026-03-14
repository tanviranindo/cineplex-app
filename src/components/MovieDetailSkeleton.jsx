export default function MovieDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="h-8 w-20 bg-muted animate-pulse motion-reduce:animate-none rounded-full mb-6" />
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Poster */}
        <div className="shrink-0 mx-auto md:mx-0">
          <div className="w-64 sm:w-72 aspect-[2/3] bg-muted animate-pulse motion-reduce:animate-none rounded-2xl" />
        </div>

        {/* Info */}
        <div className="flex-1 space-y-6">
          <div>
            <div className="h-8 w-2/3 bg-muted animate-pulse motion-reduce:animate-none rounded mb-2" />
            <div className="h-4 w-1/2 bg-muted animate-pulse motion-reduce:animate-none rounded" />
            <div className="flex gap-2 mt-4">
              <div className="h-6 w-16 bg-muted animate-pulse motion-reduce:animate-none rounded-full" />
              <div className="h-6 w-16 bg-muted animate-pulse motion-reduce:animate-none rounded-full" />
              <div className="h-6 w-20 bg-muted animate-pulse motion-reduce:animate-none rounded-full" />
            </div>
          </div>

          {/* Genres */}
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-muted animate-pulse motion-reduce:animate-none rounded-full" />
            <div className="h-6 w-20 bg-muted animate-pulse motion-reduce:animate-none rounded-full" />
            <div className="h-6 w-14 bg-muted animate-pulse motion-reduce:animate-none rounded-full" />
          </div>

          {/* Overview */}
          <div className="glass rounded-xl p-5 space-y-2">
            <div className="h-3 w-20 bg-muted animate-pulse motion-reduce:animate-none rounded" />
            <div className="h-4 w-full bg-muted animate-pulse motion-reduce:animate-none rounded mt-3" />
            <div className="h-4 w-full bg-muted animate-pulse motion-reduce:animate-none rounded" />
            <div className="h-4 w-3/4 bg-muted animate-pulse motion-reduce:animate-none rounded" />
          </div>

          {/* Credits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="h-3 w-16 bg-muted animate-pulse motion-reduce:animate-none rounded mb-1" />
                <div className="h-4 w-full bg-muted animate-pulse motion-reduce:animate-none rounded" />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <div className="h-10 w-40 bg-muted animate-pulse motion-reduce:animate-none rounded-md" />
            <div className="h-10 w-36 bg-muted animate-pulse motion-reduce:animate-none rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
