import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Number(searchParams.get("limit") ?? "10")

    const products = await prisma.product.findMany({
      take: Number.isFinite(limit) ? limit : 10,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ products })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch latest products" }, { status: 500 })
  }
}
