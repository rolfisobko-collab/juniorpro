"use client"

import { useCallback, useEffect, useState } from "react"
import PanelLayout from "@/components/panel-layout"
import {
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Copy,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react"

interface OrderItem {
  id: string
  name: string
  image: string
  price: number
  quantity: number
  product?: { id: string; name: string; image: string }
}

interface StatusHistory {
  id: string
  status: string
  note: string | null
  createdAt: string
}

interface Order {
  id: string
  createdAt: string
  updatedAt: string
  status: string
  total: number
  shippingCost: number | null
  shippingAddress: string
  shippingCity: string
  shippingState: string
  shippingMethod: string
  contactEmail: string
  contactPhone: string
  paymentMethod: string | null
  paymentStatus: string | null
  trackingNumber: string | null
  aexShipmentId: string | null
  boxName: string | null
  items: OrderItem[]
  user?: { id: string; name: string | null; email: string }
  statusHistory: StatusHistory[]
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  pending: { label: "Pendiente", dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  processing: { label: "Preparando", dot: "bg-blue-400", text: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  shipped: { label: "Enviado", dot: "bg-purple-400", text: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  delivered: { label: "Finalizado", dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  cancelled: { label: "Cancelado", dot: "bg-red-400", text: "text-red-700", bg: "bg-red-50 border-red-200" },
}

const PAY_CONFIG: Record<string, { label: string; dot: string; text: string }> = {
  paid: { label: "Pago confirmado", dot: "bg-emerald-400", text: "text-emerald-700" },
  pending: { label: "Pago pendiente", dot: "bg-amber-400", text: "text-amber-700" },
  failed: { label: "Pago rechazado", dot: "bg-red-400", text: "text-red-700" },
}

const SHIPPING_LABEL: Record<string, string> = {
  aex: "Envio a coordinar",
  local: "Retiro en local",
  "retiro-local": "Retiro en local",
  convenir: "Envio a coordinar",
}

const ORDER_FLOW = ["pending", "processing", "shipped", "delivered"]

function fmt(d: string) {
  return new Date(d).toLocaleDateString("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function fmtMoney(n: number) {
  return `$${n.toLocaleString("es-PY")}`
}

function shortId(id: string) {
  return id.slice(-8).toUpperCase()
}

function orderMeta(order: Order) {
  const chunks = (order.shippingAddress || "").split("|").map((chunk) => chunk.trim()).filter(Boolean)
  const customerName = chunks.find((chunk) => chunk.toLowerCase().startsWith("cliente:"))?.replace(/^cliente:\s*/i, "").trim()
  const notes = chunks.find((chunk) => chunk.toLowerCase().startsWith("notas:"))?.replace(/^notas:\s*/i, "").trim()
  const cleanAddress = chunks.filter((chunk) => !/^cliente:/i.test(chunk) && !/^notas:/i.test(chunk)).join(" | ")

  return {
    customerName: customerName || (order.user?.email === "cliente@web.com" ? "" : order.user?.name) || order.contactEmail,
    notes,
    address: cleanAddress || order.shippingAddress,
  }
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

function PayBadge({ status }: { status: string | null }) {
  const config = PAY_CONFIG[status ?? "pending"] ?? PAY_CONFIG.pending
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

function OrderDrawer({
  order,
  onClose,
  onUpdate,
}: {
  order: Order
  onClose: () => void
  onUpdate: (updated: Partial<Order> & { id: string }) => void
}) {
  const [noteInput, setNoteInput] = useState("")
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [loadingPay, setLoadingPay] = useState(false)
  const [copied, setCopied] = useState(false)
  const meta = orderMeta(order)
  const flowIndex = ORDER_FLOW.indexOf(order.status)
  const nextStatus = ORDER_FLOW[flowIndex + 1]
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const waLink = `https://wa.me/${(order.contactPhone || "").replace(/\D/g, "")}?text=Hola! Te escribimos por tu pedido %23${shortId(order.id)} de TechZone.`

  const advanceStatus = async (toStatus: string, note?: string) => {
    setLoadingStatus(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: toStatus, note: note || noteInput || undefined }),
      })
      if (res.ok) {
        onUpdate({ id: order.id, status: toStatus, statusHistory: [] })
        setNoteInput("")
      }
    } finally {
      setLoadingStatus(false)
    }
  }

  const registerPayment = async (method: string) => {
    setLoadingPay(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/payment`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: "paid", paymentMethod: method }),
      })
      if (res.ok) {
        onUpdate({ id: order.id, paymentStatus: "paid", paymentMethod: method, statusHistory: [] })
      }
    } finally {
      setLoadingPay(false)
    }
  }

  const cancelOrder = () => advanceStatus("cancelled", "Pedido cancelado desde el panel")

  const copyPhone = () => {
    if (!order.contactPhone) return
    navigator.clipboard.writeText(order.contactPhone)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="flex h-full w-full max-w-[560px] flex-col overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
          <div>
            <p className="font-mono text-xs text-gray-400">#{shortId(order.id)}</p>
            <h2 className="text-base font-bold leading-tight text-gray-900">{meta.customerName}</h2>
            <p className="text-xs text-gray-400">{fmt(order.createdAt)}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 px-5 py-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Estado del pedido</p>
              <StatusBadge status={order.status} />
            </div>
            <div className="mb-4 flex items-center gap-1">
              {ORDER_FLOW.map((status, index) => {
                const done = flowIndex >= index && order.status !== "cancelled"
                const active = flowIndex === index
                return (
                  <div key={status} className="flex flex-1 items-center">
                    <div className={`h-2 flex-1 rounded-full ${done ? "bg-[#009FE3]" : "bg-gray-200"} ${active ? "ring-2 ring-[#009FE3]/30" : ""}`} />
                    {index < ORDER_FLOW.length - 1 && <div className="w-1" />}
                  </div>
                )
              })}
            </div>
            <div className="mb-4 flex justify-between text-[10px] text-gray-400">
              {ORDER_FLOW.map((status) => (
                <span key={status}>{STATUS_CONFIG[status].label}</span>
              ))}
            </div>

            {order.status !== "delivered" && order.status !== "cancelled" && (
              <div className="space-y-3">
                {order.paymentStatus !== "paid" && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-amber-800">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Pago pendiente. Confirmalo cuando la operadora cierre con el cliente.
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => registerPayment("efectivo")} disabled={loadingPay} className="rounded-lg bg-amber-600 px-2 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50">
                        Efectivo
                      </button>
                      <button onClick={() => registerPayment("transferencia")} disabled={loadingPay} className="rounded-lg bg-amber-600 px-2 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50">
                        Transferencia
                      </button>
                      <button onClick={() => registerPayment("otro")} disabled={loadingPay} className="rounded-lg bg-amber-600 px-2 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50">
                        Otro
                      </button>
                    </div>
                  </div>
                )}

                <input
                  value={noteInput}
                  onChange={(event) => setNoteInput(event.target.value)}
                  placeholder="Nota interna opcional..."
                  className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#009FE3] focus:ring-2 focus:ring-[#009FE3]/10"
                />

                <div className="grid grid-cols-2 gap-2">
                  {nextStatus && (
                    <button onClick={() => advanceStatus(nextStatus)} disabled={loadingStatus} className="col-span-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#009FE3] text-sm font-semibold text-white hover:bg-[#0088c7] disabled:opacity-50 sm:col-span-1">
                      {loadingStatus ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                      Pasar a {STATUS_CONFIG[nextStatus]?.label}
                    </button>
                  )}
                  <a href={waLink} target="_blank" rel="noreferrer" className="flex h-11 items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 text-sm font-semibold text-green-700 hover:bg-green-100">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                  <button onClick={cancelOrder} disabled={loadingStatus} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
                    <XCircle className="h-4 w-4" />
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Cliente</p>
            <p className="text-sm font-semibold text-gray-900">{meta.customerName || "Cliente web"}</p>
            <div className="mt-2 space-y-2">
              <a href={`mailto:${order.contactEmail}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#009FE3]">
                <Mail className="h-3.5 w-3.5" />
                {order.contactEmail}
              </a>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs text-gray-500">{order.contactPhone}</span>
                <button onClick={copyPhone} className="ml-auto flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800">
                  {copied ? "Copiado" : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-500">
                <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                <span>{meta.address}{order.shippingCity ? `, ${order.shippingCity}` : ""}{order.shippingState ? `, ${order.shippingState}` : ""}</span>
              </div>
              {meta.notes && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                  <span className="font-semibold">Nota del cliente: </span>
                  {meta.notes}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Pago</p>
              <PayBadge status={order.paymentStatus} />
              <p className="mt-1 text-xs text-gray-400">{order.paymentMethod || "A coordinar"}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Entrega</p>
              <p className="text-sm font-semibold text-gray-700">{SHIPPING_LABEL[order.shippingMethod] || order.shippingMethod}</p>
              <p className="mt-1 text-xs text-gray-400">Costo a coordinar</p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Productos ({order.items.length})</p>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                  <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
                    {(item.product?.image || item.image) && <img src={item.product?.image || item.image} alt={item.name} className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{item.product?.name || item.name}</p>
                    <p className="text-xs text-gray-400">x{item.quantity} - {fmtMoney(item.price)} c/u</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{fmtMoney(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1 border-t border-gray-100 pt-3">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Subtotal</span>
                <span>{fmtMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Envio</span>
                <span>A coordinar</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-bold text-gray-900">
                <span>Total productos</span>
                <span>{fmtMoney(order.total)}</span>
              </div>
            </div>
          </div>

          {order.statusHistory.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Historial</p>
              <div className="space-y-2">
                {order.statusHistory.map((history, index) => (
                  <div key={history.id || index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${STATUS_CONFIG[history.status]?.dot ?? "bg-gray-300"}`} />
                      {index < order.statusHistory.length - 1 && <div className="mt-1 w-px flex-1 bg-gray-200" />}
                    </div>
                    <div className="pb-3">
                      <p className="text-xs font-semibold text-gray-700">{STATUS_CONFIG[history.status]?.label ?? history.status}</p>
                      {history.note && <p className="text-xs text-gray-400">{history.note}</p>}
                      <p className="mt-0.5 text-[10px] text-gray-300">{fmt(history.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selected, setSelected] = useState<Order | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/orders", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = orders.filter((order) => {
    const term = search.toLowerCase()
    const meta = orderMeta(order)
    const matchSearch =
      !term ||
      order.id.toLowerCase().includes(term) ||
      meta.customerName.toLowerCase().includes(term) ||
      order.contactEmail.toLowerCase().includes(term) ||
      order.contactPhone.includes(term) ||
      order.shippingCity.toLowerCase().includes(term) ||
      meta.address.toLowerCase().includes(term)
    const matchStatus = statusFilter === "all" || order.status === statusFilter
    return matchSearch && matchStatus
  })

  const counts = {
    all: orders.length,
    pending: orders.filter((order) => order.status === "pending").length,
    processing: orders.filter((order) => order.status === "processing").length,
    shipped: orders.filter((order) => order.status === "shipped").length,
    delivered: orders.filter((order) => order.status === "delivered").length,
    cancelled: orders.filter((order) => order.status === "cancelled").length,
  }

  const handleUpdate = (updated: Partial<Order> & { id: string }) => {
    setOrders((current) => current.map((order) => (order.id === updated.id ? { ...order, ...updated } : order)))
    setSelected((current) => (current?.id === updated.id ? { ...current, ...updated } : current))
    fetch(`/api/admin/orders/${updated.id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.order) {
          setOrders((current) => current.map((order) => (order.id === data.order.id ? data.order : order)))
          setSelected(data.order)
        }
      })
      .catch(() => {})
  }

  const tabs = [
    { key: "all", label: "Todos" },
    { key: "pending", label: "Pendientes" },
    { key: "processing", label: "Preparando" },
    { key: "shipped", label: "Enviados" },
    { key: "delivered", label: "Finalizados" },
    { key: "cancelled", label: "Cancelados" },
  ]

  return (
    <PanelLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Pedidos</h1>
            <p className="mt-0.5 text-sm text-gray-400">{orders.length} pedido{orders.length !== 1 ? "s" : ""} en total</p>
          </div>
          <button onClick={load} className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition-colors hover:bg-gray-50">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="mb-4 flex gap-1 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === tab.key ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {tab.label}
              {counts[tab.key as keyof typeof counts] > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${statusFilter === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {counts[tab.key as keyof typeof counts]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, email, telefono, ciudad o direccion..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-[#009FE3] focus:ring-2 focus:ring-[#009FE3]/10"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-300" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Package className="mx-auto mb-3 h-10 w-10 text-gray-200" />
            <p className="text-sm text-gray-400">No hay pedidos</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((order) => {
              const statusConfig = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
              const payConfig = PAY_CONFIG[order.paymentStatus ?? "pending"] ?? PAY_CONFIG.pending
              const isSelected = selected?.id === order.id
              const meta = orderMeta(order)
              return (
                <button
                  key={order.id}
                  onClick={() => setSelected(order)}
                  className={`flex w-full items-center gap-4 rounded-2xl border bg-white px-4 py-3 text-left transition-all hover:border-[#009FE3]/40 hover:shadow-sm ${
                    isSelected ? "border-[#009FE3] shadow-sm ring-1 ring-[#009FE3]/20" : "border-gray-100"
                  }`}
                >
                  <div className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${statusConfig.dot}`} />
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-gray-900">{meta.customerName}</span>
                      <span className="flex-shrink-0 font-mono text-[10px] text-gray-400">#{shortId(order.id)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{order.shippingCity || "Sin ciudad"}</span>
                      <span>-</span>
                      <span>{SHIPPING_LABEL[order.shippingMethod] || order.shippingMethod}</span>
                      <span>-</span>
                      <span>{fmt(order.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-3">
                    <span className={`text-[10px] font-semibold ${payConfig.text}`}>{payConfig.label}</span>
                    <span className="text-sm font-bold text-gray-900">{fmtMoney(order.total)}</span>
                    <StatusBadge status={order.status} />
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {selected && <OrderDrawer order={selected} onClose={() => setSelected(null)} onUpdate={handleUpdate} />}
    </PanelLayout>
  )
}
