import { prisma } from "@/lib/db"
import { getMirrorProducts, isMirrorCatalogEnabled } from "@/lib/mirror-products"
import type { UnifiedProduct } from "@/lib/product-types"
import { curateFeaturedProducts, hasUsableProductImage } from "@/lib/featured-products"
import { getHomeSections, getProductsByIds, type HomeSectionConfig } from "@/lib/home-sections"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

type SectionKind = "premium" | "smartHome" | "gamingComputing"

function matchesSection(product: UnifiedProduct, kind?: SectionKind) {
  const price = Number(product.price) || 0
  if (price <= 0 || price > 10000) return false

  if (!kind || kind === "premium") return true
  const haystack = [
    product.name,
    product.brand,
    (product as any).categoryKey,
    (product as any).mirrorSubgroup,
    (product as any).mirrorGroup,
    product.description,
  ].join(" ").toLowerCase()

  if (kind === "smartHome") {
    return /robot|aspirador|tv |^tv|qled tv|oled tv|google tv|ar condicionado|cafeteira|airfryer/.test(haystack)
  }

  return /playstation|ps5|xbox|nintendo|game|macbook|notebook|^nb |ipad|tablet|rtx|msi|asus|lenovo/.test(haystack)
}

async function fetchSection(opts: { category?: string; featured?: boolean; sort: string; limit: number; kind?: SectionKind }) {
  try {
    if (isMirrorCatalogEnabled()) {
      const result = await getMirrorProducts({
        category: opts.category,
        sort: opts.featured || opts.kind ? "price_desc" : opts.sort,
        limit: opts.featured || opts.kind ? 120 : Math.max(opts.limit, 24),
        page: 1,
        includeTotal: false,
        requireImages: true,
      })
      const products = (result.products as unknown as UnifiedProduct[])
        .filter(hasUsableProductImage)
        .filter((product) => matchesSection(product, opts.kind))
      if (opts.featured || opts.kind === "premium") {
        return curateFeaturedProducts(products, opts.limit) as unknown as UnifiedProduct[]
      }
      return products.slice(0, opts.limit)
    }

    const where: any = { image: { startsWith: "http" } }
    if (opts.category) where.categoryKey = opts.category
    if (opts.featured) where.featured = true

    const orderBy: any[] =
      opts.featured ? [{ price: "desc" }] :
      opts.sort === "rating_desc" ? [{ rating: "desc" }, { featured: "desc" }] :
      opts.sort === "price_desc"  ? [{ price: "desc" }] :
      opts.sort === "latest"      ? [{ createdAt: "desc" }] :
                                    [{ featured: "desc" }, { rating: "desc" }]

    const rawProducts = await prisma.product.findMany({
      where,
      orderBy,
      take: opts.featured || opts.kind ? 250 : opts.limit,
      include: { category: { select: { key: true, name: true, slug: true, description: true } } },
    })

    const filtered = rawProducts
      .filter(hasUsableProductImage)
      .filter((product: any) => matchesSection(product, opts.kind))

    const products = opts.featured || opts.kind === "premium"
      ? curateFeaturedProducts(filtered, opts.limit)
      : filtered.slice(0, opts.limit)

    return products.map((p: any) => ({
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

const getBestSellers = () => fetchSection({ featured: true, sort: "rating_desc", limit: 15, kind: "premium" })

const getAppliances = () => fetchSection({ sort: "price_desc", limit: 15, kind: "smartHome" })

const getNewArrivals = () => fetchSection({ sort: "price_desc", limit: 15, kind: "gamingComputing" })

function money(value: unknown) {
  return `$ ${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function HomeSectionProductCard({ product, priority }: { product: UnifiedProduct; priority?: boolean }) {
  const categoryName = typeof product.category === "object" && product.category ? product.category.name : ""

  return (
    <Link href={`/products/${product.id}`} className="group block overflow-hidden rounded-2xl border border-gray-100/80 bg-white transition-all duration-300 hover:border-[#009FE3]/30 hover:shadow-[0_8px_30px_rgba(0,159,227,0.12)]">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-white p-3">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.06]"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
        />
      </div>
      <div className="space-y-1 p-3">
        <p className="truncate text-[10px] font-bold uppercase tracking-wider text-[#009FE3]">
          {product.brand || categoryName || "TechZone"}
        </p>
        <h3 className="line-clamp-3 min-h-[3.35rem] text-sm font-bold leading-tight text-gray-900">
          {product.name}
        </h3>
        <p className="text-base font-black text-gray-950">{money(product.price)}</p>
      </div>
    </Link>
  )
}

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
            <HomeSectionProductCard key={product.id} product={product} priority={i < 6} />
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

async function getSectionProducts(section: HomeSectionConfig) {
  if (section.mode === "manual" && section.productIds.length) {
    const manualProducts = await getProductsByIds(section.productIds)
    if (manualProducts.length) return manualProducts
  }

  if (section.id === "appliances") return getAppliances()
  if (section.id === "new-arrivals") return getNewArrivals()
  return getBestSellers()
}

export async function HomeBestSellers({ title }: { title: string }) {
  const products = await getBestSellers()
  return <Section title={title} eyebrow="Destacados" href="/products?featured=true" bg="gray" products={products} />
}

export async function HomeAppliances({ title }: { title: string }) {
  const products = await getAppliances()
  return <Section title={title} eyebrow="Categoría" href="/products?category=appliances" bg="white" products={products} />
}

export async function HomeNewArrivals({ title }: { title: string }) {
  const products = await getNewArrivals()
  return <Section title={title} eyebrow="Novedades" href="/products?sort=latest" bg="gray" products={products} />
}

export async function HomeProductSections({
  bestTitle,
  appliancesTitle,
  newTitle,
}: {
  bestTitle: string
  appliancesTitle: string
  newTitle: string
}) {
  let sections: HomeSectionConfig[] = []

  try {
    sections = await getHomeSections()
  } catch {
    sections = []
  }

  if (!sections.length) {
    const [bestSellers, appliances, newArrivals] = await Promise.all([
      getBestSellers(),
      getAppliances(),
      getNewArrivals(),
    ])

    return (
      <>
        <Section title={bestTitle} eyebrow="Destacados" href="/products?featured=true" bg="gray" products={bestSellers} />
        <Section title={appliancesTitle} eyebrow="Categoria" href="/products?category=appliances" bg="white" products={appliances} />
        <Section title={newTitle} eyebrow="Novedades" href="/products?sort=latest" bg="gray" products={newArrivals} />
      </>
    )
  }

  const resolved = await Promise.all(
    sections.map(async (section) => ({
      section,
      products: await getSectionProducts(section),
    })),
  )

  return (
    <>
      {resolved.map(({ section, products }) => (
        <Section
          key={section.id}
          title={section.title || bestTitle}
          eyebrow={section.eyebrow || "Destacados"}
          href={section.href || "/products"}
          bg={section.bg}
          products={products}
        />
      ))}
    </>
  )
}
