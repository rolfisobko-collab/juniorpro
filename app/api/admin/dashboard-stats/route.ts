import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    // Obtener estadísticas reales
    const [
      totalProducts,
      totalOrders,
      totalUsers,
      pendingOrders,
      lowStockProducts,
      recentOrders,
      todayOrders,
      monthOrders,
      completedOrders,
      totalCategories,
      outOfStockProducts
    ] = await Promise.all([
      // Total de productos (usando inStock en lugar de active)
      prisma.product.count({
        where: { inStock: true }
      }),
      
      // Total de órdenes
      prisma.order.count(),
      
      // Total de usuarios
      prisma.user.count(),
      
      // Órdenes pendientes
      prisma.order.count({
        where: { status: "pending" }
      }),
      
      // Productos con bajo stock (menos de 10 unidades)
      prisma.product.count({
        where: {
          inStock: true,
          stockQuantity: { lt: 10 }
        }
      }),
      
      // Órdenes recientes (últimas 5)
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      }),

      // Órdenes de hoy
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),

      // Órdenes del mes
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),

      // Órdenes completadas
      prisma.order.count({
        where: { status: "completed" }
      }),

      // Total de categorías
      prisma.category.count(),

      // Productos sin stock
      prisma.product.count({
        where: { inStock: false }
      })
    ])

    // Calcular estadísticas adicionales
    const totalRevenue = await prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ["completed", "processing"] } }
    })

    const averageOrderValue = await prisma.order.aggregate({
      _avg: { total: true },
      where: { status: { in: ["completed", "processing", "pending"] } }
    })

    const stats = {
      totalProducts,
      totalOrders,
      totalUsers,
      pendingOrders,
      lowStockProducts,
      outOfStockProducts,
      totalCategories,
      todayOrders,
      monthOrders,
      completedOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      averageOrderValue: averageOrderValue._avg.total || 0,
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        action: `Nuevo pedido #${order.id.slice(-8)}`,
        time: `Hace ${Math.floor((Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60))} horas`,
        customer: order.user?.name || order.user?.email || 'Cliente',
        total: order.total
      }))
    }

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    )
  }
}
