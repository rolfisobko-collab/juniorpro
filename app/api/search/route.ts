import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get("q") ?? "").trim()

    if (!q) {
      return NextResponse.json({ products: [] })
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { brand: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 30,
      orderBy: [{ featured: "desc" }, { rating: "desc" }],
    })

    return NextResponse.json({ products }, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" }
    })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to search" }, { status: 500 })
  }
}
