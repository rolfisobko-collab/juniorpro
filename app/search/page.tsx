"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UnifiedProduct } from "@/lib/product-types"

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [filteredProducts, setFilteredProducts] = useState<UnifiedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("relevance")
  const [categoryFilter, setCategoryFilter] = useState("all")

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          ...(query && { search: query }),
          ...(categoryFilter && categoryFilter !== "all" && { category: categoryFilter }),
          ...(sortBy === "price-asc" && { sort: "price_asc" }),
          ...(sortBy === "price-desc" && { sort: "price_desc" }),
          ...(sortBy === "name" && { sort: "name" }),
        })
        
        const response = await fetch(`/api/products?${params}`)
        const data = await response.json()
        
        if (data.products) {
          // Convert API products to UnifiedProduct format
          const unifiedProducts: UnifiedProduct[] = data.products.map((product: any) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            description: product.description,
            brand: product.brand,
            rating: product.rating,
            reviews: product.reviews,
            inStock: product.inStock,
            featured: product.featured,
            categoryKey: product.categoryKey,
            category: product.category,
            ...(product.stockQuantity !== undefined && { stockQuantity: product.stockQuantity }),
            ...(product.createdAt && { createdAt: product.createdAt }),
            ...(product.updatedAt && { updatedAt: product.updatedAt }),
          }))
          
          setFilteredProducts(unifiedProducts)
        }
      } catch (error) {
        console.error("Error fetching search results:", error)
        setFilteredProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [query, sortBy, categoryFilter])

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Resultados de búsqueda</h1>
          {query && (
            <p className="text-muted-foreground">
              Buscando resultados para{" "}
              <span className="font-semibold text-foreground">"{query}"</span>
            </p>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="w-full md:w-[200px] h-10 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="w-full md:w-[200px] h-10 bg-gray-200 rounded-md animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 max-[325px]:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="aspect-[4/5] bg-gray-200 animate-pulse"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Resultados de búsqueda</h1>
        {query && (
          <p className="text-muted-foreground">
            Mostrando {filteredProducts.length} resultado{filteredProducts.length !== 1 ? "s" : ""} para{" "}
            <span className="font-semibold text-foreground">"{query}"</span>
          </p>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            <SelectItem value="electronics">Electrónica</SelectItem>
            <SelectItem value="appliances">Electrodomésticos</SelectItem>
            <SelectItem value="perfumes">Perfumes</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevancia</SelectItem>
            <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
            <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
            <SelectItem value="name">Nombre A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 max-[325px]:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No se encontraron resultados</h2>
          <p className="text-muted-foreground mb-6">
            Intenta con otros términos de búsqueda o explora nuestras categorías
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild variant="outline">
              <a href="/products?category=electronics">Electrónica</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/products?category=appliances">Electrodomésticos</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/products?category=perfumes">Perfumes</a>
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Cargando resultados...</div>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  )
}
