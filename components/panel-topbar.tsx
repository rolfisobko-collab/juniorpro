"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShoppingBag, RefreshCw } from "lucide-react"
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
    <div className="min-h-10 flex-shrink-0 border-b border-white/[0.05] bg-[#0d1117] px-3 py-2 sm:px-5">
      {/* Izquierda: alertas pedidos */}
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {urgentCount > 0 ? (
            <Link href="/panel/orders"
              className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-amber-400 transition-colors hover:text-amber-300">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
              </span>
              <span className="whitespace-nowrap">{urgentCount} pedido{urgentCount !== 1 ? "s" : ""} sin despachar</span>
            </Link>
          ) : pendingOrders !== null ? (
            <span className="flex items-center gap-1.5 whitespace-nowrap text-xs text-gray-600">
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
              className="whitespace-nowrap rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2 py-0.5 text-[10px] font-semibold text-yellow-500 transition-colors hover:bg-yellow-500/20">
              {pendingOrders} pendiente{pendingOrders !== 1 ? "s" : ""}
            </Link>
          )}
          {processingOrders !== null && processingOrders > 0 && (
            <Link href="/panel/orders?status=processing"
              className="whitespace-nowrap rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 transition-colors hover:bg-blue-500/20">
              {processingOrders} preparando
            </Link>
          )}
        </div>

        {/* Derecha: cotizaciones */}
        <div className="ml-0 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 lg:ml-auto">
          {displayRates.length === 0 && (
            <span className="whitespace-nowrap text-[10px] text-gray-700">Cargando cotizaciones...</span>
          )}
          {displayRates.map(r => (
            <Link key={r.id} href="/panel/exchange-rates"
              className="flex items-center gap-1.5 whitespace-nowrap text-xs text-gray-500 transition-colors hover:text-gray-300">
              <span className="font-mono text-[10px] text-gray-600">{r.currency}/USD</span>
              <span className="font-semibold tabular-nums text-gray-300">
                {r.rate >= 100
                  ? r.rate.toLocaleString("es-PY", { maximumFractionDigits: 0 })
                  : r.rate.toFixed(2)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
