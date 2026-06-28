import { notFound } from "next/navigation"
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/db"
import type { UnifiedProduct } from "@/lib/product-types"
import { getMirrorProductById, getMirrorProducts, isMirrorCatalogEnabled } from "@/lib/mirror-products"
import ProductDetailClient from "./product-detail-client"

const getProduct = unstable_cache(
  async (id: string): Promise<UnifiedProduct | null> => {
    try {
      if (isMirrorCatalogEnabled() && id.startsWith("mirror-")) {
        return await getMirrorProductById(id) as unknown as UnifiedProduct | null
      }

      const product = await prisma.product.findUnique({
        where: { id },
        include: { category: true },
      })
      if (!product) return null
      return {
        ...product,
        images: (product as any).images ?? [],
        stockQuantity: product.stockQuantity ?? 0,
        createdAt: product.createdAt?.toISOString(),
        updatedAt: product.updatedAt?.toISOString(),
      } as unknown as UnifiedProduct
    } catch {
      return null
    }
  },
  ["product-detail"],
  { revalidate: 300, tags: ["products"] }
)

const getRecommended = unstable_cache(
  async (id: string, categoryKey: string): Promise<UnifiedProduct[]> => {
    try {
      if (isMirrorCatalogEnabled()) {
        const result = await getMirrorProducts({
          category: categoryKey,
          excludeId: id,
          limit: 4,
          page: 1,
        })
        return result.products as unknown as UnifiedProduct[]
      }

      const products = await prisma.product.findMany({
        where: { categoryKey, id: { not: id }, image: { startsWith: "http" } },
        take: 4,
        orderBy: [{ featured: "desc" }, { rating: "desc" }],
      })
      return products.map(p => ({
        ...p,
        images: (p as any).images ?? [],
        stockQuantity: p.stockQuantity ?? 0,
        createdAt: p.createdAt?.toISOString(),
        updatedAt: p.updatedAt?.toISOString(),
      })) as unknown as UnifiedProduct[]
    } catch {
      return []
    }
  },
  ["product-recommended"],
  { revalidate: 300, tags: ["products"] }
)

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) notFound()

  const recommended = await getRecommended(id, (product as any).categoryKey ?? "")

  return <ProductDetailClient product={product} recommendedProducts={recommended} />
}
