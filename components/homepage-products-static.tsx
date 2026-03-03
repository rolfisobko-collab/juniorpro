import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/db"
import { ProductCard } from "@/components/product-card"
import type { UnifiedProduct } from "@/lib/product-types"

async function fetchSection(opts: { category?: string; featured?: boolean; sort: string; limit: number }) {
  try {
    const where: any = { image: { startsWith: "http" } }
    if (opts.category) where.categoryKey = opts.category
    if (opts.featured) where.featured = true

    const orderBy: any[] =
      opts.sort === "rating_desc" ? [{ rating: "desc" }, { featured: "desc" }] :
      opts.sort === "price_desc"  ? [{ price: "desc" }] :
      opts.sort === "latest"      ? [{ createdAt: "desc" }] :
                                    [{ featured: "desc" }, { rating: "desc" }]

    const products = await prisma.product.findMany({
      where,
      orderBy,
      take: opts.limit,
      include: { category: { select: { key: true, name: true, slug: true, description: true } } },
    })

    return products.map(p => ({
      ...p,
      images: [],
      stockQuantity: p.stockQuantity ?? 0,
      createdAt: p.createdAt?.toISOString(),
      updatedAt: p.updatedAt?.toISOString(),
    })) as unknown as UnifiedProduct[]
  } catch {
    return []
  }
}

const getBestSellers = unstable_cache(
  () => fetchSection({ featured: true, sort: "rating_desc", limit: 10 }),
  ["home-best-sellers"], { revalidate: 300, tags: ["products"] }
)

const getAppliances = unstable_cache(
  () => fetchSection({ category: "electrodomesticos", sort: "price_desc", limit: 10 }),
  ["home-appliances"], { revalidate: 300, tags: ["products"] }
)

const getNewArrivals = unstable_cache(
  () => fetchSection({ sort: "latest", limit: 10 }),
  ["home-new-arrivals"], { revalidate: 300, tags: ["products"] }
)

function Section({ title, products }: { title: string; products: UnifiedProduct[] }) {
  if (!products.length) return null
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

export async function HomeBestSellers({ title }: { title: string }) {
  const products = await getBestSellers()
  return <Section title={title} products={products} />
}

export async function HomeAppliances({ title }: { title: string }) {
  const products = await getAppliances()
  return <Section title={title} products={products} />
}

export async function HomeNewArrivals({ title }: { title: string }) {
  const products = await getNewArrivals()
  return <Section title={title} products={products} />
}
