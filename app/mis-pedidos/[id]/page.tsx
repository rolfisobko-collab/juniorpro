"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Truck, CheckCircle, Clock, MapPin, ArrowLeft, ExternalLink, Copy } from "lucide-react"

interface OrderItem {
  id: string
  name: string
  image: string
  price: number
  quantity: number
}

interface StatusHistory {
  id: string
  status: string
  note?: string
  createdAt: string
}

interface Order {
  id: string
  status: string
  total: number
  shippingAddress: string
  shippingCity: string
  shippingState: string
  shippingMethod: string
  shippingCost?: number
  trackingNumber?: string
  boxName?: string
  paymentMethod?: string
  paymentStatus?: string
  createdAt: string
  items: OrderItem[]
  statusHistory: StatusHistory[]
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; step: number }> = {
  pending:    { label: "Pendiente",    color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock,        step: 0 },
  confirmed:  { label: "Confirmado",   color: "bg-blue-100 text-blue-700 border-blue-200",       icon: CheckCircle,  step: 1 },
  processing: { label: "Preparando",   color: "bg-purple-100 text-purple-700 border-purple-200", icon: Package,      step: 2 },
  shipped:    { label: "Despachado",   color: "bg-orange-100 text-orange-700 border-orange-200", icon: Truck,        step: 3 },
  delivered:  { label: "Entregado",    color: "bg-green-100 text-green-700 border-green-200",    icon: CheckCircle,  step: 4 },
  cancelled:  { label: "Cancelado",    color: "bg-red-100 text-red-700 border-red-200",          icon: Clock,        step: -1 },
}

const STEPS = ["Confirmado", "Preparando", "Despachado", "Entregado"]

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`)
        if (!res.ok) { router.push("/mis-pedidos"); return }
        const data = await res.json()
        setOrder(data.order || data)
      } catch {
        router.push("/mis-pedidos")
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id, router])

  const copyTracking = () => {
    if (order?.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-gray-500">Cargando pedido...</div>
    </div>
  )

  if (!order) return null

  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
  const currentStep = statusInfo.step
  const isCancelled = order.status === "cancelled"

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link href="/mis-pedidos" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4" /> Mis pedidos
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Seguimiento de pedido</h1>
              <p className="text-gray-500 text-sm mt-0.5">#{order.id.slice(-8).toUpperCase()}</p>
            </div>
            <Badge className={`text-sm px-3 py-1 border ${statusInfo.color}`}>
              {statusInfo.label}
            </Badge>
          </div>
        </div>

        {/* Timeline de estado */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5">Estado del envío</h2>
            <div className="flex items-start">
              {STEPS.map((step, idx) => {
                const done = currentStep > idx
                const active = currentStep === idx + 1
                return (
                  <div key={step} className="flex-1 flex flex-col items-center relative">
                    {idx < STEPS.length - 1 && (
                      <div className={`absolute top-4 left-1/2 right-0 h-0.5 ${done ? "bg-blue-500" : "bg-gray-200"}`} style={{ width: "100%", transform: "translateX(50%)" }} />
                    )}
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${done ? "bg-blue-500 border-blue-500 text-white" : active ? "bg-white border-blue-500 text-blue-500" : "bg-white border-gray-200 text-gray-300"}`}>
                      {done ? <CheckCircle className="h-4 w-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                    </div>
                    <p className={`mt-2 text-xs text-center font-medium ${done || active ? "text-gray-800" : "text-gray-400"}`}>{step}</p>
                  </div>
                )
              })}
            </div>

            {/* Historial */}
            {order.statusHistory?.length > 0 && (
              <div className="mt-6 pt-5 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Historial</h3>
                <div className="space-y-2">
                  {[...order.statusHistory].reverse().map(h => (
                    <div key={h.id} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-gray-700">{STATUS_CONFIG[h.status]?.label || h.status}</span>
                        {h.note && <span className="text-gray-500"> — {h.note}</span>}
                        <p className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleString("es-PY")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tracking AEX */}
        {order.trackingNumber && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Número de seguimiento AEX</h2>
            <div className="flex items-center gap-3">
              <code className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-mono text-lg tracking-widest">
                {order.trackingNumber}
              </code>
              <Button variant="outline" size="icon" onClick={copyTracking} className="h-12 w-12 border-2 flex-shrink-0">
                {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
              <a href={`https://aex.com.py/seguimiento?tracking=${order.trackingNumber}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon" className="h-12 w-12 border-2 flex-shrink-0">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
            <p className="text-xs text-gray-400 mt-2">Podés rastrear tu paquete directamente en el sitio de AEX</p>
          </div>
        )}

        {/* Detalle del pedido */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Productos</h2>
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={item.image || "/placeholder.jpg"} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">x{item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                    Gs. {(item.price * item.quantity).toLocaleString("es-PY")}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
              {order.shippingCost !== undefined && order.shippingCost > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Envío {order.boxName ? `(${order.boxName})` : ""}</span>
                  <span>Gs. {order.shippingCost.toLocaleString("es-PY")}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>Gs. {order.total.toLocaleString("es-PY")}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Datos de entrega</h2>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">{order.shippingAddress}</p>
                  <p className="text-gray-500">{order.shippingCity}, {order.shippingState}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Truck className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">{order.shippingMethod === "aex" ? "Envío AEX" : order.shippingMethod === "local" ? "Retiro en local" : "A convenir"}</p>
                  {order.boxName && <p className="text-gray-500">Caja: {order.boxName}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <Clock className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Fecha del pedido</p>
                  <p className="text-gray-500">{new Date(order.createdAt).toLocaleString("es-PY")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
