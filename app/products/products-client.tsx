"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
  const [sortBy, setSortBy] = useState(initialSubcategory === "videojuegos" ? "price_desc" : "featured")
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [newProductIds, setNewProductIds] = useState<Set<string>>(new Set())
  const animatingRef = useRef<Set<string>>(new Set())

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
          const incoming: ProductWithCategory[] = data.products
          const ids = new Set<string>(incoming.map((p: ProductWithCategory) => p.id))
          animatingRef.current = ids
          setNewProductIds(ids)
          setProducts(prev => [...prev, ...incoming])
          // Clear animation classes after they finish
          setTimeout(() => {
            animatingRef.current = new Set()
            setNewProductIds(new Set())
          }, 800)
        } else {
          setProducts(data.products)
          setNewProductIds(new Set())
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

  const activeCategory = categories.find((c: any) => c.key === selectedCategory)
  const subcategories: any[] = selectedCategory !== "all" && activeCategory?.subcategories?.length
    ? activeCategory.subcategories
    : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#009FE3] uppercase tracking-widest mb-1">Tienda</p>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900">Catálogo de Productos</h1>
              <p className="text-gray-500 mt-1 text-sm">
                {selectedCategory === "all" ? "Todos los productos" : activeCategory?.name}
                {selectedSubcategory && ` · ${subcategories.find((s: any) => s.slug === selectedSubcategory)?.name || selectedSubcategory}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-gray-400" />
              <Select value={sortBy} onValueChange={setSortBy} disabled={loading}>
                <SelectTrigger className="w-[190px] bg-white border-gray-200 text-sm">
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
        </div>

        {/* Categorías */}
        <div className="container mx-auto px-4 pb-0">
          <div className="flex items-center gap-2 overflow-x-auto pb-0 scrollbar-hide">
            <button
              onClick={() => { setSelectedCategory("all"); setSelectedSubcategory("") }}
              disabled={loading}
              className={`flex-shrink-0 px-4 py-2.5 rounded-t-xl text-sm font-semibold transition-all duration-200 border-b-2 ${
                selectedCategory === "all"
                  ? "border-[#009FE3] text-[#009FE3] bg-blue-50"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              Todos
            </button>
            {categories.map((category: any) => (
              <button
                key={category.key}
                onClick={() => { setSelectedCategory(category.key); setSelectedSubcategory("") }}
                disabled={loading}
                className={`flex-shrink-0 px-4 py-2.5 rounded-t-xl text-sm font-semibold transition-all duration-200 border-b-2 ${
                  selectedCategory === category.key
                    ? "border-[#009FE3] text-[#009FE3] bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Subcategorías */}
      {subcategories.length > 0 && (
        <div className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setSelectedSubcategory("")}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  selectedSubcategory === ""
                    ? "bg-[#009FE3] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Todo
              </button>
              {subcategories.map((sub: any) => (
                <button
                  key={sub.slug}
                  onClick={() => setSelectedSubcategory(sub.slug === selectedSubcategory ? "" : sub.slug)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    selectedSubcategory === sub.slug
                      ? "bg-[#009FE3] text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Productos */}
      <div className="container mx-auto px-4 py-8">
        {/* Initial full-page skeleton (first load / filter change) */}
        {loading && products.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white animate-pulse rounded-3xl h-80 w-full shadow-sm" />
            ))}
          </div>
        )}

        {products.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-2">
              {products.map((product) => {
                const isNew = newProductIds.has(product.id)
                const batchIndex = isNew ? Array.from(newProductIds).indexOf(product.id) : 0
                return (
                  <div
                    key={product.id}
                    className={isNew ? "animate-fade-up" : ""}
                    style={isNew ? { animationDelay: `${Math.min(batchIndex, 15) * 55}ms`, animationFillMode: "both" } : {}}
                  >
                    <ProductCard product={product} />
                  </div>
                )
              })}

              {/* Inline skeleton cards at the bottom while loading more */}
              {loading && hasMore && [...Array(4)].map((_, i) => (
                <div
                  key={`skel-${i}`}
                  className="animate-fade-up bg-white rounded-3xl overflow-hidden shadow-sm"
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
                >
                  <div className="animate-pulse">
                    <div className="bg-gray-100 h-52 w-full" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-gray-100 rounded-full w-3/4" />
                      <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                      <div className="h-5 bg-gray-200 rounded-full w-1/3 mt-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SlidersHorizontal className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-700 font-semibold text-lg mb-1">Sin resultados</p>
            <p className="text-gray-400 text-sm">No encontramos productos con ese filtro.</p>
          </div>
        )}
      </div>
    </div>
  )
}
