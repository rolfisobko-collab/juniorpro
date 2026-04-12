import { NextResponse, type NextRequest } from "next/server"

import { prisma } from "@/lib/db"
import { requireAdminId } from "@/lib/admin-session"
import { sendOrderStatusEmail } from "@/lib/email-service"

async function handleStatusUpdate(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    const body = (await req.json()) as { status?: string; note?: string; trackingNumber?: string }
    const status = body.status

    if (!status || typeof status !== "string") {
      return NextResponse.json({ error: "Missing status" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const updateData: any = { status }
    if (body.trackingNumber) updateData.trackingNumber = body.trackingNumber

    const updated = await prisma.order.update({ where: { id: order.id }, data: updateData })

    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status,
        note: body.note ?? null,
        adminUserId: adminId,
      },
    })

    // Enviar email de notificación al cliente (no bloquea la respuesta)
    const contactEmail = order.contactEmail
    if (contactEmail && contactEmail !== "cliente@web.com") {
      sendOrderStatusEmail({
        to: contactEmail,
        orderId: order.id,
        status,
        trackingNumber: body.trackingNumber || (updated as any).trackingNumber || undefined,
        note: body.note,
      }).catch(err => console.error("Email notification error:", err))
    }

    return NextResponse.json({ order: updated })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
  }
}

export { handleStatusUpdate as PUT, handleStatusUpdate as PATCH }
