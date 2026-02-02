import { NextResponse, type NextRequest } from "next/server"

import { prisma } from "@/lib/db"
import { requireAdminId } from "@/lib/admin-session"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: { 
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }, 
        statusHistory: { orderBy: { createdAt: "asc" } } 
      },
    })

    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({ order })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to load order" }, { status: 500 })
  }
}
