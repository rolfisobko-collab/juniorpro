"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import PanelLayout from "@/components/panel-layout"
import { ArrowLeft, Package, User, MapPin, CreditCard, CheckCircle } from "lucide-react"

interface OrderItem {
  id: string
  orderId: string
  productId: string
  name: string
  image: string
  price: number
  quantity: number
  weight?: number
  length?: number
  width?: number
  height?: number
  product?: {
    id: string
    name: string
    image: string
  }
}

interface Order {
  id: string
  userId: string
  status: string
  total: number
  shippingAddress: string
  shippingCity: string
  shippingState: string
  shippingZipCode: string
  shippingMethod: string
  contactEmail: string
  contactPhone: string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  statusHistory: any[]
  user?: {
    id: string
    email: string
    name: string
  }
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/admin/orders/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setOrder(data.order)
        }
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchOrder()
    }
  }, [params.id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-orange-100 text-orange-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "processing":
        return "Procesando"
      case "shipped":
        return "Enviado"
      case "delivered":
        return "Entregado"
      default:
        return status
    }
  }

  const getShippingMethodText = (method: string) => {
    switch (method) {
      case "aex":
        return "AEX"
      case "convenir":
        return "Envío a Convenir"
      case "local":
        return "Retiro en Local"
      default:
        return method
    }
  }

  const calculateSubtotal = () => {
    if (!order?.items) return 0
    return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const subtotal = calculateSubtotal()
  const shippingCost = order ? order.total - subtotal - (subtotal * 0.1) : 0
  const tax = subtotal * 0.1

  if (loading) {
    return (
      <PanelLayout>
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </PanelLayout>
    )
  }

  if (!order) {
    return (
      <PanelLayout>
        <div className="p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Pedido no encontrado</h1>
            <Button onClick={() => router.push("/panel/orders")}>
              Volver a pedidos
            </Button>
          </div>
        </div>
      </PanelLayout>
    )
  }

  return (
    <PanelLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/panel/orders")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a pedidos
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Detalles del Pedido</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">ID: {order.id}</span>
            <Badge className={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </Badge>
            <span className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleDateString("es-ES")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Nombre</p>
                <p className="text-sm text-gray-600">{order.user?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-600">{order.user?.email || order.contactEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Teléfono</p>
                <p className="text-sm text-gray-600">{order.contactPhone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Información de Envío
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Método</p>
                <Badge variant="secondary">
                  {getShippingMethodText(order.shippingMethod)}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Dirección</p>
                <p className="text-sm text-gray-600">{order.shippingAddress}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Ciudad</p>
                <p className="text-sm text-gray-600">{order.shippingCity}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Departamento</p>
                <p className="text-sm text-gray-600">{order.shippingState}</p>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Resumen del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm font-medium">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Envío</span>
                <span className="text-sm font-medium">${shippingCost.toLocaleString()}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-base font-medium">Total</span>
                  <span className="text-base font-bold text-lg">${order.total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Productos ({order.items.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {item.product?.image ? (
                        <img 
                          src={item.product.image} 
                          alt={item.product.name || item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {item.product?.name || item.name}
                      </h4>
                      <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                      <p className="text-sm text-gray-600">Precio: ${item.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      ${(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PanelLayout>
  )
}
