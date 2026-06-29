"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Image } from "@/components/ui/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { use } from "react"

interface OrderItem {
  id: string
  name: string
  image: string
  price: number
  quantity: number
}

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  items: OrderItem[]
}

function getStatusText(status: string) {
  switch (status) {
    case "pending":
      return "Pedido recibido"
    case "processing":
      return "Preparando"
    case "shipped":
      return "Enviado"
    case "delivered":
      return "Finalizado"
    case "cancelled":
      return "Cancelado"
    default:
      return "Pedido recibido"
  }
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        })

        if (!res.ok) {
          // Fallback to localStorage demo orders
          try {
            const raw = localStorage.getItem("tz_demo_orders")
            const parsed = (raw ? (JSON.parse(raw) as unknown[]) : []) as Order[]
            const found = parsed.find((o) => o.id === id)
            if (!cancelled) setOrder(found ?? null)
          } catch {
            if (!cancelled) setOrder(null)
          }
          return
        }

        const data = (await res.json()) as { order?: Order }
        if (!cancelled) setOrder(data.order ?? null)
      } catch {
        // Fallback to localStorage demo orders
        try {
          const raw = localStorage.getItem("tz_demo_orders")
          const parsed = (raw ? (JSON.parse(raw) as unknown[]) : []) as Order[]
          const found = parsed.find((o) => o.id === id)
          if (!cancelled) setOrder(found ?? null)
        } catch {
          if (!cancelled) setOrder(null)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id, router, user])

  if (!user) return null

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-serif text-3xl font-bold">Detalle del Pedido</h1>
            <Link href="/orders">
              <Button variant="outline" className="bg-transparent">
                Volver
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Cargando...</p>
              </CardContent>
            </Card>
          ) : !order ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Pedido no encontrado.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">ID</p>
                    <p className="font-mono font-semibold">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="font-medium">{new Date(order.createdAt).toLocaleDateString("es-ES")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <p className="font-semibold">{getStatusText(order.status)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold font-serif text-xl">${order.total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
