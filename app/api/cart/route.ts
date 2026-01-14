import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"
import { requireUserId } from "@/lib/auth-session"

export async function GET() {
  try {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const cart = await prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
          include: { product: true },
        },
      },
    })

    const items = cart.items.map((i) => ({
      ...i.product,
      quantity: i.quantity,
    }))

    const total = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
    const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0)

    return NextResponse.json({ items, total, itemCount })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to load cart" }, { status: 500 })
  }
}
