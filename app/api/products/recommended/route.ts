import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      take: 10,
      orderBy: [{ featured: "desc" }, { rating: "desc" }, { reviews: "desc" }],
    })

    return NextResponse.json({ products })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch recommended products" }, { status: 500 })
  }
}
