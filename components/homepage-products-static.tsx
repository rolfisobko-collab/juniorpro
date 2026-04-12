import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/db"
import { ProductCard } from "@/components/product-card"
import type { UnifiedProduct } from "@/lib/product-types"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

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

function Section({ title, eyebrow, href, bg = "white", products }: {
  title: string
  eyebrow: string
  href: string
  bg?: "white" | "gray"
  products: UnifiedProduct[]
}) {
  if (!products.length) return null
  return (
    <section className={`py-14 ${bg === "gray" ? "bg-[#f8f9fc]" : "bg-white"}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold text-[#009FE3] uppercase tracking-[0.2em] mb-1.5">{eyebrow}</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{title}</h2>
          </div>
          <Link href={href} className="hidden sm:flex items-center gap-1 text-sm text-gray-500 hover:text-[#009FE3] transition-colors font-medium">
            Ver todo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 6} />
          ))}
        </div>
        <div className="mt-6 sm:hidden text-center">
          <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#009FE3]">
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export async function HomeBestSellers({ title }: { title: string }) {
  const products = await getBestSellers()
  return <Section title={title} eyebrow="Destacados" href="/products?featured=true" bg="gray" products={products} />
}

export async function HomeAppliances({ title }: { title: string }) {
  const products = await getAppliances()
  return <Section title={title} eyebrow="Categoría" href="/products?category=electrodomesticos" bg="white" products={products} />
}

export async function HomeNewArrivals({ title }: { title: string }) {
  const products = await getNewArrivals()
  return <Section title={title} eyebrow="Novedades" href="/products?sort=latest" bg="gray" products={products} />
}
