import { NextResponse, type NextRequest } from "next/server"

import { prisma } from "@/lib/db"
import { requireAdminId } from "@/lib/admin-session"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    const body = (await req.json()) as { status?: string; note?: string }
    const status = body.status

    if (!status || typeof status !== "string") {
      return NextResponse.json({ error: "Missing status" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const updated = await prisma.order.update({ where: { id: order.id }, data: { status } })

    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status,
        note: body.note ?? null,
        adminUserId: adminId,
      },
    })

    return NextResponse.json({ order: updated })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
  }
}
