"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import type { UnifiedProduct } from "@/lib/product-types"
import { Star, Heart, ShoppingCart, Truck, ShieldCheck, ArrowLeft } from "lucide-react"
import { useState } from "react"
import { useCart } from "@/lib/cart-context"
import { useFavorites } from "@/lib/favorites-context"
import { useToast } from "@/hooks/use-toast"
import { ProductCard } from "@/components/product-card"
import { useTranslation } from "@/lib/i18n/translation-provider"
import { useCurrency } from "@/lib/currency-context"
import { CartAnimation } from "@/components/cart-animation"

interface ProductDetailClientProps {
  product: UnifiedProduct
  recommendedProducts: UnifiedProduct[]
}

export default function ProductDetailClient({ product, recommendedProducts }: ProductDetailClientProps) {
  const { t } = useTranslation()
  const { formatPrice } = useCurrency()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [animationTrigger, setAnimationTrigger] = useState<{x: number, y: number} | false>(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const { addItem } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()
  const { toast } = useToast()

  const handleAddToCart = (e: React.MouseEvent) => {
    const clickPosition = { x: e.clientX, y: e.clientY }
    setAnimationTrigger(clickPosition)
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

  const allImages: string[] = []
  if (product.image && product.image.startsWith("http")) allImages.push(product.image)
  ;(product.images ?? []).forEach(img => { if (img && img.startsWith("http") && !allImages.includes(img)) allImages.push(img) })
  if (allImages.length === 0 && product.image) allImages.push(product.image)
  const displayImage = selectedImage || allImages[0] || "/placeholder.svg"

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 sm:mb-8 group hover:bg-blue-50 transition-all duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
          {t('Product Back')}
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Imágenes */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white shadow-2xl group p-4">
              <div className="absolute inset-4 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Image
                src={displayImage}
                alt={product.name}
                fill
                className="object-contain transition-all duration-300 rounded-2xl"
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={95}
                priority
              />
              <div className="absolute top-4 right-4">
                <div className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${product.inStock ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"}`}>
                  {product.inStock ? t('In stock') : t('Out of stock')}
                </div>
              </div>
            </div>
            {allImages.length > 1 && (
              <div className={`grid gap-2 ${allImages.length === 2 ? 'grid-cols-2' : allImages.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`relative aspect-square rounded-xl overflow-hidden bg-white border-2 transition-all duration-200 cursor-pointer ${displayImage === img ? "border-[#009FE3] ring-2 ring-[#009FE3]/30 scale-105" : "border-transparent hover:border-[#009FE3]/50"}`}
                  >
                    <Image src={img} alt={`${product.name} - ${i + 1}`} fill className="object-contain p-1" sizes="120px" />
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-[#009FE3] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">Principal</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6 lg:space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">{product.brand}</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                  ))}
                  <span className="ml-1 text-sm font-semibold text-gray-700">{product.rating}</span>
                  <span className="text-sm text-gray-500">({product.reviews} {t('reviews')})</span>
                </div>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">{product.name}</h1>
              <p className="text-gray-600 leading-relaxed text-lg">{product.description}</p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
              <span className="text-4xl lg:text-5xl font-bold text-gray-900">{formatPrice(product.price)}</span>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <label className="font-semibold text-gray-700">{t('Quantity:')}</label>
                  <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-10 w-10 rounded-l-xl hover:bg-gray-100" disabled={quantity <= 1}>-</Button>
                    <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                    <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)} className="h-10 w-10 rounded-r-xl hover:bg-gray-100">+</Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{t('Product Total:')}</p>
                  <p className="text-xl font-bold text-gray-900">{formatPrice(product.price * quantity)}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button size="lg" className="flex-1 h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] rounded-2xl" onClick={handleAddToCart} disabled={!product.inStock}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {product.inStock ? t('Product Add to Cart') : t('Product Out of stock')}
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-6 rounded-2xl hover:bg-red-50 hover:border-red-200 transition-all duration-300" onClick={handleToggleFavorite}>
                  <Heart className={`h-5 w-5 transition-colors duration-300 ${isFavorite(product.id) ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                </Button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-6">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center"><Truck className="h-5 w-5 text-white" /></div>
                <div><p className="font-semibold text-gray-900">{t('Free shipping')}</p><p className="text-sm text-gray-600">{t('On orders over $50')}</p></div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center"><ShieldCheck className="h-5 w-5 text-white" /></div>
                <div><p className="font-semibold text-gray-900">{t('Premium warranty')}</p><p className="text-sm text-gray-600">{t('2 years protection')}</p></div>
              </div>
            </div>
          </div>
        </div>

        {recommendedProducts.length > 0 && (
          <div className="mt-16 lg:mt-24 pt-8 lg:pt-12 border-t border-gray-200">
            <div className="mb-8 lg:mb-12 text-center">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">{t('Product You may also be interested')}</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">{t('Product Similar products')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {recommendedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      <CartAnimation product={product} trigger={animationTrigger} onComplete={() => setAnimationTrigger(false)} />
    </div>
  )
}
