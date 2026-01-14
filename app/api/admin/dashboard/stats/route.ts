import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"
import { requireAdminId } from "@/lib/admin-session"

export async function GET() {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [
      totalOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenueAgg,
      totalProducts,
      inStockProducts,
      totalUsers,
      abandonedCarts,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "processing" } }),
      prisma.order.count({ where: { status: "shipped" } }),
      prisma.order.count({ where: { status: "delivered" } }),
      prisma.order.count({ where: { status: "cancelled" } }),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.product.count(),
      prisma.product.count({ where: { inStock: true } }),
      prisma.user.count(),
      prisma.cart.count({
        where: {
          updatedAt: {
            lt: new Date(Date.now() - 1000 * 60 * 60 * 24),
          },
        },
      }),
    ])

    const totalRevenue = totalRevenueAgg._sum.total ?? 0

    return NextResponse.json({
      orders: {
        total: totalOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      revenue: {
        total: totalRevenue,
      },
      products: {
        total: totalProducts,
        inStock: inStockProducts,
      },
      users: {
        total: totalUsers,
      },
      carts: {
        abandonedOver24h: abandonedCarts,
      },
    })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 })
  }
}
