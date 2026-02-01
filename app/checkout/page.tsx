"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Truck, Package, MapPin, Store, Clock, ChevronLeft, ChevronRight, Check, CreditCard, Home, Loader2, Lock, ShoppingBag } from "lucide-react"
import ParaguayLocationSelect from "@/components/paraguay-location-select"
import { useAEXShipping } from "@/hooks/use-aex-shipping"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/lib/cart-context"
import BancardCheckout from "@/components/bancard-checkout"
import Image from "next/image"
import Link from "next/link"

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { items, total, itemCount, clearCart } = useCart()
  
  // Redirigir si el carrito esta vacio o si no esta logueado
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
    
    // Verificar si el usuario esta logueado (intentar acceder a una ruta protegida)
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          // No esta autenticado, redirigir a login
          router.push('/login?redirect=/checkout')
          return
        }
      } catch (error) {
        // Error de autenticación, redirigir a login
        router.push('/login?redirect=/checkout')
      }
    }
    
    checkAuth()
  }, [items, router])
  
  const [currentStep, setCurrentStep] = useState(1)
  const [shippingData, setShippingData] = useState({
    method: "",
    cost: 0,
    address: "",
    city: "",
    department: "",
    notes: ""
  })
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
    method: "bancard"
  })
  const [bancardProcessId, setBancardProcessId] = useState<string | null>(null)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [isConvenirModalOpen, setIsConvenirModalOpen] = useState(false)
  
  // Hook para calculo de envio AEX
  const { calculateShipping, loading: aexLoading, error: aexError, shippingOptions: aexServices } = useAEXShipping()

  // useEffect para autocalcular cuando los datos de envio estan completos
  useEffect(() => {
    if (shippingData.method === "aex" && 
        shippingData.city && 
        shippingData.department && 
        shippingData.address && 
        !aexLoading &&
        shippingData.cost === 0) {
      console.log('Datos completos, calculando envio AEX automaticamente')
      calculateAEXShipping()
    }
  }, [shippingData.city, shippingData.department, shippingData.address, shippingData.method])

  // Funcion para generar process_id de Bancard
  const generateBancardProcessId = async () => {
    try {
      setPaymentLoading(true)
      const totalAmount = total + (shippingData.cost || 0)
      
      const response = await fetch('/api/bancard/create-single-buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount,
          description: `Compra JuniorWeb - ${itemCount} productos`,
          return_url: `${window.location.origin}/checkout/success`,
          cancel_url: `${window.location.origin}/checkout/cancel`
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error generando process_id')
      }

      setBancardProcessId(data.process_id)
      return data.process_id
    } catch (error) {
      console.error('Error generando process_id:', error)
      toast({
        title: "Error",
        description: "No se pudo procesar el pago",
        variant: "destructive"
      })
      return null
    } finally {
      setPaymentLoading(false)
    }
  }

  // Manejar exito del pago
  const handlePaymentSuccess = (response: any) => {
    toast({
      title: "Pago exitoso!",
      description: "Tu compra ha sido procesada correctamente"
    })
    
    setTimeout(() => {
      router.push('/checkout/success')
    }, 2000)
  }

  // Manejar error en el pago
  const handlePaymentError = (error: any) => {
    toast({
      title: "Error en el pago",
      description: error.message || "Ocurrio un error al procesar el pago",
      variant: "destructive"
    })
  }

  const user = { name: "Usuario Demo", email: "demo@email.com" }

  // Funcion para calcular envio AEX
  const calculateAEXShipping = async () => {
    console.log('Iniciando calculo AEX...')
    console.log('Estado actual shippingData:', shippingData)
    
    // Obtener los valores mas recientes del estado
    const currentCity = shippingData.city
    const currentDepartment = shippingData.department  
    const currentAddress = shippingData.address

    if (!currentCity || !currentDepartment || !currentAddress) {
      console.log('Faltan datos para el calculo AEX')
      return
    }

    try {
      const shippingRequest = {
        products: items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          weight: (item.product as any).weight || 0.5,
          length: (item.product as any).length || 20,
          width: (item.product as any).width || 15,
          height: (item.product as any).height || 10,
          valorDeclarado: item.product.price,
          paisOrigen: (item.product as any).paisOrigen || "China"
        })),
        destination: {
          city: currentCity,
          department: currentDepartment,
          address: currentAddress
        }
      }

      console.log('Enviando solicitud AEX:', shippingRequest)

      const result = await calculateShipping(shippingRequest)
      
      console.log('Resultado AEX:', result)
      
      if (result.success && result.shipping_cost) {
        setShippingData(prev => ({
          ...prev,
          cost: result.shipping_cost || 0
        }))
      } else {
        console.error('Error en calculo AEX:', result.error)
      }
    } catch (error) {
      console.error('Error calculando envio AEX:', error)
    }
  }

  const shippingOptions = [
    {
      id: "retiro-local",
      name: "Retiro en Local",
      description: "Retira tu pedido en nuestro local sin costo adicional",
      cost: 0,
      icon: Store,
      time: "Hoy o mañana",
      requiresAddress: false
    },
    {
      id: "aex",
      name: "Envio AEX",
      description: "Envio por Agencia de Envios Express",
      cost: null,
      icon: Truck,
      time: "Proximamente",
      requiresAddress: true,
      disabled: true
    },
    {
      id: "convenir",
      name: "Envio a Convenir",
      description: "Coordinamos envio directamente contigo",
      cost: null,
      icon: Package,
      time: "A coordinar",
      requiresAddress: true
    }
  ]

  const handleNextStep = async () => {
    if (currentStep < 3) {
      // Saltar el paso de pago (paso 2) y pasar directamente a confirmacion (paso 3)
      if (currentStep === 1) {
        // Crear la orden en la base de datos
        await createOrder()
        setCurrentStep(3) // Saltar del paso 1 (envio) al paso 3 (confirmacion)
      } else {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const createOrder = async () => {
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        })),
        shippingMethod: shippingData.method,
        shippingCost: shippingData.cost || 0,
        shippingAddress: shippingData.address || "Retiro en local",
        shippingCity: shippingData.city || "",
        shippingDepartment: shippingData.department || "",
        subtotal: total,
        tax: total * 0.1,
        total: total + (shippingData.cost || 0) + (total * 0.1),
        status: "pending",
        paymentMethod: "pending",
        paymentStatus: "pending"
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error('Error creando la orden')
      }

      const order = await response.json()
      console.log('Orden creada:', order)
      
      // NO limpiar el carrito todavía - esperar a que el usuario vea la confirmación
      return order
    } catch (error) {
      console.error('Error creando orden:', error)
      toast({
        title: "Error",
        description: "No se pudo crear la orden",
        variant: "destructive"
      })
      return null
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      // Saltar el paso de pago (paso 2) al volver
      if (currentStep === 3) {
        setCurrentStep(1) // Volver del paso 3 (confirmacion) al paso 1 (envio)
      } else {
        setCurrentStep(currentStep - 1)
      }
    }
  }

  const handleViewOrders = () => {
    // Limpiar el carrito después de que el usuario vea la confirmación
    clearCart()
    router.push('/orders')
  }

  const handleShippingSelect = (option: any) => {
    setShippingData(prev => ({
      ...prev,
      method: option.id,
      cost: option.cost || 0
    }))
    
    // Si es AEX y ya hay direccion, calcular automaticamente
    if (option.id === "aex") {
      if (shippingData.city && shippingData.department && shippingData.address) {
        setTimeout(() => calculateAEXShipping(), 100)
      } else {
        setIsLocationModalOpen(true)
      }
    }
    // Si requiere direccion, abrir modal de ubicacion correspondiente
    else if (option.requiresAddress) {
      if (option.id === "convenir") {
        setIsConvenirModalOpen(true)
      }
    }
  }

  const handleLocationSelect = (location: any) => {
    setShippingData(prev => ({
      ...prev,
      city: location.city,
      department: location.department
    }))
    
    // Si el metodo seleccionado es AEX, calcular el envio automaticamente
    setTimeout(() => {
      setShippingData(currentData => {
        console.log('Estado actualizado:', currentData)
        if (currentData.method === "aex" && location.city && location.department && currentData.address) {
          console.log('Disparando calculo automatico de AEX')
          calculateAEXShipping()
        }
        return currentData
      })
    }, 100)
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 min-h-screen">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Checkout</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Completa los siguientes pasos para finalizar tu pedido
        </p>
      </div>

      {/* Progress Bar - Responsive */}
      <div className="flex items-center justify-between mb-6 md:mb-8 overflow-x-auto">
        <div className="flex items-center space-x-2 md:space-x-4 min-w-max">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-medium ${
                  currentStep >= step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > step ? (
                  <Check className="w-3 h-3 md:w-5 md:h-5" />
                ) : (
                  step
                )}
              </div>
              <div className="ml-2 md:ml-3">
                <p className={`text-xs md:text-sm font-medium ${
                  currentStep >= step ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {step === 1 && "Envio"}
                  {step === 2 && "Pago"}
                  {step === 3 && "Confirmacion"}
                </p>
              </div>
              {step < 3 && (
                <div className={`w-2 md:w-4 h-0.5 ml-2 md:ml-4 ${
                  currentStep > step ? "bg-primary" : "bg-muted"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Shipping Method */}
      {currentStep === 1 && (
        <Card className="border-0 shadow-md bg-gradient-to-br from-white via-blue-50/30 to-white">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
              <Truck className="w-6 h-6" />
              Metodo de Envio
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shippingOptions.map((option) => (
                <div
                  key={option.id}
                  className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-md ${
                    option.disabled
                      ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                      : shippingData.method === option.id
                      ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md cursor-pointer"
                      : "border-gray-200 hover:border-blue-300 bg-white cursor-pointer"
                  }`}
                  onClick={() => !option.disabled && handleShippingSelect(option)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        option.disabled 
                          ? "bg-gray-200" 
                          : shippingData.method === option.id 
                            ? "bg-blue-100" 
                            : "bg-gray-100"
                      }`}>
                        <option.icon className={`w-6 h-6 ${
                          option.disabled 
                            ? "text-gray-400" 
                            : shippingData.method === option.id 
                              ? "text-blue-600" 
                              : "text-gray-600"
                        }`} />
                      </div>
                      {shippingData.method === option.id && !option.disabled && (
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-lg mb-2">{option.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{option.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{option.time}</span>
                      </div>
                      {option.cost !== null && (
                        <span className="font-bold text-lg">
                          ${option.cost.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {option.requiresAddress && (
                      <div className="mt-4">
                        <Button 
                          variant={shippingData.method === option.id ? "default" : "outline"}
                          size="sm"
                          disabled={option.disabled}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (option.id === "aex") {
                              setIsLocationModalOpen(true)
                            } else if (option.id === "convenir") {
                              setIsConvenirModalOpen(true)
                            }
                          }}
                          className={`w-full sm:w-auto transition-all duration-300 ${
                            option.disabled
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : shippingData.method === option.id
                              ? "bg-blue-600 hover:bg-blue-700 shadow-sm"
                              : "hover:bg-blue-50 hover:border-blue-300"
                          }`}
                        >
                          {option.disabled ? "Proximamente" : "Seleccionar"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Shipping Details */}
            {shippingData.method && (
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <MapPin className="w-5 w-5 text-blue-600" />
                  Detalles del Envio
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Metodo Seleccionado</Label>
                    <p className="font-semibold text-gray-900">
                      {shippingOptions.find(opt => opt.id === shippingData.method)?.name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Costo de Envio</Label>
                    <p className="font-semibold text-gray-900">
                      {shippingData.cost > 0 ? `$${shippingData.cost.toFixed(2)}` : "Por calcular"}
                    </p>
                  </div>
                  {(shippingData.city || shippingData.department) && (
                    <>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Ciudad</Label>
                        <p className="font-semibold text-gray-900">{shippingData.city || "No especificada"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Departamento</Label>
                        <p className="font-semibold text-gray-900">{shippingData.department || "No especificado"}</p>
                      </div>
                    </>
                  )}
                  {shippingData.address && (
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium text-gray-700">Direccion</Label>
                      <p className="font-semibold text-gray-900">{shippingData.address}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="h-11 px-6 border-2 hover:bg-gray-50 transition-all duration-300 flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Anterior</span>
              </Button>
              <Button 
                onClick={handleNextStep}
                disabled={
                  !shippingData.method || 
                  (shippingData.method === "convenir" && !shippingData.address)
                }
                className="h-11 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Siguiente: Confirmacion</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Order Success */}
      {currentStep === 3 && (
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-green-50/30 to-white overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{backgroundImage: "url('/grid.svg')"}}></div>
              <div className="relative z-10">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <Check className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">Compra Realizada con Exito!</h1>
                <p className="text-green-100 text-lg">Felicitaciones! Tu pedido ha sido procesado correctamente</p>
              </div>
            </div>
            
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Package className="h-5 w-5 text-green-600" />
                      Detalles del Pedido
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600 font-medium">Numero de Orden</span>
                        <span className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                          #ORD-2024-{Math.random().toString(36).substring(2, 11).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600 font-medium">Total Pagado</span>
                        <span className="font-bold text-xl text-gray-900">
                          ${(total + (shippingData.cost || 0) + total * 0.1).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600 font-medium">Metodo de Pago</span>
                        <span className="font-medium text-gray-900">
                          {paymentData.method === "bancard" ? "Tarjeta de Credito/Debito" : paymentData.method}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-gray-600 font-medium">Fecha</span>
                        <span className="font-medium text-gray-900">
                          {new Date().toLocaleDateString('es-ES', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      Datos de Envio
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-600 font-medium">Metodo:</span>
                        <p className="font-medium text-gray-900">
                          {shippingOptions.find(opt => opt.id === shippingData.method)?.name}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">Direccion:</span>
                        <p className="font-medium text-gray-900">
                          {shippingData.address || "Retiro en local"}
                        </p>
                      </div>
                      {(shippingData.city || shippingData.department) && (
                        <div>
                          <span className="text-gray-600 font-medium">Ubicacion:</span>
                          <p className="font-medium text-gray-900">
                            {shippingData.city && `${shippingData.city}`}
                            {shippingData.city && shippingData.department && ", "}
                            {shippingData.department && shippingData.department}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-8">
                <h3 className="font-bold text-lg mb-4">Productos Adquiridos</h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.product.name}</p>
                          <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-medium">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t border-gray-200">
                <Button 
                  onClick={handleViewOrders}
                  size="lg"
                  className="h-12 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                >
                  <Package className="h-5 w-5" />
                  <span>Ver Mis Ordenes</span>
                </Button>
                <Button 
                  onClick={() => router.push('/products')}
                  variant="outline"
                  size="lg"
                  className="h-12 px-6 border-2 hover:bg-gray-50 transition-all duration-300 flex items-center gap-2"
                >
                  <Home className="h-5 w-5" />
                  <span>Seguir Comprando</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AEX Location Modal */}
      <ParaguayLocationSelect
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationSelect={handleLocationSelect}
      />

      {/* Convenir Modal */}
      <ParaguayLocationSelect
        isOpen={isConvenirModalOpen}
        onClose={() => setIsConvenirModalOpen(false)}
        onLocationSelect={handleLocationSelect}
      />
    </div>
  )
}
