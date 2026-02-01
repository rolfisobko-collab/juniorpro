export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-9 w-64 bg-muted animate-pulse rounded mb-2" />
        <div className="h-5 w-96 bg-muted animate-pulse rounded" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="h-10 w-full md:w-[200px] bg-muted animate-pulse rounded" />
        <div className="h-10 w-full md:w-[200px] bg-muted animate-pulse rounded" />
      </div>

      <div className="grid grid-cols-1 max-[325px]:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="aspect-[4/5] bg-muted animate-pulse rounded-lg" />
            <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
            <div className="h-10 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
