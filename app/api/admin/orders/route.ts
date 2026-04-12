import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"
import { requireAdminId } from "@/lib/admin-session"

export async function GET() {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: { select: { id: true, name: true, image: true } } } },
        user: { select: { id: true, name: true, email: true } },
        statusHistory: { orderBy: { createdAt: "desc" }, take: 10 },
      },
      take: 300,
    })

    return NextResponse.json({ orders })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 })
  }
}
