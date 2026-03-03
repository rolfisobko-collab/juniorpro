import { ProductCard } from "@/components/product-card"
import { prisma } from "@/lib/db"
import type { UnifiedProduct } from "@/lib/product-types"

interface HomepageProductsServerProps {
  title: string
  limit?: number
  featured?: boolean
  category?: string
  hasImage?: boolean
  sortOverride?: string
}

async function getProducts(params: HomepageProductsServerProps): Promise<UnifiedProduct[]> {
  const { limit = 10, featured = false, category, hasImage = true, sortOverride } = params

  const where: any = {}
  if (category && category !== "all") where.categoryKey = category
  if (hasImage) where.image = { startsWith: "http" }
  if (featured) where.featured = true

  const sort = sortOverride ?? (featured ? "featured" : "latest")
  let orderBy: any[] = [{ featured: "desc" }, { name: "asc" }]
  if (sort === "price_desc") orderBy = [{ price: "desc" }]
  else if (sort === "price_asc") orderBy = [{ price: "asc" }]
  else if (sort === "rating_desc") orderBy = [{ rating: "desc" }]
  else if (sort === "latest") orderBy = [{ createdAt: "desc" }]

  try {
    const products = await prisma.product.findMany({
      where,
      orderBy,
      take: limit,
      select: {
        id: true,
        name: true,
        price: true,
        image: true,
        description: true,
        brand: true,
        rating: true,
        reviews: true,
        inStock: true,
        featured: true,
        categoryKey: true,
        stockQuantity: true,
        createdAt: true,
        updatedAt: true,
        category: { select: { key: true, name: true, slug: true, description: true } },
      },
    })
    return products.map((p) => ({
      ...p,
      stockQuantity: p.stockQuantity ?? 0,
      createdAt: p.createdAt?.toISOString(),
      updatedAt: p.updatedAt?.toISOString(),
    })) as unknown as UnifiedProduct[]
  } catch {
    return []
  }
}

export default async function HomepageProductsServer(props: HomepageProductsServerProps) {
  const { title, limit = 10 } = props
  const products = await getProducts(props)

  if (products.length === 0) return null

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-serif text-3xl md:text-4xl font-bold mb-8">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
