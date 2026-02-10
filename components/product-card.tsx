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
      <div className="group relative bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden border border-gray-100/50 backdrop-blur-sm p-4">
        {/* Logo TechZone en la esquina */}
        <div className="absolute top-3 left-3 z-20 bg-white/90 backdrop-blur-md rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
          <img 
            src="/logo-optimized.png" 
            alt="TechZone" 
            className="w-6 h-6 object-contain"
          />
        </div>

        {/* Badge de características */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
          {product.featured && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <Zap className="w-3 h-3" />
              HOT
            </div>
          )}
        </div>

        {/* Imagen con efectos mejorados */}
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
          
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
            style={{ objectPosition: 'top center' }}
            fallback="/placeholder.svg"
            loading="lazy"
          />
          
          {/* Efecto de brillo */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none z-10" />
          
          {/* Botón de favoritos mejorado */}
          <button
            onClick={handleToggleFavorite}
            className="absolute bottom-4 right-4 h-12 w-12 rounded-full bg-white/95 backdrop-blur-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white z-20 flex items-center justify-center border border-gray-100"
          >
            <Heart className={`h-5 w-5 transition-all duration-300 ${isFavorite(product.id) ? "fill-current text-red-500 scale-110" : "text-gray-600 hover:text-red-500"}`} />
          </button>
          
          {/* Badge de agotado */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-30">
              <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border border-gray-200">
                <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">Agotado</span>
              </div>
            </div>
          )}

          {/* Indicador de descuento */}
          {product.rating && product.rating > 4.5 && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-20">
              BEST
            </div>
          )}
        </div>

        {/* Contenido mejorado */}
        <div className="p-5 space-y-4 bg-gradient-to-b from-white to-gray-50/50">
          {/* Brand y nombre */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold truncate">
                {product.brand}
              </p>
              {product.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-gray-600 font-medium">{product.rating}</span>
                </div>
              )}
            </div>
            <h3 className="font-bold text-base leading-snug text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
              {product.name}
            </h3>
          </div>

          {/* Precio y características */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {formatPrice(product.price)}
                </p>
                {product.weight && (
                  <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                    {product.weight}kg
                  </div>
                )}
              </div>
            </div>

            {/* Características adicionales */}
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Truck className="w-3 h-3" />
                <span>Envío</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Garantía</span>
              </div>
            </div>

            {/* Botón mejorado */}
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 text-white font-bold py-4 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 border border-blue-500/20"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>{t('Add')}</span>
            </button>
          </div>
        </div>

        {/* Efecto de neón en el borde */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
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
