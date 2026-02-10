import { Suspense } from "react"
import ProductsContent from "./products-content"

function ProductsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-48"></div>
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-4">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-32"></div>
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-32"></div>
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-32"></div>
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-32 ml-auto"></div>
          </div>
        </div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Image Skeleton */}
              <div className="aspect-square bg-gray-200 animate-pulse"></div>
              
              {/* Content Skeleton */}
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Space */}
      <div className="h-20 bg-gray-50"></div>
    </div>
  )
}

export default function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; subcategory?: string; sort?: string }>
}) {
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductsContent searchParams={searchParams} />
    </Suspense>
  )
}
