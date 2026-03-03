import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import type { UnifiedProduct } from "@/lib/product-types"
import ProductDetailClient from "./product-detail-client"

async function getProduct(id: string): Promise<UnifiedProduct | null> {
  try {
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
}

async function getRecommended(id: string, categoryKey: string): Promise<UnifiedProduct[]> {
  try {
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
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) notFound()

  const recommended = await getRecommended(id, (product as any).categoryKey ?? "")

  return <ProductDetailClient product={product} recommendedProducts={recommended} />
}
