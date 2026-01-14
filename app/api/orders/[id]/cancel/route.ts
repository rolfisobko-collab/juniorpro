import { NextResponse, type NextRequest } from "next/server"

import { prisma } from "@/lib/db"
import { requireUserId } from "@/lib/auth-session"

export async function PUT(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    const order = await prisma.order.findFirst({ where: { id, userId } })
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })

    if (order.status === "cancelled" || order.status === "delivered") {
      return NextResponse.json({ error: "Cannot cancel" }, { status: 409 })
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: "cancelled" },
    })

    await prisma.orderStatusHistory.create({
      data: { orderId: order.id, status: "cancelled", note: "Cancelled by user" },
    })

    return NextResponse.json({ order: updated })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 })
  }
}
