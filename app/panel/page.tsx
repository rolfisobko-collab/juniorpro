"use client"

import { useAdmin } from "@/lib/admin-context"
import { Package, ShoppingBag, Users, Eye, ShoppingCart, Loader2 } from "lucide-react"
import { PanelLayout } from "@/components/panel-layout"
import { useState, useEffect } from "react"

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalUsers: number
  pendingOrders: number
  lowStockProducts: number
  outOfStockProducts: number
  totalCategories: number
  todayOrders: number
  monthOrders: number
  completedOrders: number
  totalRevenue: number
  averageOrderValue: number
  recentOrders: Array<{
    id: string
    action: string
    time: string
    customer: string
    total: number
  }>
}

export default function AdminDashboard() {
  const { admin } = useAdmin()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/dashboard-stats", {
          credentials: "include"
        })
        
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const mainStats = stats ? [
    {
      title: "Pedidos del Mes",
      value: stats.monthOrders.toLocaleString(),
      icon: ShoppingBag,
      color: "text-blue-600"
    },
    {
      title: "Órdenes Completadas",
      value: stats.completedOrders.toLocaleString(),
      icon: ShoppingBag,
      color: "text-green-600"
    },
    {
      title: "Usuarios",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "Productos",
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: "text-orange-600"
    },
  ] : []

  const quickStats = stats ? [
    {
      icon: ShoppingBag,
      label: "Pedidos Hoy",
      value: stats.todayOrders,
      color: stats.todayOrders > 0 ? "text-green-600" : "text-gray-900"
    },
    {
      icon: Package,
      label: "Productos con Bajo Stock",
      value: stats.lowStockProducts,
      color: stats.lowStockProducts > 0 ? "text-orange-500" : "text-gray-900"
    },
    {
      icon: Package,
      label: "Sin Stock",
      value: stats.outOfStockProducts,
      color: stats.outOfStockProducts > 0 ? "text-red-500" : "text-gray-900"
    },
    {
      icon: ShoppingBag,
      label: "Pedidos Pendientes",
      value: stats.pendingOrders,
      color: stats.pendingOrders > 0 ? "text-blue-500" : "text-gray-900"
    },
    {
      icon: Eye,
      label: "Ticket Promedio",
      value: `$${stats.averageOrderValue.toFixed(0)}`,
      color: "text-purple-600"
    },
    {
      icon: Package,
      label: "Categorías",
      value: stats.totalCategories,
      color: "text-indigo-600"
    },
  ] : []

  if (loading) {
    return (
      <PanelLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Cargando estadísticas...</span>
          </div>
        </div>
      </PanelLayout>
    )
  }

  const now = new Date()
  const greeting = now.getHours() < 12 ? "Buenos días" : now.getHours() < 19 ? "Buenas tardes" : "Buenas noches"

  return (
    <PanelLayout>
      <div className="p-6 lg:p-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-gray-400 mb-1">{greeting}, <span className="text-gray-700 font-semibold">{admin?.name}</span></p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        </div>

        {/* Stats principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Pedidos del mes", value: stats?.monthOrders ?? "—", icon: ShoppingBag, bg: "bg-blue-50", iconBg: "bg-blue-100", iconColor: "text-blue-600", border: "border-blue-100" },
            { label: "Completados", value: stats?.completedOrders ?? "—", icon: ShoppingCart, bg: "bg-emerald-50", iconBg: "bg-emerald-100", iconColor: "text-emerald-600", border: "border-emerald-100" },
            { label: "Usuarios", value: stats?.totalUsers ?? "—", icon: Users, bg: "bg-violet-50", iconBg: "bg-violet-100", iconColor: "text-violet-600", border: "border-violet-100" },
            { label: "Productos", value: stats?.totalProducts ?? "—", icon: Package, bg: "bg-orange-50", iconBg: "bg-orange-100", iconColor: "text-orange-600", border: "border-orange-100" },
          ].map(({ label, value, icon: Icon, bg, iconBg, iconColor, border }) => (
            <div key={label} className={`${bg} border ${border} rounded-2xl p-5`}>
              <div className={`h-10 w-10 ${iconBg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              <p className="text-2xl font-black text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Actividad Reciente */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900">Actividad Reciente</h2>
              <Eye className="h-4 w-4 text-gray-300" />
            </div>
            <div className="space-y-3">
              {stats?.recentOrders.length ? (
                stats.recentOrders.map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#009FE3]/10 flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="h-3.5 w-3.5 text-[#009FE3]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{activity.action}</p>
                      <p className="text-xs text-gray-400 truncate">{activity.customer} · {activity.time}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-700 flex-shrink-0">${activity.total.toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">Sin actividad reciente</p>
              )}
            </div>
          </div>

          {/* Resumen rápido */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900">Resumen Rápido</h2>
              <ShoppingCart className="h-4 w-4 text-gray-300" />
            </div>
            <div className="space-y-2">
              {[
                { label: "Pedidos hoy", value: stats?.todayOrders ?? "—", alert: (stats?.todayOrders ?? 0) > 0 ? "emerald" : null },
                { label: "Bajo stock", value: stats?.lowStockProducts ?? "—", alert: (stats?.lowStockProducts ?? 0) > 0 ? "orange" : null },
                { label: "Sin stock", value: stats?.outOfStockProducts ?? "—", alert: (stats?.outOfStockProducts ?? 0) > 0 ? "red" : null },
                { label: "Pedidos pendientes", value: stats?.pendingOrders ?? "—", alert: (stats?.pendingOrders ?? 0) > 0 ? "blue" : null },
                { label: "Ticket promedio", value: stats ? `$${stats.averageOrderValue.toFixed(0)}` : "—", alert: null },
                { label: "Categorías", value: stats?.totalCategories ?? "—", alert: null },
              ].map(({ label, value, alert }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className={`text-sm font-bold ${
                    alert === 'red' ? 'text-red-500' :
                    alert === 'orange' ? 'text-orange-500' :
                    alert === 'emerald' ? 'text-emerald-600' :
                    alert === 'blue' ? 'text-blue-600' :
                    'text-gray-900'
                  }`}>{typeof value === 'number' ? value.toLocaleString() : value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PanelLayout>
  )
}
