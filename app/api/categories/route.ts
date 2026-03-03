import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { subcategories: true },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(categories, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" }
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}
