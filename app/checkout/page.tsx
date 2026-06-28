"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, ChevronLeft, ChevronRight, Clock, Home, Loader2, MapPin, Package, ShoppingBag, Store } from "lucide-react"
import ParaguayLocationSelect from "@/components/paraguay-location-select"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/lib/cart-context"
import { useCurrency } from "@/lib/currency-context"

type ShippingOption = {
  id: "retiro-local" | "convenir"
  name: string
  description: string
  cost: number
  icon: typeof Store
  time: string
  requiresAddress: boolean
}

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { items, total, clearCart } = useCart()
  const { formatPrice } = useCurrency()

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [isConvenirModalOpen, setIsConvenirModalOpen] = useState(false)
  const [shippingData, setShippingData] = useState({
    method: "convenir",
    cost: 0,
    address: "",
    city: "",
    department: "",
  })
  const [contactData, setContactData] = useState({
    name: "",
    phone: "",
    notes: "",
  })

  useEffect(() => {
    if (currentStep !== 3 && items.length === 0) {
      router.push("/cart")
    }
  }, [currentStep, items.length, router])

  const shippingOptions: ShippingOption[] = [
    {
      id: "retiro-local",
      name: "Retiro en Local",
      description: "Retira el pedido en el local. La operadora confirma disponibilidad y horario.",
      cost: 0,
      icon: Store,
      time: "A confirmar",
      requiresAddress: false,
    },
    {
      id: "convenir",
      name: "Coordinar con Operadora",
      description: "Una operadora confirma envio, pago y cualquier dato pendiente contigo.",
      cost: 0,
      icon: Package,
      time: "A coordinar",
      requiresAddress: true,
    },
  ]

  const selectedShipping = shippingOptions.find((option) => option.id === shippingData.method)
  const orderTotal = total + shippingData.cost

  const handleShippingSelect = (option: ShippingOption) => {
    setShippingData((prev) => ({
      ...prev,
      method: option.id,
      cost: option.cost,
      ...(option.id === "retiro-local" ? { address: "", city: "", department: "" } : {}),
    }))

    if (option.requiresAddress) {
      setIsConvenirModalOpen(true)
    }
  }

  const handleLocationSelect = (location: { address: string; city: string; department: string }) => {
    setShippingData((prev) => ({
      ...prev,
      address: location.address,
      city: location.city,
      department: location.department,
    }))
  }

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!contactData.phone.trim()) {
        toast({
          title: "Falta telefono",
          description: "Necesitamos un telefono para que la operadora pueda confirmar el pedido.",
          variant: "destructive",
        })
        return
      }
      setCurrentStep(2)
      return
    }

    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const createOrder = async () => {
    const addressDetails = [
      shippingData.address || (shippingData.method === "retiro-local" ? "Retiro en local" : "Coordinar con operadora"),
      contactData.name && `Cliente: ${contactData.name}`,
      contactData.notes && `Notas: ${contactData.notes}`,
    ].filter(Boolean).join(" | ")

    const orderData = {
      items: items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        image: item.product.image || "/placeholder.svg",
        quantity: item.quantity,
        price: item.product.price,
      })),
      shippingMethod: shippingData.method,
      shippingCost: shippingData.cost,
      shippingAddress: addressDetails,
      shippingCity: shippingData.city,
      shippingDepartment: shippingData.department,
      contactName: contactData.name,
      contactPhone: contactData.phone,
      subtotal: total,
      tax: 0,
      total: orderTotal,
      status: "pending",
      paymentMethod: "pending_operator",
      paymentStatus: "pending",
    }

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Error ${response.status}: ${errorText}`)
    }

    const order = await response.json()
    if (order?.order?.id) setOrderId(order.order.id)
    return order
  }

  const handleConfirmOrder = async () => {
    try {
      setIsSubmittingOrder(true)
      await createOrder()
      clearCart()
      setCurrentStep(3)
      toast({
        title: "Pedido recibido",
        description: "Una operadora va a confirmar envio y pago contigo.",
      })
    } catch (error) {
      toast({
        title: "Error al crear orden",
        description: error instanceof Error ? error.message : "No se pudo crear la orden",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  const handleViewOrders = () => {
    router.push("/orders")
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 min-h-screen">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Checkout</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Confirma tu pedido y una operadora coordina pago y entrega.
        </p>
      </div>

      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          <div className="flex items-center space-x-2 md:space-x-4 min-w-max w-full justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-base font-medium transition-all duration-300 ${
                      currentStep >= step
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                        : "bg-gray-100 text-gray-500 border-2 border-gray-300"
                    }`}
                  >
                    {currentStep > step ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : step}
                  </div>
                  <p className={`text-xs md:text-sm font-medium mt-2 ${currentStep >= step ? "text-blue-700 font-semibold" : "text-gray-500"}`}>
                    {step === 1 && "Datos"}
                    {step === 2 && "Confirmacion"}
                    {step === 3 && "Pedido"}
                  </p>
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-0.5 mx-2 md:mx-4 transition-all duration-300 ${currentStep > step ? "bg-gradient-to-r from-blue-600 to-blue-700" : "bg-gray-300"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {currentStep === 1 && (
        <Card className="border-0 shadow-md bg-gradient-to-br from-white via-blue-50/30 to-white">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
              <Package className="w-6 h-6" />
              Datos del Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Nombre</Label>
                <Input
                  id="contact-name"
                  placeholder="Nombre del cliente"
                  value={contactData.name}
                  onChange={(event) => setContactData((prev) => ({ ...prev, name: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Telefono / WhatsApp *</Label>
                <Input
                  id="contact-phone"
                  placeholder="Ej: 0981 123 456"
                  value={contactData.phone}
                  onChange={(event) => setContactData((prev) => ({ ...prev, phone: event.target.value }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contact-notes">Notas para la operadora</Label>
                <Input
                  id="contact-notes"
                  placeholder="Horario, referencia, forma de contacto, etc."
                  value={contactData.notes}
                  onChange={(event) => setContactData((prev) => ({ ...prev, notes: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {shippingOptions.map((option) => (
                <div
                  key={option.id}
                  className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-md cursor-pointer ${
                    shippingData.method === option.id
                      ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md"
                      : "border-gray-200 hover:border-blue-300 bg-white"
                  }`}
                  onClick={() => handleShippingSelect(option)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${shippingData.method === option.id ? "bg-blue-100" : "bg-gray-100"}`}>
                        <option.icon className={`w-6 h-6 ${shippingData.method === option.id ? "text-blue-600" : "text-gray-600"}`} />
                      </div>
                      {shippingData.method === option.id && (
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
                      <span className="font-bold text-lg">{option.cost === 0 ? "Sin cargo online" : formatPrice(option.cost)}</span>
                    </div>
                    {option.requiresAddress && (
                      <Button
                        type="button"
                        variant={shippingData.method === option.id ? "default" : "outline"}
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation()
                          setIsConvenirModalOpen(true)
                        }}
                      >
                        Cargar direccion
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {shippingData.method && (
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Coordinacion
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Metodo seleccionado</Label>
                    <p className="font-semibold text-gray-900">{selectedShipping?.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Costo online</Label>
                    <p className="font-semibold text-gray-900">A coordinar por operadora</p>
                  </div>
                  {shippingData.address && (
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium text-gray-700">Direccion</Label>
                      <p className="font-semibold text-gray-900">{shippingData.address}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-between pt-6 border-t border-gray-200">
              <Button variant="outline" onClick={() => router.back()} className="h-12 px-4 sm:px-6 border-2 w-full sm:w-auto order-2 sm:order-1">
                <ChevronLeft className="h-4 w-4" />
                <span className="text-sm sm:text-base">Anterior</span>
              </Button>
              <Button onClick={handleNextStep} className="h-12 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg w-full sm:w-auto order-1 sm:order-2">
                <span className="text-sm sm:text-base">Revisar pedido</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card className="border-0 shadow-md bg-gradient-to-br from-white via-green-50/30 to-white">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
              <Check className="w-6 h-6" />
              Confirmar Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="font-medium text-gray-900">No se cobra online y no se calcula envio ahora.</p>
              <p className="text-sm text-gray-600 mt-1">La operadora recibe este pedido en el panel y termina la compra con el cliente.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-4">Cliente</h3>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="font-semibold mb-3">{contactData.name || "Sin especificar"}</p>
                <p className="text-sm text-gray-600">Telefono</p>
                <p className="font-semibold mb-3">{contactData.phone}</p>
                <p className="text-sm text-gray-600">Entrega</p>
                <p className="font-semibold">{selectedShipping?.name}</p>
                {shippingData.address && <p className="text-sm text-gray-700 mt-2">{shippingData.address}</p>}
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-4">Resumen</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Productos</span>
                    <span className="font-semibold">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Envio</span>
                    <span className="font-semibold">A coordinar</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t text-lg">
                    <span className="font-bold">Total productos</span>
                    <span className="font-bold">{formatPrice(orderTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-medium">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between pt-6 border-t border-gray-200">
              <Button variant="outline" onClick={() => setCurrentStep(1)} className="h-12 px-6 border-2 w-full sm:w-auto">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <Button onClick={handleConfirmOrder} disabled={isSubmittingOrder} className="h-12 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg w-full sm:w-auto">
                {isSubmittingOrder ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando pedido...
                  </>
                ) : (
                  "Confirmar pedido"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-green-50/30 to-white overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 text-center">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Pedido Recibido</h1>
              <p className="text-green-100 text-lg">Una operadora va a confirmar pago, envio y disponibilidad contigo.</p>
            </div>

            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-green-600" />
                    Detalles del Pedido
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Numero de Orden</span>
                      <span className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">#{orderId}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Total de productos</span>
                      <span className="font-bold text-xl text-gray-900">{formatPrice(orderTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600 font-medium">Pago</span>
                      <span className="font-medium text-gray-900">A coordinar</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Coordinacion
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 font-medium">Metodo:</span>
                      <p className="font-medium text-gray-900">{selectedShipping?.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Contacto:</span>
                      <p className="font-medium text-gray-900">{contactData.phone}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Direccion:</span>
                      <p className="font-medium text-gray-900">{shippingData.address || "Retiro en local"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-8">
                <h3 className="font-bold text-lg mb-4">Productos Solicitados</h3>
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
                      <span className="font-medium">{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t border-gray-200">
                <Button onClick={handleViewOrders} size="lg" className="h-14 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg w-full sm:w-auto">
                  <Package className="h-5 w-5 mr-2" />
                  Ver Mis Ordenes
                </Button>
                <Button onClick={() => router.push("/products")} variant="outline" size="lg" className="h-14 px-6 border-2 w-full sm:w-auto">
                  <Home className="h-5 w-5 mr-2" />
                  Seguir Comprando
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ParaguayLocationSelect
        isOpen={isConvenirModalOpen}
        onClose={() => setIsConvenirModalOpen(false)}
        onLocationSelect={handleLocationSelect}
      />
    </div>
  )
}
