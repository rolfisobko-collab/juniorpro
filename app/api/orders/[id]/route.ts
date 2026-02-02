import { NextResponse, type NextRequest } from "next/server"

import { prisma } from "@/lib/db"
import { requireUserId } from "@/lib/auth-session"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    // Para el panel de administración, permitir ver cualquier orden
    const order = await prisma.order.findFirst({
      where: { id },
      include: { 
        items: true, 
        statusHistory: { orderBy: { createdAt: "asc" } },
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
    })

    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({ order })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to load order" }, { status: 500 })
  }
}
