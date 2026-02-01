import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const count = await prisma.product.count()
    const recentProducts = await prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        codigo: true,
        stockQuantity: true,
        brand: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      count,
      recentProducts
    })
  } catch (error) {
    console.error('Error counting products:', error)
    return NextResponse.json({ error: 'Failed to count products' }, { status: 500 })
  }
}
