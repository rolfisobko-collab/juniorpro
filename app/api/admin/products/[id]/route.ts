import { NextResponse, type NextRequest } from "next/server"

import { prisma } from "@/lib/db"
import { requireAdminId } from "@/lib/admin-session"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({ product })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to load product" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    const body = (await req.json()) as {
      name?: string
      brand?: string
      description?: string
      price?: number
      categoryKey?: string
      image?: string
      inStock?: boolean
      stockQuantity?: number
      featured?: boolean
    }

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.brand !== undefined ? { brand: body.brand } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(typeof body.price === "number" ? { price: body.price } : {}),
        ...(body.categoryKey !== undefined ? { categoryKey: body.categoryKey } : {}),
        ...(body.image !== undefined ? { image: body.image } : {}),
        ...(typeof body.stockQuantity === "number"
          ? {
              stockQuantity: body.stockQuantity,
              inStock: body.stockQuantity > 0,
            }
          : {}),
        ...(typeof body.inStock === "boolean" && body.stockQuantity === undefined ? { inStock: body.inStock } : {}),
        ...(typeof body.featured === "boolean" ? { featured: body.featured } : {}),
      },
    })

    return NextResponse.json({ product: updated })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    await prisma.product.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
