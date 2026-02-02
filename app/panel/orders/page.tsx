"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Package } from "lucide-react"
import PanelLayout from "@/components/panel-layout"
import AEXLabelPrint from "@/components/aex-label-print"

interface OrderItem {
  id: string
  name: string
  image: string
  price: number
  quantity: number
  weight?: number
  length?: number
  width?: number
  height?: number
}

interface Order {
  id: string
  createdAt: string
  status: "processing" | "shipped" | "delivered" | "cancelled"
  total: number
  items: OrderItem[]
  shippingMethod?: string
  shippingCity?: string
  shippingState?: string
  shippingAddress?: string
  contactEmail?: string
  contactPhone?: string
}

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | Order["status"]>("all")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const res = await fetch("/api/admin/orders", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })

      if (!res.ok) return

      const data = (await res.json()) as { orders?: Order[] }
      if (!cancelled) setOrders(data.orders ?? [])
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "delivered":
        return "Entregado"
      case "processing":
        return "Procesando"
      case "shipped":
        return "Enviado"
      default:
        return status
    }
  }

  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    void fetch(`/api/admin/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: newStatus }),
    })

    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground">Gestiona los pedidos de los clientes</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID o producto..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | Order["status"])}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="processing">Procesando</SelectItem>
            <SelectItem value="shipped">Enviado</SelectItem>
            <SelectItem value="delivered">Entregado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Pedido</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Envío</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-sm">{order.id}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString("es-ES")}</TableCell>
                <TableCell>{order.items.length} producto(s)</TableCell>
                <TableCell className="font-semibold">${order.total.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">
                      {order.shippingMethod === "aex" && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          🚚 AEX
                        </Badge>
                      )}
                      {order.shippingMethod === "convenir" && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          🏪 Convenir
                        </Badge>
                      )}
                      {order.shippingMethod === "local" && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          🏠 Retiro Local
                        </Badge>
                      )}
                    </div>
                    {order.shippingCity && (
                      <div className="text-xs text-muted-foreground">
                        {order.shippingCity}, {order.shippingState}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onValueChange={(value) => handleStatusChange(order.id, value as Order["status"])}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue>
                        <Badge className={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="processing">Procesando</SelectItem>
                      <SelectItem value="shipped">Enviado</SelectItem>
                      <SelectItem value="delivered">Entregado</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center gap-2">
                    {order.shippingMethod === "aex" && (
                      <AEXLabelPrint
                        orderId={order.id}
                        origin="Asunción"
                        destination={`${order.shippingCity}, ${order.shippingState}`}
                        packages={order.items.map(item => ({
                          peso: item.weight || 1,
                          largo: item.length || 15,
                          ancho: item.width || 10,
                          alto: item.height || 5,
                          descripcion: item.name
                        }))}
                        recipient={{
                          name: "Cliente",
                          phone: order.contactPhone || "",
                          email: order.contactEmail || ""
                        }}
                        />
                    )}
                    <Link href={`/panel/orders/${order.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default function AdminOrdersPage() {
  return (
    <PanelLayout>
      <Suspense fallback={<div className="p-8">Cargando pedidos...</div>}>
        <OrdersContent />
      </Suspense>
    </PanelLayout>
  )
}
