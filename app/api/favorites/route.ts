import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"
import { requireUserId } from "@/lib/auth-session"

export async function GET() {
  try {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { product: true },
    })

    return NextResponse.json({
      favorites: favorites.map((f) => f.product),
    })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to load favorites" }, { status: 500 })
  }
}
