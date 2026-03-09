import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/db"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Search, Tag } from "lucide-react"
import Link from "next/link"
import type { UnifiedProduct } from "@/lib/product-types"

const getSearchResults = unstable_cache(
  async (q: string, brand?: string, category?: string): Promise<UnifiedProduct[]> => {
    const hasQ = q.trim().length > 0
    const hasBrand = brand && brand.trim().length > 0
    const hasCategory = category && category.trim().length > 0
    if (!hasQ && !hasBrand && !hasCategory) return []
    try {
      const where: any = {}
      if (hasBrand) where.brand = { equals: brand, mode: "insensitive" }
      if (hasCategory) where.categoryKey = category
      if (hasQ) {
        where.OR = [
          { name: { contains: q, mode: "insensitive" } },
          { brand: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ]
      }
      const products = await prisma.product.findMany({
        where,
        include: { category: { select: { key: true, name: true, slug: true, description: true } } },
        orderBy: [{ featured: "desc" }, { rating: "desc" }],
        take: 80,
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
  },
  ["search-results"],
  { revalidate: 120, tags: ["products"] }
)

const getActiveBrands = unstable_cache(
  async () => prisma.brand.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true, slug: true, image: true } }),
  ["brands-search-filter"],
  { revalidate: 300, tags: ["brands"] }
)

const getActiveCategories = unstable_cache(
  async () => prisma.category.findMany({ orderBy: { name: "asc" }, select: { key: true, name: true } }),
  ["categories-search-filter"],
  { revalidate: 300, tags: ["categories"] }
)

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; brand?: string; category?: string }>
}) {
  const { q = "", brand = "", category = "" } = await searchParams
  const [products, brands, categories] = await Promise.all([
    getSearchResults(q, brand, category),
    getActiveBrands(),
    getActiveCategories(),
  ])

  const titleParts = []
  if (q) titleParts.push(`"${q}"`)
  if (brand) titleParts.push(`marca: ${brand}`)
  if (category) titleParts.push(`categoría: ${category}`)
  const searchTitle = titleParts.join(" · ")

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {searchTitle ? `Resultados para ${searchTitle}` : "Búsqueda"}
        </h1>
        {(q || brand || category) && (
          <p className="text-muted-foreground">
            {products.length > 0
              ? <><strong>{products.length}</strong> producto{products.length !== 1 ? "s" : ""} encontrado{products.length !== 1 ? "s" : ""}</>
              : "No se encontraron resultados"}
          </p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar filtros */}
        <aside className="w-full lg:w-60 flex-shrink-0 space-y-5">
          {/* Filtro categorías */}
          {categories.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4" /> Categorías
              </h3>
              <div className="flex flex-wrap lg:flex-col gap-2">
                <Link
                  href={`/search?${new URLSearchParams({ ...(q ? { q } : {}), ...(brand ? { brand } : {}) }).toString()}`}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${!category ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}
                >
                  Todas
                </Link>
                {categories.map(cat => (
                  <Link
                    key={cat.key}
                    href={`/search?${new URLSearchParams({ ...(q ? { q } : {}), ...(brand ? { brand } : {}), category: cat.key }).toString()}`}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${category === cat.key ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Filtro marcas */}
          {brands.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                <Search className="h-4 w-4" /> Marcas
              </h3>
              <div className="flex flex-wrap lg:flex-col gap-2 max-h-72 lg:max-h-none overflow-y-auto">
                <Link
                  href={`/search?${new URLSearchParams({ ...(q ? { q } : {}), ...(category ? { category } : {}) }).toString()}`}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${!brand ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}
                >
                  Todas
                </Link>
                {brands.map(b => (
                  <Link
                    key={b.id}
                    href={`/search?${new URLSearchParams({ ...(q ? { q } : {}), ...(category ? { category } : {}), brand: b.name }).toString()}`}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${brand === b.name ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}
                  >
                    {b.image && (
                      <img src={b.image} alt={b.name} className="h-4 w-4 object-contain rounded-sm flex-shrink-0" />
                    )}
                    {b.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {(q || brand || category) && (
            <Link href="/search" className="text-xs text-muted-foreground hover:text-foreground underline block">
              Limpiar filtros
            </Link>
          )}
        </aside>

        {/* Resultados */}
        <div className="flex-1">
          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No se encontraron resultados</h2>
              <p className="text-muted-foreground mb-6">
                Intentá con otros términos o explorá nuestras categorías
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button asChild variant="outline"><Link href="/products?category=electronics">Electrónica</Link></Button>
                <Button asChild variant="outline"><Link href="/products?category=electrodomesticos">Electrodomésticos</Link></Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
