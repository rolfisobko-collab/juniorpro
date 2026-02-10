"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SlidersHorizontal } from "lucide-react"
import type { ProductWithCategory } from "@/lib/products-db"

interface ProductsClientProps {
  initialProducts: ProductWithCategory[]
  categories: any[]
  initialCategory?: string
  initialSubcategory?: string
}

export default function ProductsClient({ 
  initialProducts, 
  categories, 
  initialCategory,
  initialSubcategory
}: ProductsClientProps) {
  const [products, setProducts] = useState<ProductWithCategory[]>(initialProducts)
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || "all")
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(initialSubcategory || "")
  const [sortBy, setSortBy] = useState("featured")
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    console.log('Initial params:', { initialCategory, initialSubcategory })
    if (initialCategory) {
      console.log('Setting initial category:', initialCategory)
      setSelectedCategory(initialCategory)
    }
    if (initialSubcategory) {
      console.log('Setting initial subcategory:', initialSubcategory)
      setSelectedSubcategory(initialSubcategory)
    }
  }, [initialCategory, initialSubcategory])

  const fetchProducts = async (category: string, subcategory: string, sort: string, pageNum: number = 1, append: boolean = false) => {
    console.log('Fetching products:', { category, subcategory, sort, pageNum })
    setLoading(true)
    try {
      const params = new URLSearchParams({
        ...(category !== "all" && { category }),
        ...(subcategory && { subcategory }),
        ...(sort && { sort }),
        limit: "50",
        page: pageNum.toString()
      })
      
      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()
      
      if (data.products) {
        if (append) {
          setProducts(prev => [...prev, ...data.products])
        } else {
          setProducts(data.products)
        }
        setHasMore(data.products.length === 50)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('Current state:', { selectedCategory, selectedSubcategory, sortBy })
    setPage(1)
    setHasMore(true)
    fetchProducts(selectedCategory, selectedSubcategory, sortBy, 1, false)
  }, [selectedCategory, selectedSubcategory, sortBy])

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchProducts(selectedCategory, selectedSubcategory, sortBy, nextPage, true)
    }
  }

  // Detectar scroll para carga automática
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadMore()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loading, hasMore, page, selectedCategory, selectedSubcategory, sortBy])

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="mb-8">
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Catálogo de Productos</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => setSelectedCategory("all")}
            size="sm"
            disabled={loading}
          >
            Todos
          </Button>
          {categories.map((category) => (
            <Button
              key={category.key}
              variant={selectedCategory === category.key ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.key)}
              size="sm"
              disabled={loading}
            >
              {category.name}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={setSortBy} disabled={loading}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Destacados</SelectItem>
              <SelectItem value="price_asc">Precio: Menor a Mayor</SelectItem>
              <SelectItem value="price_desc">Precio: Mayor a Menor</SelectItem>
              <SelectItem value="rating_desc">Mejor Valorados</SelectItem>
              <SelectItem value="latest">Más Recientes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 max-[325px]:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-accent animate-pulse rounded-md h-64 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 max-[325px]:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {hasMore && (
            <div className="flex justify-center pb-8">
              <Button 
                onClick={loadMore}
                disabled={loading}
                variant="outline"
                className="min-w-[200px]"
              >
                {loading ? 'Cargando...' : 'Cargar más productos'}
              </Button>
            </div>
          )}
        </>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No se encontraron productos en esta categoría</p>
        </div>
      )}
    </div>
  )
}
