"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAdmin } from "@/lib/admin-context"
import { Package, ShoppingBag, Users, Eye, ShoppingCart } from "lucide-react"
import { PanelLayout } from "@/components/panel-layout"

export default function AdminDashboard() {
  const { admin } = useAdmin()

  const stats = [
    {
      title: "Visitas Totales del Mes",
      value: "45,231",
      icon: Eye,
    },
    {
      title: "Pedidos",
      value: "234",
      icon: ShoppingBag,
    },
    {
      title: "Productos",
      value: "1,234",
      icon: Package,
    },
    {
      title: "Usuarios",
      value: "2,543",
      icon: Users,
    },
  ]

  const recentActivity = [
    { action: "Nuevo pedido #1234", time: "Hace 5 minutos", icon: ShoppingCart },
    { action: "Producto actualizado", time: "Hace 1 hora", icon: Package },
    { action: "Usuario registrado", time: "Hace 2 horas", icon: Users },
    { action: "Pedido completado #1230", time: "Hace 3 horas", icon: ShoppingBag },
  ]

  return (
    <PanelLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
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
                {recentActivity.map((activity, idx) => {
                  const Icon = activity.icon
                  return (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  )
                })}
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Visitas hoy</span>
                  </div>
                  <span className="text-sm font-bold">1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Carritos activos</span>
                  </div>
                  <span className="text-sm font-bold">89</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Productos bajos en stock</span>
                  </div>
                  <span className="text-sm font-bold text-orange-500">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Pedidos pendientes</span>
                  </div>
                  <span className="text-sm font-bold text-blue-500">23</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PanelLayout>
  )
}
