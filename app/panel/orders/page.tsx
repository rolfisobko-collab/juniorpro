"use client"

import { useEffect, useState, useCallback } from "react"
import PanelLayout from "@/components/panel-layout"
import {
  Search, X, ChevronRight, Phone, Mail, MapPin, Package,
  CreditCard, Truck, CheckCircle, Clock, XCircle, RefreshCw,
  Copy, MessageCircle, ArrowRight, AlertCircle
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────
interface OrderItem {
  id: string; name: string; image: string; price: number; quantity: number
  product?: { id: string; name: string; image: string }
}
interface StatusHistory {
  id: string; status: string; note: string | null; createdAt: string
}
interface Order {
  id: string; createdAt: string; updatedAt: string
  status: string; total: number; shippingCost: number | null
  shippingAddress: string; shippingCity: string; shippingState: string
  shippingMethod: string; contactEmail: string; contactPhone: string
  paymentMethod: string | null; paymentStatus: string | null
  trackingNumber: string | null; aexShipmentId: string | null; boxName: string | null
  items: OrderItem[]
  user?: { id: string; name: string; email: string }
  statusHistory: StatusHistory[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  pending:    { label: "Pendiente",   dot: "bg-yellow-400", text: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
  processing: { label: "Preparando",  dot: "bg-blue-400",   text: "text-blue-700",   bg: "bg-blue-50 border-blue-200"   },
  shipped:    { label: "Enviado",     dot: "bg-purple-400", text: "text-purple-700", bg: "bg-purple-50 border-purple-200"},
  delivered:  { label: "Entregado",   dot: "bg-green-400",  text: "text-green-700",  bg: "bg-green-50 border-green-200" },
  cancelled:  { label: "Cancelado",   dot: "bg-red-400",    text: "text-red-700",    bg: "bg-red-50 border-red-200"     },
}
const PAY_CONFIG: Record<string, { label: string; dot: string; text: string }> = {
  paid:    { label: "Pagado",   dot: "bg-green-400", text: "text-green-700" },
  pending: { label: "Pendiente",dot: "bg-yellow-400",text: "text-yellow-700"},
  failed:  { label: "Fallido",  dot: "bg-red-400",   text: "text-red-700"   },
}
const SHIPPING_LABEL: Record<string, string> = {
  aex: "AEX", local: "Retiro en local", convenir: "A convenir",
}
const ORDER_FLOW: string[] = ["pending", "processing", "shipped", "delivered"]

function fmt(d: string) {
  return new Date(d).toLocaleDateString("es-PY", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })
}
function fmtMoney(n: number) { return `$${n.toLocaleString("es-PY")}` }
function shortId(id: string) { return id.slice(-8).toUpperCase() }

// ─── StatusBadge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const c = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}

// ─── PayBadge ─────────────────────────────────────────────────────────────────
function PayBadge({ status }: { status: string | null }) {
  const c = PAY_CONFIG[status ?? "pending"] ?? PAY_CONFIG.pending
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}

// ─── OrderDrawer ──────────────────────────────────────────────────────────────
function OrderDrawer({ order, onClose, onUpdate }: {
  order: Order; onClose: () => void
  onUpdate: (updated: Partial<Order> & { id: string }) => void
}) {
  const [trackingInput, setTrackingInput] = useState(order.trackingNumber ?? "")
  const [noteInput, setNoteInput] = useState("")
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [loadingPay, setLoadingPay] = useState(false)
  const [copied, setCopied] = useState(false)

  const nextStatus = ORDER_FLOW[ORDER_FLOW.indexOf(order.status) + 1]

  const advanceStatus = async (toStatus: string, note?: string, tracking?: string) => {
    setLoadingStatus(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: toStatus, note: note || noteInput || undefined, trackingNumber: tracking || undefined }),
      })
      if (res.ok) {
        onUpdate({ id: order.id, status: toStatus, trackingNumber: tracking ?? order.trackingNumber, statusHistory: [] })
        setNoteInput("")
      }
    } finally { setLoadingStatus(false) }
  }

  const cancelOrder = () => advanceStatus("cancelled", "Pedido cancelado por admin")

  const dispatch = async () => {
    if (order.shippingMethod === "aex" && !trackingInput.trim()) {
      alert("Ingresá el número de tracking AEX antes de marcar como enviado.")
      return
    }
    await advanceStatus("shipped", noteInput || "Pedido despachado", trackingInput || undefined)
    if (trackingInput) onUpdate({ id: order.id, trackingNumber: trackingInput, status: "shipped", statusHistory: [] })
  }

  const registerPayment = async (method: string) => {
    setLoadingPay(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/payment`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: "paid", paymentMethod: method }),
      })
      if (res.ok) onUpdate({ id: order.id, paymentStatus: "paid", paymentMethod: method, statusHistory: [] })
    } finally { setLoadingPay(false) }
  }

  const copyTracking = () => {
    if (order.trackingNumber) { navigator.clipboard.writeText(order.trackingNumber); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  }

  const waLink = `https://wa.me/${(order.contactPhone || "").replace(/\D/g, "")}?text=Hola! Tu pedido %23${shortId(order.id)} `

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* panel */}
      <div className="w-full max-w-[520px] bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        {/* header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-xs text-gray-400 font-mono">#{shortId(order.id)}</p>
            <h2 className="text-base font-bold text-gray-900 leading-tight">
              {order.user?.name || order.contactEmail}
            </h2>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 px-5 py-4 space-y-5">

          {/* Estado actual + flujo */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estado del pedido</p>
              <StatusBadge status={order.status} />
            </div>

            {/* Timeline */}
            <div className="flex items-center gap-1 mb-4">
              {ORDER_FLOW.map((s, i) => {
                const idx = ORDER_FLOW.indexOf(order.status)
                const done = i <= idx && order.status !== "cancelled"
                const active = i === idx
                return (
                  <div key={s} className="flex-1 flex items-center">
                    <div className={`h-2 rounded-full flex-1 transition-colors ${done ? "bg-[#009FE3]" : "bg-gray-200"} ${active ? "ring-2 ring-[#009FE3]/30" : ""}`} />
                    {i < ORDER_FLOW.length - 1 && <div className="w-1" />}
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mb-4">
              {ORDER_FLOW.map(s => <span key={s}>{STATUS_CONFIG[s].label}</span>)}
            </div>

            {/* Botones de acción */}
            {order.status !== "delivered" && order.status !== "cancelled" && (
              <div className="space-y-2">
                {/* Confirmación de pago si está pendiente */}
                {order.paymentStatus !== "paid" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-2">
                    <p className="text-xs font-semibold text-yellow-700 mb-2 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> Pago no confirmado — registrar pago en local
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => registerPayment("efectivo")} disabled={loadingPay}
                        className="flex-1 py-1.5 text-xs font-semibold bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50">
                        💵 Efectivo
                      </button>
                      <button onClick={() => registerPayment("transferencia")} disabled={loadingPay}
                        className="flex-1 py-1.5 text-xs font-semibold bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50">
                        🏦 Transferencia
                      </button>
                      <button onClick={() => registerPayment("bancard")} disabled={loadingPay}
                        className="flex-1 py-1.5 text-xs font-semibold bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50">
                        💳 Bancard
                      </button>
                    </div>
                  </div>
                )}

                {/* Tracking AEX */}
                {order.shippingMethod === "aex" && order.status !== "shipped" && (
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Tracking AEX (requerido para despachar)</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        value={trackingInput}
                        onChange={e => setTrackingInput(e.target.value)}
                        placeholder="Ej: AEX-12345678"
                        className="flex-1 h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#009FE3]"
                      />
                    </div>
                  </div>
                )}

                {/* Nota opcional */}
                <div>
                  <input
                    value={noteInput}
                    onChange={e => setNoteInput(e.target.value)}
                    placeholder="Nota interna (opcional)..."
                    className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#009FE3]"
                  />
                </div>

                {/* Botón acción principal */}
                <div className="flex gap-2">
                  {order.status === "processing" ? (
                    <button onClick={dispatch} disabled={loadingStatus}
                      className="flex-1 h-10 bg-[#009FE3] hover:bg-[#0088c7] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                      {loadingStatus ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                      Despachar pedido
                    </button>
                  ) : order.status === "shipped" ? (
                    <button onClick={() => advanceStatus("delivered")} disabled={loadingStatus}
                      className="flex-1 h-10 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                      {loadingStatus ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      Marcar entregado
                    </button>
                  ) : nextStatus ? (
                    <button onClick={() => advanceStatus(nextStatus)} disabled={loadingStatus}
                      className="flex-1 h-10 bg-[#009FE3] hover:bg-[#0088c7] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                      {loadingStatus ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                      Avanzar a {STATUS_CONFIG[nextStatus]?.label}
                    </button>
                  ) : null}
                  {order.status !== "cancelled" && order.status !== "delivered" && (
                    <button onClick={cancelOrder} disabled={loadingStatus}
                      className="h-10 px-3 border border-red-200 text-red-500 hover:bg-red-50 text-sm rounded-xl transition-colors">
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Tracking activo */}
            {order.trackingNumber && (
              <div className="mt-3 flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-3 py-2">
                <Truck className="h-4 w-4 text-purple-500 flex-shrink-0" />
                <span className="text-xs font-mono text-purple-700 flex-1">{order.trackingNumber}</span>
                <button onClick={copyTracking} className="text-xs text-purple-500 hover:text-purple-700 transition-colors">
                  {copied ? "✓" : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Cliente */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Cliente</p>
            <p className="text-sm font-semibold text-gray-900">{order.user?.name || "—"}</p>
            <div className="mt-2 space-y-1.5">
              <a href={`mailto:${order.contactEmail}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#009FE3]">
                <Mail className="h-3.5 w-3.5" />{order.contactEmail}
              </a>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs text-gray-500">{order.contactPhone}</span>
                <a href={waLink} target="_blank" rel="noreferrer"
                  className="ml-auto flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium">
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </a>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-500">
                <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span>{order.shippingAddress}, {order.shippingCity}, {order.shippingState}</span>
              </div>
            </div>
          </div>

          {/* Pago + Envío */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pago</p>
              <PayBadge status={order.paymentStatus} />
              <p className="text-xs text-gray-400 mt-1">{order.paymentMethod || "—"}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Envío</p>
              <p className="text-sm font-semibold text-gray-700">{SHIPPING_LABEL[order.shippingMethod] || order.shippingMethod}</p>
              {order.shippingCost != null && <p className="text-xs text-gray-400 mt-1">{fmtMoney(order.shippingCost)}</p>}
              {order.boxName && <p className="text-xs text-gray-400">{order.boxName}</p>}
            </div>
          </div>

          {/* Productos */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Productos ({order.items.length})</p>
            <div className="space-y-2">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="h-11 w-11 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                    {(item.product?.image || item.image) && (
                      <img src={item.product?.image || item.image} alt={item.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.product?.name || item.name}</p>
                    <p className="text-xs text-gray-400">x{item.quantity} · {fmtMoney(item.price)} c/u</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{fmtMoney(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Subtotal</span>
                <span>{fmtMoney(order.items.reduce((s, i) => s + i.price * i.quantity, 0))}</span>
              </div>
              {order.shippingCost != null && (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Envío</span><span>{fmtMoney(order.shippingCost)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-1">
                <span>Total</span><span>{fmtMoney(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Historial */}
          {order.statusHistory.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Historial</p>
              <div className="space-y-2">
                {order.statusHistory.map((h, i) => (
                  <div key={h.id || i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${STATUS_CONFIG[h.status]?.dot ?? "bg-gray-300"}`} />
                      {i < order.statusHistory.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                    </div>
                    <div className="pb-3">
                      <p className="text-xs font-semibold text-gray-700">{STATUS_CONFIG[h.status]?.label ?? h.status}</p>
                      {h.note && <p className="text-xs text-gray-400">{h.note}</p>}
                      <p className="text-[10px] text-gray-300 mt-0.5">{fmt(h.createdAt)}</p>
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

// ─── Main Page ────────────────────────────────────────────────────────────────
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
      if (res.ok) { const d = await res.json(); setOrders(d.orders ?? []) }
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const filtered = orders.filter(o => {
    const s = search.toLowerCase()
    const matchSearch = !s ||
      o.id.toLowerCase().includes(s) ||
      (o.user?.name ?? "").toLowerCase().includes(s) ||
      o.contactEmail.toLowerCase().includes(s) ||
      o.contactPhone.includes(s) ||
      o.shippingCity.toLowerCase().includes(s)
    const matchStatus = statusFilter === "all" || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  }

  const handleUpdate = (updated: Partial<Order> & { id: string }) => {
    setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, ...updated } : o))
    setSelected(prev => prev?.id === updated.id ? { ...prev, ...updated } : prev)
    // Refetch historial del pedido seleccionado
    if (selected?.id === updated.id) {
      fetch(`/api/admin/orders/${updated.id}`, { credentials: "include" })
        .then(r => r.json())
        .then(d => { if (d.order) { setOrders(prev => prev.map(o => o.id === d.order.id ? d.order : o)); setSelected(d.order) } })
        .catch(() => {})
    }
  }

  const TABS = [
    { key: "all",        label: "Todos"      },
    { key: "pending",    label: "Pendientes" },
    { key: "processing", label: "Preparando" },
    { key: "shipped",    label: "Enviados"   },
    { key: "delivered",  label: "Entregados" },
    { key: "cancelled",  label: "Cancelados" },
  ]

  return (
    <PanelLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pedidos</h1>
            <p className="text-sm text-gray-400 mt-0.5">{orders.length} pedido{orders.length !== 1 ? "s" : ""} en total</p>
          </div>
          <button onClick={load} className="h-9 w-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Tabs de estado */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setStatusFilter(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.key
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}>
              {tab.label}
              {counts[tab.key as keyof typeof counts] > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  statusFilter === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {counts[tab.key as keyof typeof counts]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Búsqueda */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email, teléfono, ciudad..."
            className="w-full h-10 pl-10 pr-4 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#009FE3] focus:ring-2 focus:ring-[#009FE3]/10"
          />
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-300" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-10 w-10 mx-auto mb-3 text-gray-200" />
            <p className="text-gray-400 text-sm">No hay pedidos</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map(order => {
              const sc = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
              const pc = PAY_CONFIG[order.paymentStatus ?? "pending"] ?? PAY_CONFIG.pending
              const isSelected = selected?.id === order.id
              return (
                <button key={order.id} onClick={() => setSelected(order)}
                  className={`w-full text-left bg-white border rounded-2xl px-4 py-3 hover:border-[#009FE3]/40 hover:shadow-sm transition-all flex items-center gap-4 ${
                    isSelected ? "border-[#009FE3] shadow-sm ring-1 ring-[#009FE3]/20" : "border-gray-100"
                  }`}>

                  {/* Status dot */}
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${sc.dot}`} />

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {order.user?.name || order.contactEmail}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 flex-shrink-0">#{shortId(order.id)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{order.shippingCity}</span>
                      <span>·</span>
                      <span>{SHIPPING_LABEL[order.shippingMethod] || order.shippingMethod}</span>
                      <span>·</span>
                      <span>{fmt(order.createdAt)}</span>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Pago */}
                    <span className={`text-[10px] font-semibold ${pc.text}`}>
                      {pc.label}
                    </span>
                    {/* Total */}
                    <span className="text-sm font-bold text-gray-900">{fmtMoney(order.total)}</span>
                    {/* Estado */}
                    <StatusBadge status={order.status} />
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Drawer */}
      {selected && (
        <OrderDrawer
          order={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}
    </PanelLayout>
  )
}
