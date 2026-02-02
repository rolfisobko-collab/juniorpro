import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"
import { requireAdminId } from "@/lib/admin-session"

export async function GET() {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const stats = await prisma.order.groupBy({
      by: ["status"],
      _count: {
        id: true
      }
    })

    const result = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      total: 0
    }

    stats.forEach(stat => {
      result[stat.status as keyof typeof result] = stat._count.id
      result.total += stat._count.id
    })

    return NextResponse.json({ stats: result })
  } catch (error) {
    console.error("Error fetching order stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
