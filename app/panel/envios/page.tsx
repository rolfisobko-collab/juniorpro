"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PanelLayout } from "@/components/panel-layout"
import { Package, Truck, MapPin, Clock, Search, RefreshCw } from "lucide-react"

interface ShippingOrder {
  id: string
  customerName: string
  address: string
  city: string
  department: string
  service: string
  weight: number
  cost: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  trackingNumber?: string
  createdAt: string
  estimatedDelivery?: string
}

export default function EnviosPage() {
  const [orders, setOrders] = useState<ShippingOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [trackingResult, setTrackingResult] = useState<any>(null)
  const [trackingLoading, setTrackingLoading] = useState(false)

  // Cargar pedidos desde la DB vía API admin
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await fetch("/api/admin/orders", { credentials: "include" })
        if (!res.ok) throw new Error("Error cargando órdenes")
        const data = await res.json()
        const dbOrders = (data.orders || []).map((order: any) => ({
          id: order.id,
          customerName: order.contactEmail || "Cliente",
          address: order.shippingAddress || "",
          city: order.shippingCity || "",
          department: order.shippingState || "",
          service: order.shippingMethod || "Estándar",
          weight: 0,
          cost: order.total || 0,
          status: order.status as ShippingOrder["status"],
          trackingNumber: undefined,
          createdAt: order.createdAt,
          estimatedDelivery: undefined,
        }))
        setOrders(dbOrders)
      } catch (error) {
        console.error("Error loading orders:", error)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Función para rastrear envío
  const handleTrack = async () => {
    if (!trackingNumber) return
    
    setTrackingLoading(true)
    try {
      const response = await fetch(`/api/shipping?action=track&number=${encodeURIComponent(trackingNumber)}`)
      const data = await response.json()
      
      if (data.success) {
        setTrackingResult(data.data)
      } else {
        setTrackingResult({ error: data.error || "No se encontró el envío" })
      }
    } catch (error) {
      console.error("Error tracking shipment:", error)
      setTrackingResult({ error: "Error de conexión" })
    } finally {
      setTrackingLoading(false)
    }
  }

  // Función para actualizar estado vía API
  const updateOrderStatus = async (orderId: string, newStatus: ShippingOrder['status']) => {
    try {
      await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      })
      setOrders(prev => prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
    } catch (error) {
      console.error("Error actualizando estado:", error)
    }
  }

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-PY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  // Obtener color de estado
  const getStatusColor = (status: ShippingOrder['status']) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "processing": return "bg-blue-100 text-blue-800"
      case "shipped": return "bg-purple-100 text-purple-800"
      case "delivered": return "bg-green-100 text-green-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  // Obtener texto de estado
  const getStatusText = (status: ShippingOrder['status']) => {
    switch (status) {
      case "pending": return "Pendiente"
      case "processing": return "Procesando"
      case "shipped": return "Enviado"
      case "delivered": return "Entregado"
      case "cancelled": return "Cancelado"
      default: return "Desconocido"
    }
  }

  return (
    <PanelLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Gestión de Envíos</h1>
          <p className="text-muted-foreground mt-2">Administra y rastrea todos los envíos del ecommerce</p>
        </div>

        {/* Tracking Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Rastrear Envío
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="tracking">Número de Seguimiento</Label>
                <Input
                  id="tracking"
                  placeholder="Ej: CP12345678"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleTrack}
                  disabled={trackingLoading || !trackingNumber}
                  className="flex items-center gap-2"
                >
                  {trackingLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Rastrear
                </Button>
              </div>
            </div>

            {trackingResult && (
              <div className="mt-4 p-4 border rounded-lg">
                {trackingResult.error ? (
                  <div className="text-red-600">
                    <p className="font-medium">Error:</p>
                    <p className="text-sm">{trackingResult.error}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Número de Seguimiento</p>
                        <p className="font-medium">{trackingResult.trackingNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estado</p>
                        <p className="font-medium">{trackingResult.status}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Origen</p>
                        <p className="font-medium">{trackingResult.origin}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Destino</p>
                        <p className="font-medium">{trackingResult.destination}</p>
                      </div>
                    </div>
                    
                    {trackingResult.estimatedDelivery && (
                      <div>
                        <p className="text-sm text-muted-foreground">Entrega Estimada</p>
                        <p className="font-medium">
                          {new Date(trackingResult.estimatedDelivery).toLocaleDateString("es-PY", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}
                        </p>
                      </div>
                    )}

                    {trackingResult.checkpoints && (
                      <div>
                        <p className="text-sm font-medium mb-2">Historial de Seguimiento</p>
                        <div className="space-y-2">
                          {trackingResult.checkpoints.map((checkpoint: any, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded">
                              <div className="w-2 h-2 bg-primary rounded-full mt-1 flex-shrink-0"></div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{checkpoint.status}</p>
                                <p className="text-xs text-muted-foreground">
                                  {checkpoint.location} • {new Date(checkpoint.date).toLocaleString("es-PY")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orders Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Pedidos de Envío
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredOrders.length} de {orders.length} pedidos
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  placeholder="Buscar por cliente, dirección o número de seguimiento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="processing">Procesando</SelectItem>
                    <SelectItem value="shipped">Enviado</SelectItem>
                    <SelectItem value="delivered">Entregado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Orders List */}
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Cargando pedidos...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" 
                    ? "No se encontraron pedidos con los filtros aplicados"
                    : "No hay pedidos de envío registrados"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">Pedido #{order.id}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Cliente</p>
                        <p className="font-medium">{order.customerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Servicio</p>
                        <p className="font-medium">{order.service}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Dirección</p>
                        <p className="font-medium text-sm">
                          {order.address}, {order.city}, {order.department}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Costo de Envío</p>
                        <p className="font-medium">{formatCurrency(order.cost)}</p>
                      </div>
                    </div>

                    {order.trackingNumber && (
                      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Número de seguimiento: <strong>{order.trackingNumber}</strong>
                        </span>
                      </div>
                    )}

                    {order.estimatedDelivery && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          Entrega estimada: {formatDate(order.estimatedDelivery)}
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-3">
                      {order.status === "processing" && (
                        <Button 
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, "shipped")}
                        >
                          Marcar como Enviado
                        </Button>
                      )}
                      {order.status === "shipped" && (
                        <Button 
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, "delivered")}
                        >
                          Marcar como Entregado
                        </Button>
                      )}
                      {["pending", "processing"].includes(order.status) && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateOrderStatus(order.id, "cancelled")}
                        >
                          Cancelar Envío
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PanelLayout>
  )
}
