"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import type { UnifiedProduct } from "@/lib/product-types"
import { Star, Heart, ShoppingCart, Truck, ShieldCheck, ArrowLeft, Minus, Plus, Package, RefreshCcw, BadgeCheck, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"
import { useFavorites } from "@/lib/favorites-context"
import { useToast } from "@/hooks/use-toast"
import { ProductCard } from "@/components/product-card"
import { useTranslation } from "@/lib/i18n/translation-provider"
import { useCurrency } from "@/lib/currency-context"
import { CartAnimation } from "@/components/cart-animation"
import Link from "next/link"
import { LoginToRateModal } from "@/components/login-to-rate-modal"

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
  const { user } = useAuth()
  const [ratingAvg, setRatingAvg] = useState(0)
  const [ratingCount, setRatingCount] = useState(0)
  const [myRating, setMyRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [savingRating, setSavingRating] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    fetch(`/api/products/${product.id}/reviews`)
      .then(r => r.json())
      .then(d => {
        setRatingAvg(d.avg || 0)
        setRatingCount(d.total || 0)
        if (user && d.reviews) {
          const mine = d.reviews.find((r: any) => r.user.id === user.id)
          if (mine) setMyRating(mine.rating)
        }
      })
      .catch(() => {})
  }, [product.id, user])

  const handleStarClick = async (star: number) => {
    if (!user) { setShowLoginModal(true); return }
    if (savingRating) return
    setSavingRating(true)
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: star }),
        credentials: "include",
      })
      if (res.ok) {
        setMyRating(star)
        const updated = await fetch(`/api/products/${product.id}/reviews`).then(r => r.json())
        setRatingAvg(updated.avg || 0)
        setRatingCount(updated.total || 0)
      }
    } finally {
      setSavingRating(false)
    }
  }
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

  const ratingFull = Math.floor(ratingAvg)

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1.5 h-10 text-xs text-gray-400">
            <Link href="/" className="hover:text-[#009FE3] transition-colors">{t('Home')}</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/products" className="hover:text-[#009FE3] transition-colors">{t('Products')}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-600 truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-start">

          {/* Columna imágenes */}
          <div className="space-y-3">
            {/* Imagen principal */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white shadow-[0_2px_24px_rgba(0,0,0,0.07)] group">
              <Image
                src={displayImage}
                alt={product.name}
                fill
                className="object-contain p-6 transition-transform duration-500 group-hover:scale-[1.04]"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                unoptimized={displayImage.startsWith("http")}
              />
              {/* Badge stock */}
              <div className="absolute top-4 left-4">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${product.inStock ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                  {product.inStock ? `● ${t('In stock')}` : `● ${t('Out of stock')}`}
                </span>
              </div>
              {/* Favorito */}
              <button
                onClick={handleToggleFavorite}
                className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center hover:scale-110 transition-all"
              >
                <Heart className={`h-4 w-4 ${isFavorite(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
              </button>
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className={`grid gap-2 ${allImages.length <= 4 ? `grid-cols-${allImages.length}` : "grid-cols-4"}`}>
                {allImages.slice(0, 4).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`relative aspect-square rounded-xl overflow-hidden bg-white border-2 transition-all duration-200 ${displayImage === img ? "border-[#009FE3] shadow-md shadow-[#009FE3]/20" : "border-transparent hover:border-gray-300"}`}
                  >
                    <Image src={img} alt={`${product.name} - ${i + 1}`} fill className="object-contain p-2" sizes="100px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Columna info */}
          <div className="space-y-6">
            {/* Brand + rating */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs font-bold text-[#009FE3] bg-[#009FE3]/8 px-3 py-1.5 rounded-full uppercase tracking-wider">{product.brand}</span>
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((star) => {
                    const active = hoverRating || myRating || ratingAvg
                    const filled = star <= active
                    return (
                      <button
                        key={star}
                        type="button"
                        disabled={savingRating}
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        title={user ? `Puntuar ${star} estrella${star > 1 ? 's' : ''}` : 'Iniciá sesión para puntuar'}
                        className="cursor-pointer hover:scale-110 transition-transform"
                      >
                        <Star className={`h-3.5 w-3.5 transition-colors ${
                          filled
                            ? (hoverRating && star <= hoverRating ? "fill-amber-300 text-amber-300" : "fill-amber-400 text-amber-400")
                            : "text-gray-200"
                        }`} />
                      </button>
                    )
                  })}
                </div>
                {ratingCount > 0 ? (
                  <span className="text-sm text-gray-400">({ratingCount})</span>
                ) : (
                  <span className="text-xs text-gray-300">{user ? 'Sé el primero' : ''}</span>
                )}
              </div>
            </div>

            {/* Nombre */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight tracking-tight">{product.name}</h1>

            {/* Descripción */}
            <p className="text-gray-500 leading-relaxed text-[15px]">{product.description}</p>

            {/* Precio */}
            <div className="flex items-end gap-3 py-4 border-y border-gray-100">
              <span className="text-4xl lg:text-5xl font-black text-gray-900 leading-none">{formatPrice(product.price)}</span>
              {quantity > 1 && (
                <div className="mb-1">
                  <p className="text-xs text-gray-400">Total</p>
                  <p className="text-lg font-bold text-[#009FE3]">{formatPrice(product.price * quantity)}</p>
                </div>
              )}
            </div>

            {/* Cantidad + CTA */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-600 w-20">{t('Quantity')}</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}
                    className="h-10 w-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}
                    className="h-10 w-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 h-13 py-3.5 bg-[#009FE3] hover:bg-[#0088c7] disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-[#009FE3]/25 hover:shadow-[#009FE3]/40 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {product.inStock ? t('Add to cart') : t('Out of stock')}
                </button>
                <button
                  onClick={handleToggleFavorite}
                  className="h-13 py-3.5 px-4 rounded-2xl border-2 border-gray-200 hover:border-red-200 hover:bg-red-50 transition-all duration-200 flex items-center justify-center"
                >
                  <Heart className={`h-5 w-5 transition-colors ${isFavorite(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { icon: Truck, label: t('Fast Delivery'), sub: t('Same day shipping'), color: "text-blue-500", bg: "bg-blue-50" },
                { icon: ShieldCheck, label: t('Official Warranty'), sub: t('Up to 30 days'), color: "text-emerald-500", bg: "bg-emerald-50" },
                { icon: BadgeCheck, label: t('Buyer Protection'), sub: "100% auténtico", color: "text-violet-500", bg: "bg-violet-50" },
                { icon: RefreshCcw, label: t('Returns'), sub: "7 días sin costo", color: "text-orange-500", bg: "bg-orange-50" },
              ].map(({ icon: Icon, label, sub, color, bg }) => (
                <div key={label} className={`flex items-center gap-2.5 p-3 ${bg} rounded-xl`}>
                  <div className={`h-8 w-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">{label}</p>
                    <p className="text-[11px] text-gray-500">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Productos recomendados */}
        {recommendedProducts.length > 0 && (
          <div className="mt-16 lg:mt-20">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-[#009FE3] uppercase tracking-widest mb-1">{t('Product You may also be interested')}</p>
                <h2 className="text-2xl font-bold text-gray-900">{t('Recommended')}</h2>
              </div>
              <Link href="/products" className="text-sm text-[#009FE3] hover:underline font-medium flex items-center gap-1">
                {t('View more')} <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {recommendedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      <LoginToRateModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <CartAnimation product={product} trigger={animationTrigger} onComplete={() => setAnimationTrigger(false)} />
    </div>
  )
}
