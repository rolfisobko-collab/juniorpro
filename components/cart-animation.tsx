"use client"

import { useEffect, useState, useRef } from "react"
import type { UnifiedProduct } from "@/lib/product-types"

interface CartAnimationProps {
  product: UnifiedProduct
  trigger: {x: number, y: number} | false
  onComplete?: () => void
}

export function CartAnimation({ product, trigger, onComplete }: CartAnimationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })
  const [endPosition, setEndPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (trigger) {
      // Obtener posición del carrito (buscar todos los posibles botones)
      const cartButtons = document.querySelectorAll('[data-cart-button]')
      let cartRect = null
      
      // Buscar el botón de carrito visible
      cartButtons.forEach((button) => {
        const rect = button.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          cartRect = rect
        }
      })
      
      // Si no encuentra el botón, usar posición por defecto (esquina superior derecha)
      const endX = (cartRect as any)?.left + (cartRect as any)?.width / 2 || window.innerWidth - 40
      const endY = (cartRect as any)?.top + (cartRect as any)?.height / 2 || 100
      
      setEndPosition({ x: endX, y: endY })
      setStartPosition(trigger)
      setIsVisible(true)
      
      // Debug en consola
      console.log('🚀 Animación iniciada:', {
        start: trigger,
        end: { x: endX, y: endY },
        cartFound: !!cartRect
      })
      
      setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, 1000) // Un poco más de tiempo para ver la animación
    }
  }, [trigger, onComplete])

  if (!isVisible) return null

  // Calcular distancias para la animación
  const deltaX = endPosition.x - startPosition.x
  const deltaY = endPosition.y - startPosition.y

  return (
    <>
      <style jsx global>{`
        @keyframes fly-to-cart-${Date.now()} {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          25% {
            transform: scale(1.2) rotate(180deg);
            opacity: 0.9;
          }
          100% {
            transform: scale(0.3) rotate(720deg) translate(${deltaX}px, ${deltaY}px);
            opacity: 0;
          }
        }

        @keyframes trail-${Date.now()} {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.6;
          }
          100% {
            transform: translate(calc(-50% + ${deltaX * 0.6}px), calc(-50% + ${deltaY * 0.6}px)) scale(0.2);
            opacity: 0;
          }
        }
      `}</style>
      
      <div className="fixed pointer-events-none z-[9999]">
        <div
          className="absolute"
          style={{
            left: `${startPosition.x}px`,
            top: `${startPosition.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="relative">
            {/* Miniatura del producto que vuela */}
            <div 
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shadow-2xl border-2 border-white bg-white"
              style={{
                animation: `fly-to-cart-${Date.now()} 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
              }}
            >
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://via.placeholder.com/64x64/f3f4f6/6b7280?text=Product";
                }}
              />
            </div>
            
            {/* Efecto de estela mejorada */}
            <div className="absolute inset-0">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-lg"
                  style={{
                    left: '50%',
                    top: '50%',
                    animation: `trail-${Date.now()} 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${i * 0.1}s forwards`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
