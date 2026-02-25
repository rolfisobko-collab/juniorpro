"use client"

import type React from "react"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart, Star, Zap, Shield, Truck } from "lucide-react"
import { Image } from "@/components/ui/image"
import type { UnifiedProduct } from "@/lib/product-types"
import { useCart } from "@/lib/cart-context"
import { useFavorites } from "@/lib/favorites-context"
import { useCurrency } from "@/lib/currency-context"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/lib/i18n/translation-provider"
import { CartAnimation } from "@/components/cart-animation"
import { useState } from "react"

interface ProductCardProps {
  product: UnifiedProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation()
  const { addItem } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()
  const { formatPrice } = useCurrency()
  const { toast } = useToast()
  const [animationTrigger, setAnimationTrigger] = useState<{x: number, y: number} | false>(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // Capturar posición exacta del click
    const clickPosition = {
      x: e.clientX,
      y: e.clientY
    }
    
    // Guardar posición en el estado para la animación
    setAnimationTrigger(clickPosition)
    
    // Agregar producto cuando la animación está avanzada
    setTimeout(() => {
      addItem(product)
    }, 600) // Agregar producto cuando la animación está a 60% del camino
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    toggleFavorite(product)
    toast({
      title: isFavorite(product.id) ? "Eliminado de favoritos" : "Agregado a favoritos",
      description: isFavorite(product.id)
        ? `${product.name} ha sido eliminado de tus favoritos`
        : `${product.name} ha sido agregado a tus favoritos`,
    })
  }

  return (
    <Link href={`/products/${product.id}`}>
      <div className="group relative bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md hover:shadow-blue-100/50 transition-all duration-300 overflow-hidden">

        {/* Imagen */}
        <div className="relative aspect-square overflow-hidden bg-white border-b border-gray-100">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] object-contain transition-transform duration-500 group-hover:scale-105"
            fallback="/placeholder.svg"
            loading="lazy"
          />

          {/* Logo marca */}
          <div className="absolute -top-1 left-1 z-10">
            <img src="/logo-optimized.png" alt="logo" className="w-14 h-14 object-contain opacity-80" />
          </div>

          {/* Favorito */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110"
          >
            <Heart className={`h-4 w-4 ${isFavorite(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
          </button>

          {/* Agotado */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Agotado</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          {product.brand && (
            <p className="text-xs text-[#009FE3] font-semibold uppercase tracking-wide mb-0.5 truncate">{product.brand}</p>
          )}
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-2">
            {product.name}
          </h3>
          <div className="flex items-center justify-between gap-2">
            <p className="text-base font-bold text-gray-900">{formatPrice(product.price)}</p>
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="h-8 w-8 rounded-full bg-[#009FE3] hover:bg-[#007BB8] text-white flex items-center justify-center transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <CartAnimation
        product={product}
        trigger={animationTrigger}
        onComplete={() => setAnimationTrigger(false)}
      />
    </Link>
  )
}
