"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

  return (
    <PanelLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Bienvenido, {admin?.name}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {mainStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentOrders.length ? (
                  stats.recentOrders.map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.customer} • {activity.time}
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        ${activity.total.toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No hay actividad reciente</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen Rápido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quickStats.map((stat, idx) => {
                  const Icon = stat.icon
                  return (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{stat.label}</span>
                      </div>
                      <span className={`text-sm font-bold ${stat.color}`}>
                        {stat.value}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PanelLayout>
  )
}
