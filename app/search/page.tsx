import { prisma } from "@/lib/db"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import type { UnifiedProduct } from "@/lib/product-types"

async function getSearchResults(q: string): Promise<UnifiedProduct[]> {
  if (!q.trim()) return []
  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { brand: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      include: { category: { select: { key: true, name: true, slug: true, description: true } } },
      orderBy: [{ featured: "desc" }, { rating: "desc" }],
      take: 40,
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

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = "" } = await searchParams
  const products = await getSearchResults(q)

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Resultados de búsqueda</h1>
        {q && (
          <p className="text-muted-foreground">
            {products.length > 0
              ? <>Mostrando <strong>{products.length}</strong> resultado{products.length !== 1 ? "s" : ""} para <span className="font-semibold text-foreground">"{q}"</span></>
              : <>No se encontraron resultados para <span className="font-semibold text-foreground">"{q}"</span></>
            }
          </p>
        )}
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No se encontraron resultados</h2>
          <p className="text-muted-foreground mb-6">
            Intenta con otros términos o explorá nuestras categorías
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild variant="outline"><a href="/products?category=electronics">Electrónica</a></Button>
            <Button asChild variant="outline"><a href="/products?category=electrodomesticos">Electrodomésticos</a></Button>
          </div>
        </div>
      )}
    </main>
  )
}
