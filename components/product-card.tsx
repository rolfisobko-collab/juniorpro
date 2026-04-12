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
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
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
      <div className="group relative bg-white rounded-2xl border border-gray-100/80 hover:border-[#009FE3]/30 hover:shadow-[0_8px_30px_rgba(0,159,227,0.12)] transition-all duration-300 overflow-hidden cursor-pointer">

        {/* Imagen */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-white">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="absolute inset-3 w-[calc(100%-1.5rem)] h-[calc(100%-1.5rem)] object-contain transition-transform duration-500 group-hover:scale-[1.07]"
            fallback="/placeholder.svg"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
          />

          {/* Favorito */}
          <button
            onClick={handleToggleFavorite}
            className={`absolute top-2 right-2 h-7 w-7 rounded-full shadow-md border flex items-center justify-center transition-all duration-200 hover:scale-110 z-10
              ${isFavorite(product.id)
                ? "bg-red-50 border-red-200 opacity-100"
                : "bg-white border-gray-100 opacity-0 group-hover:opacity-100"}`}
          >
            <Heart className={`h-3.5 w-3.5 ${isFavorite(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
          </button>

          {/* Badge destacado */}
          {product.featured && (
            <div className="absolute top-2 left-2 z-10">
              <span className="text-[10px] font-bold bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-md">TOP</span>
            </div>
          )}

          {/* Agotado overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] flex items-center justify-center z-20">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] bg-white/90 px-3 py-1 rounded-full border border-gray-200">Agotado</span>
            </div>
          )}

        </div>

        {/* Botón add to cart — aparece en hover, FUERA del overflow-hidden */}
        {product.inStock && (
          <div className="absolute bottom-[4.5rem] left-0 right-0 flex justify-center transition-all duration-200 z-20 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-1.5 bg-[#009FE3] hover:bg-[#0088c7] text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg shadow-[#009FE3]/30 transition-colors"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Agregar
            </button>
          </div>
        )}

        {/* Info */}
        <div className="p-3 pt-2.5">
          {product.brand && (
            <p className="text-[10px] text-[#009FE3] font-bold uppercase tracking-wider mb-0.5 truncate">{product.brand}</p>
          )}
          <h3 className="text-[13px] font-semibold text-gray-800 line-clamp-2 leading-snug mb-2.5 min-h-[2.4em]">
            {product.name}
          </h3>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[15px] font-bold text-gray-900 leading-none">{formatPrice(product.price)}</p>
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="h-7 w-7 rounded-lg bg-[#009FE3] hover:bg-[#0088c7] text-white flex items-center justify-center transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 shadow-sm md:hidden"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
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
