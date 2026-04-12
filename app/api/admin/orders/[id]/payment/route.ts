import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { requireAdminId } from "@/lib/admin-session"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const body = (await req.json()) as { paymentStatus?: string; paymentMethod?: string }

    if (!body.paymentStatus) {
      return NextResponse.json({ error: "Missing paymentStatus" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const updated = await prisma.order.update({
      where: { id },
      data: {
        paymentStatus: body.paymentStatus,
        ...(body.paymentMethod ? { paymentMethod: body.paymentMethod } : {}),
      },
    })

    await prisma.orderStatusHistory.create({
      data: {
        orderId: id,
        status: order.status,
        note: `Pago registrado: ${body.paymentStatus}${body.paymentMethod ? ` (${body.paymentMethod})` : ""}`,
        adminUserId: adminId,
      },
    })

    return NextResponse.json({ order: updated })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 })
  }
}
