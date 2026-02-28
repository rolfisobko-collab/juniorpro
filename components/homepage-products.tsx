"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/product-card"
import type { UnifiedProduct } from "@/lib/product-types"

interface HomepageProductsProps {
  title: string
  limit?: number
  featured?: boolean
  category?: string
  hasImage?: boolean
  sortOverride?: string
}

export default function HomepageProducts({ 
  title, 
  limit = 5, 
  featured = false,
  category,
  hasImage = true,
  sortOverride,
}: HomepageProductsProps) {
  const [products, setProducts] = useState<UnifiedProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          limit: limit.toString(),
          sort: sortOverride ?? (featured ? "featured" : "latest"),
          ...(category && category !== "all" && { category }),
          ...(hasImage && { hasImage: "true" }),
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
          
          setProducts(unifiedProducts)
        }
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [limit, featured, category])

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-8">{title}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="bg-accent animate-pulse rounded-md h-64 w-full" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return null
  }

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
