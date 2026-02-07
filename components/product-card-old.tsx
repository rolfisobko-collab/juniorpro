"use client"

import type React from "react"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart, Star } from "lucide-react"
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
      <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-gray-100">
        {/* Imagen con overlay */}
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
            style={{ objectPosition: 'top center' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
            loading="lazy"
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Botón de favoritos */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/90 backdrop-blur-md shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white z-20 flex items-center justify-center"
          >
            <Heart className={`h-5 w-5 transition-all duration-300 ${isFavorite(product.id) ? "fill-current text-red-500 scale-110" : "text-gray-600 hover:text-red-500"}`} />
          </button>
          
          {/* Badge de stock */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30">
              <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl">
                <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">Agotado</span>
              </div>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
          {/* Brand y nombre */}
          <div className="space-y-1 sm:space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold truncate">
              {product.brand}
            </p>
            <h3 className="font-bold text-sm sm:text-base leading-snug text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
              {product.name}
            </h3>
          </div>

          {/* Precio y acciones */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </p>
              
              {/* Indicador de peso para envío */}
              {product.weight && (
                <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                  {product.weight}kg
                </div>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{t('Add')}</span>
            </button>
          </div>
        </div>

        {/* Efecto de brillo en hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
      </div>
      
      {/* Animación de producto volando al carrito */}
      <CartAnimation 
        product={product} 
        trigger={animationTrigger} 
        onComplete={() => setAnimationTrigger(false)} 
      />
    </Link>
  )
}
