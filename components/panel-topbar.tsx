"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShoppingBag, DollarSign, RefreshCw, AlertCircle } from "lucide-react"
import { useAdmin } from "@/lib/admin-context"

interface Rate {
  id: string; currency: string; rate: number; isActive: boolean
}

export function PanelTopbar() {
  const { admin } = useAdmin()
  const [pendingOrders, setPendingOrders] = useState<number | null>(null)
  const [processingOrders, setProcessingOrders] = useState<number | null>(null)
  const [rates, setRates] = useState<Rate[]>([])

  useEffect(() => {
    // Pedidos pendientes
    fetch("/api/admin/dashboard-stats", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (d.stats) {
          setPendingOrders(d.stats.pendingOrders ?? 0)
          setProcessingOrders(d.stats.processingOrders ?? 0)
        }
      })
      .catch(() => {})

    // Tasas de cambio
    fetch("/api/exchange-rates")
      .then(r => r.json())
      .then(d => { if (d.rates) setRates(d.rates.filter((r: Rate) => r.isActive)) })
      .catch(() => {})
  }, [])

  const urgentCount = (pendingOrders ?? 0) + (processingOrders ?? 0)
  const displayRates = rates.filter(r => r.currency !== "USD").slice(0, 3)

  return (
    <div className="h-10 bg-[#0d1117] border-b border-white/[0.05] flex items-center justify-between px-5 flex-shrink-0">
      {/* Izquierda: alertas pedidos */}
      <div className="flex items-center gap-3">
        {urgentCount > 0 ? (
          <Link href="/panel/orders"
            className="flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors group">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            {urgentCount} pedido{urgentCount !== 1 ? "s" : ""} sin despachar
          </Link>
        ) : pendingOrders !== null ? (
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <ShoppingBag className="h-3 w-3" />
            Sin pedidos urgentes
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-gray-700">
            <RefreshCw className="h-3 w-3 animate-spin" />
          </span>
        )}

        {pendingOrders !== null && pendingOrders > 0 && (
          <Link href="/panel/orders?status=pending"
            className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 font-semibold hover:bg-yellow-500/20 transition-colors">
            {pendingOrders} pendiente{pendingOrders !== 1 ? "s" : ""}
          </Link>
        )}
        {processingOrders !== null && processingOrders > 0 && (
          <Link href="/panel/orders?status=processing"
            className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold hover:bg-blue-500/20 transition-colors">
            {processingOrders} preparando
          </Link>
        )}
      </div>

      {/* Derecha: cotizaciones */}
      <div className="flex items-center gap-4">
        {displayRates.length === 0 && (
          <span className="text-[10px] text-gray-700">Cargando cotizaciones...</span>
        )}
        {displayRates.map(r => (
          <Link key={r.id} href="/panel/exchange-rates"
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors">
            <span className="text-gray-600 font-mono text-[10px]">{r.currency}/USD</span>
            <span className="text-gray-300 font-semibold tabular-nums">
              {r.rate >= 100
                ? r.rate.toLocaleString("es-PY", { maximumFractionDigits: 0 })
                : r.rate.toFixed(2)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
