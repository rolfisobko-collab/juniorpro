import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"
import { requireAdminId } from "@/lib/admin-session"

export async function GET() {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const carts = await prisma.cart.findMany({
      include: {
        user: { select: { email: true, name: true } },
        items: { include: { product: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 200,
    })

    const now = Date.now()

    const result = carts.map((c) => {
      const total = c.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
      const abandonedAt = c.updatedAt
      const daysSinceAbandoned = Math.max(0, Math.floor((now - abandonedAt.getTime()) / (1000 * 60 * 60 * 24)))

      return {
        id: c.id,
        userEmail: c.user.email,
        userName: c.user.name,
        items: c.items.map((i) => ({
          productName: i.product.name,
          quantity: i.quantity,
          price: i.product.price,
        })),
        total,
        abandonedAt,
        daysSinceAbandoned,
      }
    })

    return NextResponse.json({ carts: result })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to load carts" }, { status: 500 })
  }
}
