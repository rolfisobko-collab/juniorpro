import { NextResponse, type NextRequest } from "next/server"

import { prisma } from "@/lib/db"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const category = await prisma.category.findFirst({
      where: {
        OR: [{ key: id }, { slug: id }],
      },
    })

    if (!category) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const products = await prisma.product.findMany({
      where: { categoryKey: category.key },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    })

    return NextResponse.json({ category, products })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch category products" }, { status: 500 })
  }
}
