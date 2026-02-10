"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import type { UnifiedProduct } from "@/lib/product-types"
import { Star, Heart, ShoppingCart, Truck, ShieldCheck, ArrowLeft } from "lucide-react"
import { use, useEffect, useState } from "react"
import { useCart } from "@/lib/cart-context"
import { useFavorites } from "@/lib/favorites-context"
import { useToast } from "@/hooks/use-toast"
import { ProductCard } from "@/components/product-card"
import { useTranslation } from "@/lib/i18n/translation-provider"
import { useCurrency } from "@/lib/currency-context"
import { CartAnimation } from "@/components/cart-animation"

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useTranslation()
  const { formatPrice } = useCurrency()
  const { id } = use(params)
  const router = useRouter()
  const [product, setProduct] = useState<UnifiedProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [recommendedProducts, setRecommendedProducts] = useState<UnifiedProduct[]>([])
  const [animationTrigger, setAnimationTrigger] = useState<{x: number, y: number} | false>(false)
  const { addItem } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()
  const { toast } = useToast()

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/products/${id}`, { method: "GET" })
        if (!res.ok) {
          throw new Error("Product not found")
        }

        const data = await res.json()
        const apiProduct = data.product

        // Convert API product to UnifiedProduct format
        const unifiedProduct: UnifiedProduct = {
          id: apiProduct.id,
          name: apiProduct.name,
          price: apiProduct.price,
          image: apiProduct.image,
          description: apiProduct.description,
          brand: apiProduct.brand,
          rating: apiProduct.rating,
          reviews: apiProduct.reviews,
          inStock: apiProduct.inStock,
          featured: apiProduct.featured,
          categoryKey: apiProduct.categoryKey,
          category: apiProduct.category,
          ...(apiProduct.stockQuantity !== undefined && { stockQuantity: apiProduct.stockQuantity }),
          ...(apiProduct.createdAt && { createdAt: apiProduct.createdAt }),
          ...(apiProduct.updatedAt && { updatedAt: apiProduct.updatedAt }),
        }

        if (!cancelled) {
          setProduct(unifiedProduct)

          // Load recommended products
          const recommendedRes = await fetch(`/api/products?limit=4&exclude=${id}`, { method: "GET" })
          if (recommendedRes.ok) {
            const recommendedData = await recommendedRes.json()
            const recommendedUnified = recommendedData.products.map((p: any) => ({
              id: p.id,
              name: p.name,
              price: p.price,
              image: p.image,
              description: p.description,
              brand: p.brand,
              rating: p.rating,
              reviews: p.reviews,
              inStock: p.inStock,
              featured: p.featured,
              categoryKey: p.categoryKey,
              category: p.category,
            }))
            setRecommendedProducts(recommendedUnified)
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load product:", err)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Skeleton Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted animate-pulse" />
          {/* Skeleton Info */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-10 w-3/4 bg-muted rounded animate-pulse" />
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-5 w-5 bg-muted rounded animate-pulse" />
                  ))}
                </div>
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
                <div className="h-4 w-4/6 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="border-t border-b border-border py-6 space-y-2">
              <div className="h-12 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-20 bg-muted rounded animate-pulse" />
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 bg-muted rounded animate-pulse" />
                  <div className="h-10 w-12 bg-muted rounded animate-pulse" />
                  <div className="h-10 w-10 bg-muted rounded animate-pulse" />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-12 flex-1 bg-muted rounded animate-pulse" />
                <div className="h-12 w-12 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="space-y-3 pt-6">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 bg-muted rounded animate-pulse" />
                <div className="h-4 w-48 bg-muted rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 bg-muted rounded animate-pulse" />
                <div className="h-4 w-44 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">{t('Product not found')}</h1>
        <Button onClick={() => router.push("/products")}>{t('Back to catalog')}</Button>
      </div>
    )
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    // Capturar posición exacta del click
    const clickPosition = {
      x: e.clientX,
      y: e.clientY
    }
    
    // Guardar posición en el estado para la animación
    setAnimationTrigger(clickPosition)
    
    // Agregar producto cuando la animación está avanzada
    setTimeout(() => {
      addItem(product, quantity)
      toast({
        title: t('Product Added to cart'),
        description: `${quantity}x ${product.name} ${t('added to cart')}`,
      })
    }, 600)
  }

  const handleToggleFavorite = () => {
    toggleFavorite(product)
    toast({
      title: isFavorite(product.id) ? t('Product removed from favorites') : t('Product added to favorites'),
      description: isFavorite(product.id)
        ? `${product.name} ${t('Product removed from favorites')}`
        : `${product.name} ${t('Product added to favorites')}`,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        {/* Botón de volver */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="mb-6 sm:mb-8 group hover:bg-blue-50 transition-all duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
          {t('Product Back')}
        </Button>

        {/* Grid principal del producto */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Sección de imágenes */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl group p-4">
              <div className="absolute inset-4 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Image 
                src={product.image || "/placeholder.svg"} 
                alt={product.name} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110 rounded-2xl" 
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={95}
                priority
              />
              {/* Badge de stock */}
              <div className="absolute top-4 right-4">
                <div className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                  product.inStock 
                    ? "bg-green-500/90 text-white" 
                    : "bg-red-500/90 text-white"
                }`}>
                  {product.inStock ? t('In stock') : t('Out of stock')}
                </div>
              </div>
            </div>
            
            {/* Miniaturas (opcional para futuro) */}
            {false && ( // Desactivado temporalmente hasta que el tipo tenga la propiedad images
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-transparent hover:border-blue-500 transition-all duration-300 cursor-pointer">
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sección de información */}
          <div className="space-y-6 lg:space-y-8">
            {/* Header del producto */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
                  {product.brand}
                </span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                  <span className="ml-1 text-sm font-semibold text-gray-700">{product.rating}</span>
                  <span className="text-sm text-gray-500">({product.reviews} {t('reviews')})</span>
                </div>
              </div>
              
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              
              <p className="text-gray-600 leading-relaxed text-lg">
                {product.description}
              </p>
            </div>

            {/* Precio */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl lg:text-5xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>

            {/* Controles de cantidad y botones */}
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <label className="font-semibold text-gray-700">{t('Quantity:')}</label>
                  <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-10 w-10 rounded-l-xl hover:bg-gray-100 transition-colors"
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-10 w-10 rounded-r-xl hover:bg-gray-100 transition-colors"
                    >
                      +
                    </Button>
                  </div>
                </div>
                
                {/* Precio total */}
                <div className="text-right">
                  <p className="text-sm text-gray-500">{t('Product Total:')}</p>
                  <p className="text-xl font-bold text-gray-900">{formatPrice(product.price * quantity)}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] rounded-2xl"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {product.inStock ? t('Product Add to Cart') : t('Product Out of stock')}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-14 px-6 rounded-2xl hover:bg-red-50 hover:border-red-200 transition-all duration-300" 
                  onClick={handleToggleFavorite}
                >
                  <Heart className={`h-5 w-5 transition-colors duration-300 ${
                    isFavorite(product.id) ? "fill-red-500 text-red-500" : "text-gray-600"
                  }`} />
                </Button>
              </div>
            </div>

            {/* Beneficios */}
            <div className="grid sm:grid-cols-2 gap-4 pt-6">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Truck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{t('Free shipping')}</p>
                  <p className="text-sm text-gray-600">{t('On orders over $50')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{t('Premium warranty')}</p>
                  <p className="text-sm text-gray-600">{t('2 years protection')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Recommended Products Section */}
        <div className="mt-16 lg:mt-24 pt-8 lg:pt-12 border-t border-gray-200">
          <div className="mb-8 lg:mb-12 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 lg:mb-4">
              {t('Product You may also be interested')}
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {t('Product Similar products')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {recommendedProducts.map((recommendedProduct) => (
              <ProductCard key={recommendedProduct.id} product={recommendedProduct} />
            ))}
            {recommendedProducts.length === 0 && (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 h-full bg-white rounded-3xl">
                    <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                      <div className="absolute inset-0 w-full h-full bg-gray-200 animate-pulse"></div>
                      <div className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                        <Heart className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="space-y-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium truncate">
                          {t('Brand')}
                        </p>
                        <h3 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-blue-500 transition-colors duration-200 min-h-[2.5rem] text-gray-800">
                          {t('Loading recommendations')}
                        </h3>
                      </div>
                      <div className="space-y-4 pt-2">
                        <div className="flex items-baseline gap-2">
                          <p className="text-xl font-bold text-gray-900">$XXX</p>
                          <p className="text-xs text-gray-500 line-through">$XXX</p>
                        </div>
                        <Button
                          size="sm"
                          className="w-full h-10 text-xs bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 font-medium rounded-xl"
                        >
                          {t('View product')}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Animación de producto volando al carrito */}
      <CartAnimation 
        product={product} 
        trigger={animationTrigger} 
        onComplete={() => setAnimationTrigger(false)} 
      />
    </div>
  )
}
