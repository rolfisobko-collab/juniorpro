import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Number(searchParams.get("limit") ?? "8")

    const products = await prisma.product.findMany({
      where: { featured: true },
      take: Number.isFinite(limit) ? limit : 8,
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ products })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch featured products" }, { status: 500 })
  }
}
