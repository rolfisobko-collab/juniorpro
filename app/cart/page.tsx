"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { useCurrency } from "@/lib/currency-context"
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, Package, Truck, Shield, Image as ImageIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

// Componente de placeholder personalizado
const ProductImagePlaceholder = ({ productName }: { productName: string }) => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mb-2">
      <ImageIcon className="w-6 h-6 text-gray-500" />
    </div>
    <p className="text-xs text-gray-500 text-center font-medium truncate max-w-[100px]">
      {productName.substring(0, 15)}...
    </p>
  </div>
)

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, itemCount } = useCart()
  const { formatPrice } = useCurrency()

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-gray-400" />
            </div>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-gray-900">Tu carrito está vacío</h1>
          <p className="text-gray-600 text-sm md:text-base">Descubre nuestra colección exclusiva de productos premium</p>
          <Link href="/products">
            <Button size="lg" className="h-12 px-6 md:px-8 w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              Explorar Productos
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <Button variant="ghost" onClick={() => window.history.back()} className="mb-4 md:mb-6 hover:bg-gray-100">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Continuar comprando
      </Button>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Header del Carrito */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  Mi Carrito
                </h1>
                <p className="text-gray-600 text-sm md:text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {itemCount} {itemCount === 1 ? "producto" : "productos"} seleccionados
                </p>
              </div>
            </div>
          </div>

          {/* Lista de Productos */}
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={`${item.product.id}-${index}`} className="group">
                <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden bg-white">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      {/* Imagen del Producto */}
                      <div className="relative sm:w-40 sm:h-40 h-56 w-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden group">
                        <Link href={`/products/${item.product.id}`} className="block w-full h-full">
                          <div className="relative w-full h-full">
                            {item.product.image ? (
                              <Image 
                                src={item.product.image} 
                                alt={`${item.product.name} - ${item.product.brand || 'Producto'}`} 
                                fill 
                                className="object-contain transition-all duration-500 group-hover:scale-110 p-4" 
                                sizes="(max-width: 640px) 100vw, 160px"
                                quality={85}
                                priority={index < 2}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '';
                                    parent.appendChild(
                                      Object.assign(document.createElement('div'), {
                                        className: 'w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4',
                                        innerHTML: `
                                          <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mb-2">
                                            <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                            </svg>
                                          </div>
                                          <p class="text-xs text-gray-500 text-center font-medium truncate max-w-[100px]">${item.product.name.substring(0, 15)}...</p>
                                        `
                                      })
                                    );
                                  }
                                }}
                              />
                            ) : (
                              <ProductImagePlaceholder productName={item.product.name} />
                            )}
                            {/* Overlay gradiente */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          {/* Badge de cantidad mejorado */}
                          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-bold text-gray-800 shadow-lg border border-gray-200">
                            {item.quantity}x
                          </div>
                          {/* Efecto de brillo en hover */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
                        </Link>
                      </div>

                      {/* Detalles del Producto */}
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div className="space-y-4">
                          {/* Header del Producto */}
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <Link href={`/products/${item.product.id}`}>
                                <h3 className="font-bold text-lg text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                                  {item.product.name}
                                </h3>
                              </Link>
                              <p className="text-sm text-gray-600 font-medium">{item.product.brand}</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeItem(item.product.id)} 
                              className="flex-shrink-0 h-8 w-8 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Controles y Precio */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            {/* Controles de Cantidad */}
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-gray-700">Cantidad:</span>
                              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 hover:bg-white hover:shadow-sm transition-all"
                                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center font-bold text-gray-900">{item.quantity}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 hover:bg-white hover:shadow-sm transition-all"
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Precio */}
                            <div className="text-right">
                              <p className="font-bold text-xl text-gray-900">
                                {formatPrice(item.product.price * item.quantity)}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatPrice(item.product.price)} c/u
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-purple-50/30 to-white sticky top-20 lg:top-24">
            <CardContent className="p-6 space-y-6">
              {/* Header del Resumen */}
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <h2 className="font-serif text-xl md:text-2xl font-bold text-gray-900">Resumen del Pedido</h2>
              </div>

              {/* Detalles del Pedido */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Subtotal</span>
                    <span className="font-bold text-gray-900">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total</p>
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">
                      {formatPrice(total)}
                    </p>
                  </div>
                </div>

                {/* Botón de Checkout */}
                <Link href="/checkout">
                  <Button size="lg" className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300">
                    Proceder al Checkout
                  </Button>
                </Link>

                {/* Información de envío */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-blue-700 text-sm">
                    <Truck className="h-4 w-4" />
                    <span className="font-medium">
                      Selecciona método de envío en checkout
                    </span>
                  </div>
                </div>

                {/* Seguridad */}
                <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-200">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-600">Compra 100% segura</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
