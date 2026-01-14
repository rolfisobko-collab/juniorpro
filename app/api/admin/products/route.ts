import { NextResponse } from "next/server"
import crypto from "crypto"

import { prisma } from "@/lib/db"
import { requireAdminId } from "@/lib/admin-session"

export async function GET(req: Request) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const search = (searchParams.get("search") ?? "").trim()
    const categoryKey = (searchParams.get("category") ?? "").trim()

    const products = await prisma.product.findMany({
      where: {
        ...(categoryKey ? { categoryKey } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { brand: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: 500,
    })

    return NextResponse.json({ products })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

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

    if (!body.name || !body.brand || !body.description || typeof body.price !== "number" || !body.categoryKey || !body.image) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const created = await prisma.product.create({
      data: {
        id: crypto.randomUUID(),
        name: body.name,
        brand: body.brand,
        description: body.description,
        price: body.price,
        categoryKey: body.categoryKey,
        image: body.image,
        rating: 0,
        reviews: 0,
        inStock: body.inStock ?? (body.stockQuantity ?? 0) > 0,
        stockQuantity: body.stockQuantity ?? (body.inStock ? 50 : 0),
        featured: body.featured ?? false,
      },
    })

    return NextResponse.json({ product: created })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
